import React, { useMemo, useState } from "react";
import type { DocumentPickerAsset } from "expo-document-picker";
import { Alert, Linking, Platform, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { GenerationResultCard } from "../../components/GenerationResultCard";
import { Input } from "../../components/Input";
import { Screen } from "../../components/Screen";
import { SegmentedControl } from "../../components/SegmentedControl";
import { UploadField } from "../../components/UploadField";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";
import { typography } from "../../theme/typography";

export function GeneratorScreen() {
  const segments = useMemo(() => ["Model", "Schema"], []);
  const [activeSegment, setActiveSegment] = useState(segments[0]);
  const [modelFileName, setModelFileName] = useState<string | null>(null);
  const [schemaFileName, setSchemaFileName] = useState<string | null>(null);
  const [schemaText, setSchemaText] = useState("");
  const [modelFile, setModelFile] = useState<DocumentPickerAsset | null>(null);
  const [schemaFile, setSchemaFile] = useState<DocumentPickerAsset | null>(null);
  const [rows, setRows] = useState("");
  const [batchSize, setBatchSize] = useState("");
  const [epochs, setEpochs] = useState("");
  const [schemaRows, setSchemaRows] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationResult, setGenerationResult] = useState<{
    dataset_id: string;
    download_url: string;
  } | null>(null);

  const handleDownload = async (url: string) => {
    const baseUrl = "http://localhost:8000";
    const resolvedUrl = url.startsWith("/") ? `${baseUrl}${url}` : url;
    try {
      await Linking.openURL(resolvedUrl);
    } catch (error) {
      console.log("Download error", error);
      Alert.alert("Download failed", "Unable to open download link.");
    }
  };

  const handleGenerate = async () => {
    const baseUrl = "http://localhost:8000";
    if (isGenerating) {
      return;
    }

    if (activeSegment === "Model") {
      const nRows = Number(rows);
      const batch = Number(batchSize);
      const epochCount = Number(epochs);
      if (!modelFile || Number.isNaN(nRows) || Number.isNaN(batch) || Number.isNaN(epochCount)) {
        Alert.alert("Missing data", "Please select a file and fill in all fields.");
        return;
      }

      if (!modelFile.uri || !modelFile.name || !modelFile.mimeType) {
        console.log("Generate error", "Missing file metadata", modelFile);
        Alert.alert("Generate failed", "Invalid file selection.");
        return;
      }

      const fileUri =
        modelFile.uri.startsWith("file://") || modelFile.uri.startsWith("content://")
          ? modelFile.uri
          : `file://${modelFile.uri}`;

      const formData = new FormData();
      if (Platform.OS === "web") {
        if (!modelFile.file) {
          console.log("Generate error", "Missing web file object", modelFile);
          Alert.alert("Generate failed", "Invalid file selection.");
          return;
        }
        formData.append("file", modelFile.file);
      } else {
        formData.append(
          "file",
          {
            uri: fileUri,
            name: modelFile.name,
            type: modelFile.mimeType,
          } as any,
        );
      }
      formData.append("n_rows", String(nRows));
      formData.append("epochs", String(epochCount));
      formData.append("batch_size", String(batch));
      formData.append("apply_constraints", "true");

      try {
        setIsGenerating(true);
        const response = await fetch(`${baseUrl}/generate`, {
          method: "POST",
          body: formData,
        });
        const payload = await response.json();
        if (!response.ok) {
          console.log("Generate error", payload);
          Alert.alert("Generate failed", payload?.detail ?? "Request failed");
          return;
        }
        setGenerationResult({
          dataset_id: payload.dataset_id,
          download_url: payload.download_url,
        });
        console.log("Generate success", payload);
      } catch (error) {
        console.log("Generate error", error);
        Alert.alert("Generate failed", "Unable to reach server.");
      } finally {
        setIsGenerating(false);
      }
    } else {
      const nRows = Number(schemaRows);
      if (schemaText.trim().length === 0 || Number.isNaN(nRows)) {
        Alert.alert("Missing data", "Please paste schema JSON and enter rows.");
        return;
      }

      const formData = new FormData();
      formData.append("schema", schemaText);
      formData.append("n_rows", String(nRows));

      try {
        setIsGenerating(true);
        const response = await fetch(`${baseUrl}/generate`, {
          method: "POST",
          body: formData,
        });
        const payload = await response.json();
        if (!response.ok) {
          console.log("Generate error", payload);
          Alert.alert("Generate failed", payload?.detail ?? "Request failed");
          return;
        }
        setGenerationResult({
          dataset_id: payload.dataset_id,
          download_url: payload.download_url,
        });
        console.log("Generate success", payload);
      } catch (error) {
        console.log("Generate error", error);
        Alert.alert("Generate failed", "Unable to reach server.");
      } finally {
        setIsGenerating(false);
      }
    }
  };

  const handleSchemaTextChange = (text: string) => {
    setSchemaText(text);
    if (text.length > 0) {
      setSchemaFileName(null);
    }
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Generator</Text>
        </View>

        <SegmentedControl
          options={segments}
          value={activeSegment}
          onChange={setActiveSegment}
          style={styles.segmented}
        />

        {activeSegment === "Model" ? (
          <View style={styles.section}>
            <Card>
              <Text style={styles.cardTitle}>Data Configuration</Text>
              <UploadField
                placeholder="Real Dataset (CSV or JSON)"
                types={["text/csv", "application/json"]}
                iconName="document"
                value={modelFileName}
                onChangeFileName={setModelFileName}
                onPickAsset={setModelFile}
                boxStyle={styles.uploadBox}
              />
              <View style={styles.inputsGroup}>
                <Input label="Number of Rows" placeholder="100" value={rows} onChangeText={setRows} />
                <Input label="Batch Size" placeholder="100" value={batchSize} onChangeText={setBatchSize} />
                <Input label="Epochs" placeholder="100" value={epochs} onChangeText={setEpochs} />
              </View>
            </Card>

            <Button
              label={isGenerating ? "Generating..." : "Generate Synthetic Data"}
              style={styles.primaryCta}
              onPress={handleGenerate}
              disabled={isGenerating}
            />
            {generationResult ? (
              <GenerationResultCard
                datasetId={generationResult.dataset_id}
                onDownload={() => handleDownload(generationResult.download_url)}
              />
            ) : null}
          </View>
        ) : (
          <View style={styles.section}>
            <Card>
              <Text style={styles.cardTitle}>Enter Your Schema</Text>
              <UploadField
                placeholder={schemaText.length > 0 ? "Pasted schema" : "Upload your Schema (JSON)"}
                types={["application/json", "text/plain"]}
                iconName="add"
                value={schemaFileName}
                onChangeFileName={(name) => {
                  setSchemaFileName(name);
                  if (name) {
                    setSchemaText("");
                  }
                }}
                onPickAsset={setSchemaFile}
                boxStyle={styles.uploadBoxLarge}
              />
              <Text style={styles.orText}> OR </Text>
              <TextInput
                placeholder="Paste your schema (JSON)"
                placeholderTextColor={colors.textMuted}
                value={schemaText}
                onChangeText={handleSchemaTextChange}
                multiline
                textAlignVertical="top"
                style={styles.schemaInput}
              />
              <View style={styles.inputsGroup}>
                <Input label="Number of Rows" placeholder="100" value={schemaRows} onChangeText={setSchemaRows} />
              </View>
            </Card>

            <Button
              label={isGenerating ? "Generating..." : "Generate Synthetic Data"}
              style={styles.primaryCta}
              onPress={handleGenerate}
              disabled={isGenerating}
            />
            {generationResult ? (
              <GenerationResultCard
                datasetId={generationResult.dataset_id}
                onDownload={() => handleDownload(generationResult.download_url)}
              />
            ) : null}
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingBottom: spacing.xxl,
  },
  header: {
    marginBottom: spacing.lg,
  },
  title: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.size.xxl,
    color: colors.textPrimary,
    alignSelf: "center",
  },
  segmented: {
    alignSelf: "center",
    marginBottom: spacing.xl,
  },
  section: {
    gap: spacing.xl,
  },
  cardTitle: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.size.lg,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  uploadBox: {
    marginBottom: spacing.lg,
  },
  uploadBoxLarge: {
    minHeight: 100,
    marginBottom: spacing.lg,
  },
  orText: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.size.md,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  schemaInput: {
    width: "100%",
    minHeight: 90,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: spacing.sm,
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.size.sm,
    color: colors.textPrimary,
    backgroundColor: colors.card,
    marginBottom: spacing.md,
  },
  inputsGroup: {
    gap: spacing.md,
  },
  primaryCta: {
    marginHorizontal: spacing.xl,
  },
});
