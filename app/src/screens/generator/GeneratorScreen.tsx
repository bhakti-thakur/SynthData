import React, { useMemo, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { ScrollView, StyleSheet, Text, View } from "react-native";
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
                <Text style={styles.uploadText}>Real Dataset (CSV or JSON upto 50MB)</Text>
                <Button label="Browse" variant="secondary" style={styles.browseButton} />
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
              <View style={styles.uploadBoxLarge}>
                <View style={styles.uploadRow}>
                  <Ionicons name="add" size={18} color={colors.textMuted} />
                  <Text style={styles.uploadText}>Upload your Schema</Text>
                </View>
                <Button label="Browse" variant="secondary" style={styles.browseButton} />
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
    padding: spacing.md,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
    minHeight: 160,
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
