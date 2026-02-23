import React, { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { getHistory, HistoryActivity } from "../../api/history";
import { API_BASE_URL } from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import { Card } from "../../components/Card";
import { HistoryCard } from "../../components/HistoryCard";
import { Screen } from "../../components/Screen";
import { RootStackParamList } from "../../types/navigation";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";
import { typography } from "../../theme/typography";

type RootNav = NativeStackNavigationProp<RootStackParamList>;

export function AccountScreen() {
  const rootNav = useNavigation<RootNav>();
  const { logout, userEmail } = useAuth();
  const [historyItems, setHistoryItems] = useState<HistoryActivity[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);

  const formatTimestamp = (value: string) => {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
  };

  const handleDownload = async (url: string) => {
    const resolvedUrl = url.startsWith("/") ? `${API_BASE_URL}${url}` : url;
    try {
      await Linking.openURL(resolvedUrl);
    } catch (error) {
      console.log("Download error", error);
    }
  };

  useEffect(() => {
    const loadHistory = async () => {
      try {
        setLoadingHistory(true);
        setHistoryError(null);
        const response = await getHistory();
        console.log("History fetched.");
        // Handle both array and object responses
        const activities = Array.isArray(response) ? response : (response.activities ?? []);
        setHistoryItems(activities);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to load history";
        setHistoryError(message);
      } finally {
        setLoadingHistory(false);
      }
    };

    loadHistory();
  }, []);

  const handleLogout = async () => {
    await logout();
    rootNav.navigate("AuthStack");
  };

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
            <Text style={styles.profileText}>{userEmail ?? ""}</Text>
            <Text style={styles.profileText}>Profile: Student</Text>
          </Card>

          <Text style={styles.sectionTitle}>History</Text>
          {loadingHistory ? <Text style={styles.metaText}>Loading history...</Text> : null}
          {historyError ? <Text style={styles.metaText}>Error: {historyError}</Text> : null}
          <View style={styles.historyList}>
            {historyItems.map((item) => {
              const downloadUrl = item.download_url ?? undefined;
              const canDownload = item.activity_type === "generate" && !!downloadUrl;
              return (
                <HistoryCard
                  key={`${item.id}-${item.created_at}`}
                  id={String(item.id)}
                  timestamp={formatTimestamp(String(item.created_at))}
                  source={String(item.activity_type || "Unknown")}
                  output={String(item.dataset_id || "Generated")}
                  onDownload={
                    canDownload && downloadUrl
                      ? () => handleDownload(downloadUrl)
                      : undefined
                  }
                />
              );
            })}
          </View>

          <Text style={styles.sectionTitle}>Account Settings</Text>
          <View style={styles.settingsList}>
            <Pressable onPress={handleLogout}>
              <Text style={[styles.settingsItem, styles.deleteText]}>Logout</Text>
            </Pressable>
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
  metaText: {
    marginBottom: spacing.sm,
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.size.sm,
    color: colors.textMuted,
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
