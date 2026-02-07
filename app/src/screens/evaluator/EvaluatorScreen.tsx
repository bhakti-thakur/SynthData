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

export function EvaluatorScreen() {
  const segments = useMemo(() => ["Statistical", "Schema Check"], []);
  const [activeSegment, setActiveSegment] = useState(segments[0]);

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
          <View style={styles.uploadBox}>
            <View style={styles.uploadRow}>
              <Ionicons name="add" size={18} color={colors.textMuted} />
              <Text style={styles.uploadText}>Upload your real dataset</Text>
            </View>
          </View>

          <Text style={styles.cardTitle}>Synthetic Dataset</Text>
          <View style={styles.uploadBox}>
            <View style={styles.uploadRow}>
              <Ionicons name="add" size={18} color={colors.textMuted} />
              <Text style={styles.uploadText}>Upload your synthetic dataset</Text>
            </View>
          </View>
          <Text style={styles.orText}> OR </Text>
          <View style={styles.inputsGroup}>
            <Input 
            style={styles.orText}
              label="Synthetic Dataset ID"
              placeholder="Type your synthetic dataset ID"
            />
          </View>
        </Card>

        <Button label="Check" style={styles.primaryCta} />
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
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: spacing.md,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg,
  },
  uploadRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  uploadText: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.size.md,
    color: colors.textMuted,
  },
  inputsGroup: {
    color: colors.textPrimary,
    gap: spacing.md,
  },
  primaryCta: {
    marginTop: spacing.xl,
    marginHorizontal: spacing.xl,
  },
});
