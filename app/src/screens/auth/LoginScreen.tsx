import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { Input } from "../../components/Input";
import { Screen } from "../../components/Screen";
import { AuthStackParamList } from "../../types/navigation";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";
import { typography } from "../../theme/typography";

type AuthNav = NativeStackNavigationProp<AuthStackParamList>;

export function LoginScreen() {
  const navigation = useNavigation<AuthNav>();

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.cardWrap}>
          <Card style={styles.authCard}>
            <Pressable style={styles.closeButton}>
              <Ionicons name="close" size={18} color={colors.textPrimary} />
            </Pressable>
            <Text style={styles.title}>Login</Text>

            <Pressable style={styles.googleButton}>
              <Ionicons name="logo-google" size={18} color={colors.textPrimary} />
              <Text style={styles.googleText}>Continue with Google</Text>
            </Pressable>

            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or login with email</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.form}>
              <Input placeholder="Email ID" keyboardType="email-address" />
              <Text style={styles.otpText}>Login via OTP</Text>
              <Input
                placeholder="Enter your Password"
                secureTextEntry
                rightIconName="eye-off"
              />
              <Pressable>
                <Text style={styles.forgotText}>Forgot Password?</Text>
              </Pressable>
              <Button label="Log in" style={styles.primaryButton} />
            </View>

            <Text style={styles.footerText}>
              Don&apos;t have an account?{
              " "}
              <Text
                style={styles.footerLink}
                onPress={() => navigation.navigate("SignUp")}
              >
                Sign up
              </Text>
            </Text>
          </Card>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
    justifyContent: "center",
    paddingBottom: spacing.xl,
  },
  cardWrap: {
    alignItems: "center",
  },
  authCard: {
    width: "100%",
    maxWidth: 360,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.xl,
    borderRadius: 24,
  },
  closeButton: {
    position: "absolute",
    right: spacing.md,
    top: spacing.md,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.size.xl,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  googleText: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.size.md,
    color: colors.textPrimary,
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginVertical: spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.size.sm,
    color: colors.textMuted,
  },
  form: {
    gap: spacing.md,
  },
  otpText: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.size.sm,
    color: colors.textMuted,
  },
  forgotText: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.size.sm,
    color: colors.textMuted,
    textAlign: "right",
  },
  primaryButton: {
    marginTop: spacing.md,
  },
  footerText: {
    marginTop: spacing.xl,
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.size.sm,
    color: colors.textMuted,
    textAlign: "center",
  },
  footerLink: {
    color: colors.textPrimary,
    fontFamily: typography.fontFamily.medium,
  },
});
