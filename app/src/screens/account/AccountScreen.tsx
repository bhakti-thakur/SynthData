import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Card } from "../../components/Card";
import { HistoryCard } from "../../components/HistoryCard";
import { Screen } from "../../components/Screen";
import { mockAccount } from "../../data/mockAccount";
import { mockHistory } from "../../data/mockHistory";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";
import { typography } from "../../theme/typography";

export function AccountScreen() {
  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Hey User</Text>
          <View style={styles.avatar}>
            <Ionicons name="person" size={28} color={colors.textPrimary} />
          </View>
        </View>

        <Card style={styles.profileCard}>
          <Text style={styles.profileText}>{mockAccount.email}</Text>
          <Text style={styles.profileText}>Profile: {mockAccount.profile}</Text>
          <Text style={styles.profileText}>{mockAccount.phone}</Text>
        </Card>

        <Text style={styles.sectionTitle}>History</Text>
        <View style={styles.historyList}>
          {mockHistory.map((item) => (
            <HistoryCard
              key={`${item.id}-${item.timestamp}`}
              id={item.id}
              timestamp={item.timestamp}
              source={item.source}
              output={item.output}
            />
          ))}
        </View>

        <Text style={styles.sectionTitle}>Account Settings</Text>
        <View style={styles.settingsList}>
          <Text style={styles.settingsItem}>Logout</Text>
          <Text style={[styles.settingsItem, styles.deleteText]}>Delete Account</Text>
        </View>

        <Text style={styles.footerText}>Scroll down to know more about us.</Text>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingBottom: spacing.xxl,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.lg,
  },
  title: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.size.xxl,
    color: colors.textPrimary,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: colors.textPrimary,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.card,
  },
  profileCard: {
    gap: spacing.sm,
  },
  profileText: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.size.md,
    color: colors.textPrimary,
  },
  sectionTitle: {
    marginTop: spacing.xl,
    marginBottom: spacing.md,
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.size.lg,
    color: colors.textPrimary,
  },
  historyList: {
    gap: spacing.md,
  },
  settingsList: {
    gap: spacing.sm,
  },
  settingsItem: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.size.md,
    color: colors.textPrimary,
  },
  deleteText: {
    color: colors.danger,
  },
  footerText: {
    marginTop: spacing.xl,
    textAlign: "center",
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.size.sm,
    color: colors.textMuted,
  },
});
