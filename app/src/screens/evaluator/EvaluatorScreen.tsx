import React, { useEffect, useMemo, useRef, useState } from "react";
import type { DocumentPickerAsset } from "expo-document-picker";
import { Alert, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { evaluate } from "../../api/content";
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
  const scrollViewRef = useRef<ScrollView>(null);
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

  useEffect(() => {
    // Reset all form fields and result when segment changes
    setRealFile(null);
    setRealFileName(null);
    setSyntheticFile(null);
    setSyntheticFileName(null);
    setSchemaFile(null);
    setSchemaFileName(null);
    setSchemaText("");
    setDatasetId("");
    setEvaluationResult(null);
  }, [activeSegment]);

  const handleEvaluate = async () => {
    console.log("handleEvaluate called, activeSegment:", activeSegment);
    if (isEvaluating) {
      return;
    }

    try {
      setIsEvaluating(true);
      const payload = await evaluate({
        activeSegment: activeSegment as "Statistical" | "Schema Check",
        realFile,
        syntheticFile,
        schemaFile,
        schemaText,
        datasetId,
      });

      setEvaluationResult(payload);
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
    } catch (error) {
      console.log("Evaluate error", error);
      const message = error instanceof Error ? error.message : "Unable to reach server.";
      if (
        message === "Please upload a real dataset." ||
        message === "Please upload a synthetic dataset or enter dataset ID." ||
        message === "Please upload a schema file or paste schema JSON."
      ) {
        Alert.alert("Missing data", message);
      } else {
        Alert.alert("Evaluation failed", message);
      }
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <Screen>
      <ScrollView ref={scrollViewRef} contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
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
