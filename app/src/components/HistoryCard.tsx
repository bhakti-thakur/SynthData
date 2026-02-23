import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Card } from "./Card";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";
import { HistoryItem } from "../types/data";

type HistoryCardProps = HistoryItem & {
  onDownload?: () => void;
};

export function HistoryCard({
  id,
  timestamp,
  source,
  output,
  onDownload,
}: HistoryCardProps) {
  return (
    <Card style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.titleRow}>
          <Ionicons name="server" size={20} color={colors.textPrimary} />
          <Text style={styles.title}>{id}</Text>
        </View>
        {onDownload ? (
          <Pressable onPress={onDownload} style={styles.downloadButton}>
            <Ionicons name="download" size={18} color={colors.textPrimary} />
          </Pressable>
        ) : null}
      </View>
      <Text style={styles.timestamp}>{timestamp}</Text>
      <View style={styles.mappingRow}>
        <View style={styles.mappingBlock}>
          <Text style={styles.mappingLabel}>Activity:</Text>
          <Text style={styles.mappingValue}>{source}</Text>
        </View>
        {/* <Ionicons name="arrow-forward" size={18} color={colors.textPrimary} /> */}
        <View style={styles.mappingBlock}>
          <Text style={styles.mappingLabel}>Output ID:</Text>
          <Text style={styles.mappingValue}>{output}</Text>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  title: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.size.lg,
    color: colors.textPrimary,
  },
  downloadButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  timestamp: {
    marginTop: spacing.sm,
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.size.sm,
    color: colors.textMuted,
  },
  mappingRow: {
    marginTop: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  mappingBlock: {
    flex: 1,
    gap: spacing.xs,
  },
  mappingLabel: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.size.sm,
    color: colors.textMuted,
  },
  mappingValue: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.size.md,
    color: colors.textPrimary,
  },
});
