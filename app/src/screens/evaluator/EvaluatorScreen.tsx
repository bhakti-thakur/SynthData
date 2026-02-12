import React, { useMemo, useState } from "react";
import type { DocumentPickerAsset } from "expo-document-picker";
import { Alert, Platform, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import {
  EvaluationResultCard,
  SchemaEvaluationResult,
  StatisticalEvaluationResult,
} from "../../components/EvaluationResultCard";
import { Input } from "../../components/Input";
import { Screen } from "../../components/Screen";
import { SegmentedControl } from "../../components/SegmentedControl";
import { UploadField } from "../../components/UploadField";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";
import { typography } from "../../theme/typography";

export function EvaluatorScreen() {
  const segments = useMemo(() => ["Statistical", "Schema Check"], []);
  const [activeSegment, setActiveSegment] = useState(segments[0]);
  const [realFileName, setRealFileName] = useState<string | null>(null);
  const [syntheticFileName, setSyntheticFileName] = useState<string | null>(null);
  const [schemaFileName, setSchemaFileName] = useState<string | null>(null);
  const [realFile, setRealFile] = useState<DocumentPickerAsset | null>(null);
  const [syntheticFile, setSyntheticFile] = useState<DocumentPickerAsset | null>(null);
  const [schemaFile, setSchemaFile] = useState<DocumentPickerAsset | null>(null);
  const [schemaText, setSchemaText] = useState("");
  const [datasetId, setDatasetId] = useState("");
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<
    StatisticalEvaluationResult | SchemaEvaluationResult | null
  >(null);

  const handleEvaluate = async () => {
    const baseUrl = "http://localhost:8000";
    console.log("handleEvaluate called, activeSegment:", activeSegment);
    if (isEvaluating) {
      return;
    }

    if (activeSegment === "Statistical") {
      console.log("Statistical mode - realFile:", realFile, "syntheticFile:", syntheticFile, "datasetId:", datasetId);
      if (!realFile) {
        Alert.alert("Missing data", "Please upload a real dataset.");
        return;
      }
      if (!syntheticFile && datasetId.trim().length === 0) {
        Alert.alert("Missing data", "Please upload a synthetic dataset or enter dataset ID.");
        return;
      }

      const formData = new FormData();

      if (Platform.OS === "web") {
        if (!realFile.file) {
          console.log("Evaluate error", "Missing web real file", realFile);
          Alert.alert("Evaluation failed", "Invalid real file selection.");
          return;
        }
        formData.append("real_file", realFile.file);
      } else {
        if (!realFile.uri || !realFile.name || !realFile.mimeType) {
          console.log("Evaluate error", "Missing real file metadata", realFile);
          Alert.alert("Evaluation failed", "Invalid real file selection.");
          return;
        }
        const realUri =
          realFile.uri.startsWith("file://") || realFile.uri.startsWith("content://")
            ? realFile.uri
            : `file://${realFile.uri}`;
        formData.append(
          "real_file",
          {
            uri: realUri,
            name: realFile.name,
            type: realFile.mimeType,
          } as any,
        );
      }

      if (syntheticFile) {
        if (Platform.OS === "web") {
          if (!syntheticFile.file) {
            console.log("Evaluate error", "Missing web synthetic file", syntheticFile);
            Alert.alert("Evaluation failed", "Invalid synthetic file selection.");
            return;
          }
          formData.append("synthetic_file", syntheticFile.file);
        } else {
          if (!syntheticFile.uri || !syntheticFile.name || !syntheticFile.mimeType) {
            console.log("Evaluate error", "Missing synthetic file metadata", syntheticFile);
            Alert.alert("Evaluation failed", "Invalid synthetic file selection.");
            return;
          }
          const synthUri =
            syntheticFile.uri.startsWith("file://") || syntheticFile.uri.startsWith("content://")
              ? syntheticFile.uri
              : `file://${syntheticFile.uri}`;
          formData.append(
            "synthetic_file",
            {
              uri: synthUri,
              name: syntheticFile.name,
              type: syntheticFile.mimeType,
            } as any,
          );
        }
      } else if (datasetId.trim().length > 0) {
        formData.append("dataset_id", datasetId.trim());
      }

      try {
        setIsEvaluating(true);
        const response = await fetch(`${baseUrl}/evaluate`, {
          method: "POST",
          body: formData,
        });
        const payload = await response.json();
        if (!response.ok) {
          console.log("Evaluate error", payload);
          Alert.alert("Evaluation failed", payload?.detail ?? "Request failed");
          return;
        }
        setEvaluationResult(payload);
      } catch (error) {
        console.log("Evaluate error", error);
        Alert.alert("Evaluation failed", "Unable to reach server.");
      } finally {
        setIsEvaluating(false);
      }
    } else {
      console.log(
        "Schema Check mode - schemaFile:",
        schemaFile,
        "schemaText length:",
        schemaText.length,
        "syntheticFile:",
        syntheticFile,
        "datasetId:",
        datasetId,
      );

      let schemaPayload = schemaText.trim();
      if (schemaPayload.length === 0) {
        if (!schemaFile) {
          Alert.alert("Missing data", "Please upload a schema file or paste schema JSON.");
          return;
        }

        if (Platform.OS === "web") {
          if (!schemaFile.file) {
            console.log("Evaluate error", "Missing web schema file", schemaFile);
            Alert.alert("Evaluation failed", "Invalid schema file selection.");
            return;
          }
          schemaPayload = await schemaFile.file.text();
        } else {
          if (!schemaFile.uri) {
            console.log("Evaluate error", "Missing schema file uri", schemaFile);
            Alert.alert("Evaluation failed", "Invalid schema file selection.");
            return;
          }
          const schemaUri =
            schemaFile.uri.startsWith("file://") || schemaFile.uri.startsWith("content://")
              ? schemaFile.uri
              : `file://${schemaFile.uri}`;
          const schemaResponse = await fetch(schemaUri);
          schemaPayload = await schemaResponse.text();
        }
      }

      if (!syntheticFile && datasetId.trim().length === 0) {
        Alert.alert("Missing data", "Please upload a synthetic dataset or enter dataset ID.");
        return;
      }

      const formData = new FormData();
      formData.append("data_schema", schemaPayload);

      if (syntheticFile) {
        if (Platform.OS === "web") {
          if (!syntheticFile.file) {
            console.log("Evaluate error", "Missing web synthetic file", syntheticFile);
            Alert.alert("Evaluation failed", "Invalid synthetic file selection.");
            return;
          }
          formData.append("synthetic_file", syntheticFile.file);
        } else {
          if (!syntheticFile.uri || !syntheticFile.name || !syntheticFile.mimeType) {
            console.log("Evaluate error", "Missing synthetic file metadata", syntheticFile);
            Alert.alert("Evaluation failed", "Invalid synthetic file selection.");
            return;
          }
          const synthUri =
            syntheticFile.uri.startsWith("file://") || syntheticFile.uri.startsWith("content://")
              ? syntheticFile.uri
              : `file://${syntheticFile.uri}`;
          formData.append(
            "synthetic_file",
            {
              uri: synthUri,
              name: syntheticFile.name,
              type: syntheticFile.mimeType,
            } as any,
          );
        }
      } else {
        formData.append("dataset_id", datasetId.trim());
      }

      try {
        setIsEvaluating(true);
        const response = await fetch(`${baseUrl}/evaluate`, {
          method: "POST",
          body: formData,
        });
        const payload = await response.json();
        if (!response.ok) {
          console.log("Evaluate error", payload);
          Alert.alert("Evaluation failed", payload?.detail ?? "Request failed");
          return;
        }
        setEvaluationResult(payload);
      } catch (error) {
        console.log("Evaluate error", error);
        Alert.alert("Evaluation failed", "Unable to reach server.");
      } finally {
        setIsEvaluating(false);
      }
    }
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Evaluator</Text>
        </View>

        <SegmentedControl
          options={segments}
          value={activeSegment}
          onChange={setActiveSegment}
          style={styles.segmented}
        />

        <Card>
          <Text style={styles.cardTitle}>
            {activeSegment === "Statistical" ? "Real Data" : "Schema"}
          </Text>
          <UploadField
            placeholder={
              activeSegment === "Statistical"
                ? "Upload your real dataset"
                : "Upload your schema"
            }
            types={["text/csv", "application/json"]}
            iconName="add"
            value={activeSegment === "Statistical" ? realFileName : schemaFileName}
            onChangeFileName={activeSegment === "Statistical" ? setRealFileName : setSchemaFileName}
            onPickAsset={activeSegment === "Statistical" ? setRealFile : setSchemaFile}
            boxStyle={styles.uploadBox}
          />

          {activeSegment === "Schema Check" && (
            <>
              <Text style={styles.orText}> OR </Text>
              <TextInput
                placeholder="Paste your schema (JSON)"
                placeholderTextColor={colors.textMuted}
                value={schemaText}
                onChangeText={(text) => {
                  setSchemaText(text);
                  if (text.length > 0) {
                    setSchemaFileName(null);
                  }
                }}
                multiline
                textAlignVertical="top"
                style={styles.schemaInput}
              />
            </>
          )}

          {activeSegment === "Statistical" && (
            <>
              <Text style={styles.cardTitle}>Synthetic Dataset</Text>
              <UploadField
                placeholder="Upload your synthetic dataset"
                types={["text/csv", "application/json"]}
                iconName="add"
                value={syntheticFileName}
                onChangeFileName={setSyntheticFileName}
                onPickAsset={setSyntheticFile}
                boxStyle={styles.uploadBox}
              />
              <Text style={styles.orText}> OR </Text>
            </>
          )}
          {activeSegment === "Schema Check" && (
            <>
              <Text style={styles.cardTitle}>Synthetic Dataset</Text>
              <UploadField
                placeholder="Upload your synthetic dataset"
                types={["text/csv", "application/json"]}
                iconName="add"
                value={syntheticFileName}
                onChangeFileName={setSyntheticFileName}
                onPickAsset={setSyntheticFile}
                boxStyle={styles.uploadBox}
              />
              <Text style={styles.orText}> OR </Text>
            </>
          )}
          <View style={styles.inputsGroup}>
            <Input
              style={styles.orText}
              label={activeSegment === "Statistical" ? "Synthetic Dataset ID" : "Dataset ID"}
              placeholder={
                activeSegment === "Statistical" ? "Type your synthetic dataset ID" : "Type your dataset ID"
              }
              value={datasetId}
              onChangeText={setDatasetId}
            />
          </View>
        </Card>

        <Button label="Check" style={styles.primaryCta} onPress={handleEvaluate} disabled={isEvaluating} />
        {evaluationResult ? <EvaluationResultCard result={evaluationResult} /> : null}
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
  cardTitle: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.size.lg,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  orText: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.size.md,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  uploadBox: {
    marginBottom: spacing.lg,
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
    color: colors.textPrimary,
    gap: spacing.md,
  },
  primaryCta: {
    marginVertical: spacing.xl,
    marginHorizontal: spacing.xl,
  },
});
