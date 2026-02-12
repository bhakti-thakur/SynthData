import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Card } from "./Card";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";

type GenerationResultCardProps = {
  datasetId: string;
  downloadLabel?: string;
  onDownload?: () => void;
};

export function GenerationResultCard({
  datasetId,
  downloadLabel = "Download CSV",
  onDownload,
}: GenerationResultCardProps) {
  return (
    <Card style={styles.card}>
      <View style={styles.headerRow}>
        <Ionicons name="checkmark-circle" size={18} color={colors.textPrimary} />
        <Text style={styles.headerText}>Generation Complete</Text>
      </View>
      <Text style={styles.datasetText}>Dataset ID: {datasetId}</Text>
      <Pressable style={styles.downloadRow} onPress={onDownload}>
        <Text style={styles.downloadText}>{downloadLabel}</Text>
        <Ionicons name="download" size={18} color={colors.textPrimary} />
      </Pressable>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  headerText: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.size.md,
    color: colors.textPrimary,
  },
  datasetText: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.size.md,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  downloadRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  downloadText: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.size.md,
    color: colors.textPrimary,
  },
});
