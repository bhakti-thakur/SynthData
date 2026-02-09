import React, { useMemo, useState } from "react";
import * as DocumentPicker from "expo-document-picker";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { Input } from "../../components/Input";
import { Screen } from "../../components/Screen";
import { SegmentedControl } from "../../components/SegmentedControl";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";
import { typography } from "../../theme/typography";

export function GeneratorScreen() {
  const segments = useMemo(() => ["Model", "Schema"], []);
  const [activeSegment, setActiveSegment] = useState(segments[0]);
  const [modelFileName, setModelFileName] = useState<string | null>(null);
  const [schemaFileName, setSchemaFileName] = useState<string | null>(null);
  const [schemaText, setSchemaText] = useState("");

  const handlePickModel = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ["text/csv", "application/json"],
      copyToCacheDirectory: true,
    });

    if (result.canceled || result.assets.length === 0) {
      return;
    }

    setModelFileName(result.assets[0].name ?? "Selected file");
  };

  const handlePickSchema = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ["application/json", "text/plain"],
      copyToCacheDirectory: true,
    });

    if (result.canceled || result.assets.length === 0) {
      return;
    }

    setSchemaFileName(result.assets[0].name ?? "Selected file");
    setSchemaText("");
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
              <View style={styles.uploadBox}>
                <Ionicons name="document" size={22} color={colors.textMuted} />
                {modelFileName ? (
                  <Text style={styles.fileName}>{modelFileName}</Text>
                ) : (
                  <Text style={styles.uploadText}>Real Dataset (CSV or JSON)</Text>
                )}
                {modelFileName ? (
                  <Pressable
                    onPress={() => setModelFileName(null)}
                    style={styles.trashButton}
                  >
                    <Ionicons name="trash-outline" size={18} color={colors.textPrimary} />
                  </Pressable>
                ) : (
                  <Button
                    label="Browse"
                    variant="secondary"
                    style={styles.browseButton}
                    onPress={handlePickModel}
                  />
                )}
              </View>
              <View style={styles.inputsGroup}>
                <Input label="Number of Rows" placeholder="100" />
                <Input label="Batch Size" placeholder="100" />
                <Input label="Epochs" placeholder="100" />
              </View>
            </Card>

            <Button label="Generate Synthetic Data" style={styles.primaryCta} />
          </View>
        ) : (
          <View style={styles.section}>
            <Card>
              <Text style={styles.cardTitle}>Enter Your Schema</Text>
              <TextInput
                placeholder="Paste your schema (JSON)"
                placeholderTextColor={colors.textMuted}
                value={schemaText}
                onChangeText={handleSchemaTextChange}
                multiline
                textAlignVertical="top"
                style={styles.schemaInput}
              />
              <Text style={styles.orText}> OR </Text>
              <View style={styles.uploadBoxLarge}>
                {/* <View style={styles.uploadRow}>
                  <Ionicons name="add" size={18} color={colors.textMuted} />
                  <Text style={styles.uploadText}>Upload your Schema</Text>
                </View> */}
                
                {schemaFileName ? (
                  <Text style={styles.fileName}>{schemaFileName}</Text>
                ) : schemaText.length > 0 ? (
                  <Text style={styles.fileName}>Pasted schema</Text>
                ) : (
                  <Text style={styles.uploadText}>Upload your Schema (JSON)</Text>
                )}
                {schemaFileName || schemaText.length > 0 ? (
                  <Pressable
                    onPress={() => {
                      setSchemaFileName(null);
                      setSchemaText("");
                    }}
                    style={styles.trashButton}
                  >
                    <Ionicons name="trash-outline" size={18} color={colors.textPrimary} />
                  </Pressable>
                ) : (
                  <Button
                    label="Browse"
                    variant="secondary"
                    style={styles.browseButton}
                    onPress={handlePickSchema}
                  />
                )}
              </View>
              <View style={styles.inputsGroup}>
                <Input label="Number of Rows" placeholder="100" />
              </View>
            </Card>

            <Button label="Generate Synthetic Data" style={styles.primaryCta} />
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
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: spacing.md,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  uploadBoxLarge: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: spacing.sm,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
    minHeight: 100,
    marginBottom: spacing.lg,
  },
  uploadRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  uploadText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.size.md,
    color: colors.textMuted,
    textAlign: "center",
  },
  orText: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.size.md,
    color: colors.textPrimary,
    marginVertical: spacing.md,
  },
  fileName: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.size.md,
    color: colors.textPrimary,
    textAlign: "center",
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
  },
  trashButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  browseButton: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 10,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  inputsGroup: {
    gap: spacing.md,
  },
  primaryCta: {
    marginHorizontal: spacing.xl,
  },
});
