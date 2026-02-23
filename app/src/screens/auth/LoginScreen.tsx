import React, { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { login } from "../../api/auth";
import { setAccessToken } from "../../api/tokenStorage";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { Input } from "../../components/Input";
import { Screen } from "../../components/Screen";
import { AuthStackParamList, RootStackParamList } from "../../types/navigation";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";
import { typography } from "../../theme/typography";

type AuthNav = NativeStackNavigationProp<AuthStackParamList>;
type RootNav = NativeStackNavigationProp<RootStackParamList>;

export function LoginScreen() {
  const authNav = useNavigation<AuthNav>();
  const rootNav = useNavigation<RootNav>();
  const { setAuthenticated, setUserEmail } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async () => {
    if (isSubmitting) {
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = await login(email.trim(), password);
      if (payload?.access_token) {
        const trimmedEmail = email.trim();
        await setAccessToken(payload.access_token);
        await setUserEmail(trimmedEmail.length > 0 ? trimmedEmail : null);
        setAuthenticated(true);
        rootNav.navigate("MainTabs");
      }
      Alert.alert("Success", "Logged in successfully.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Login failed";
      Alert.alert("Login failed", message);
    } finally {
      setIsSubmitting(false);
    }
  };

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
              <Input
                placeholder="Email ID"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
              />
              <Text style={styles.otpText}>Login via OTP</Text>
              <Input
                placeholder="Enter your Password"
                secureTextEntry
                rightIconName="eye-off"
                value={password}
                onChangeText={setPassword}
              />
              <Pressable>
                <Text style={styles.forgotText}>Forgot Password?</Text>
              </Pressable>
              <Button
                label={isSubmitting ? "Logging in..." : "Log in"}
                style={styles.primaryButton}
                onPress={handleLogin}
                disabled={isSubmitting}
              />
            </View>

            <Text style={styles.footerText}>
              Don&apos;t have an account?{
              " "}
              <Text
                style={styles.footerLink}
                onPress={() => authNav.navigate("SignUp")}
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
