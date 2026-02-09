import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
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
    <Screen contentStyle={styles.screenContent}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.paddedContent}>
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
        </View>

        <View style={styles.footer}>
          <View style={styles.footerSection}>
            <Text style={styles.footerTitle}>About</Text>
            <Pressable style={styles.footerLink}>
              <Text style={styles.footerLinkText}>• Developed as a B.E. Computer Engineering Final Year Project</Text>
            </Pressable>
            <Pressable style={styles.footerLink}>
              <Text style={styles.footerLinkText}>• Published as a Conference Paper</Text>
            </Pressable>
            <Pressable style={styles.footerLink}>
              <Text style={styles.footerLinkText}>• Guided by Dr. S. R. Khonde</Text>
            </Pressable>
          </View>

          <View style={styles.footerSection}>
            <Text style={styles.footerTitle}>Motivation</Text>
              <Text style={styles.footerLinkText}>• Real-world data is restricted due to privacy & ethics</Text>
              <Text style={styles.footerLinkText}>• Synthetic data enables safe AI development</Text>
          </View>

          <View style={styles.footerSection}>
            <Text style={styles.footerTitle}>Objective</Text>
              <Text style={styles.footerLinkText}>• Hybrid synthetic data generation</Text>
              <Text style={styles.footerLinkText}>• Data quality & privacy validation</Text>
              <Text style={styles.footerLinkText}>• REST API + dashboard</Text>
              <Text style={styles.footerLinkText}>• Multi-domain scalability</Text>
          </View>

          <View style={styles.footerSection}>
            <Text style={styles.footerTitle}>Team Members</Text>
              <Text style={styles.footerLinkText}>• Bhakti Thakur</Text>
              <Text style={styles.footerLinkText}>• Aabha Wadvalkar</Text>
              <Text style={styles.footerLinkText}>• Kapil Sarda</Text>
          </View>

          <View style={styles.footerSection}>
            <Text style={styles.footerTitle}>Project Guide</Text>
              <Text style={styles.footerLinkText}>• Dr. S. R. Khonde</Text>
          </View>

          <View style={styles.footerSection}>
            <Text style={styles.footerTitle}>Publication & Resource Links:</Text>
            <Pressable style={styles.footerLink}>
              <Text style={styles.footerLinkText}>• Conference Paper</Text>
            </Pressable>
            <Pressable style={styles.footerLink} onPress={() => Linking.openURL("https://github.com/bhakti-thakur/SynthData")}>
              <Text style={styles.footerLinkText}>• GitHub Repository</Text>
            </Pressable>
          </View>
        </View>

      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screenContent: {
    paddingHorizontal: 0,
  },
  scroll: {
    paddingBottom: 0,
  },
  paddedContent: {
    paddingHorizontal: spacing.lg,
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
  footer: {
    backgroundColor: colors.primary,
    marginTop: spacing.xl,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  footerText: {
    marginTop: spacing.xl,
    textAlign: "center",
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.size.sm,
    color: colors.textMuted,
  },
  footerSection: {
    marginTop: spacing.xl,
  },
  footerTitle: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.size.lg,
    color: colors.secondary,
    marginBottom: spacing.sm,
  },
  footerLink: {
    paddingVertical: spacing.xs,
  },
  footerLinkText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.size.sm,
    color: colors.secondary,
  },
});
