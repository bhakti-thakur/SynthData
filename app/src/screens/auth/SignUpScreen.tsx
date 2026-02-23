import React, { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { register } from "../../api/auth";
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

export function SignUpScreen() {
  const authNav = useNavigation<AuthNav>();
  const rootNav = useNavigation<RootNav>();
  const { setAuthenticated, setUserEmail } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSignUp = async () => {
    if (isSubmitting) {
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = await register(email.trim(), password);
      if (payload?.access_token) {
        const trimmedEmail = email.trim();
        await setAccessToken(payload.access_token);
        await setUserEmail(trimmedEmail.length > 0 ? trimmedEmail : null);
        setAuthenticated(true);
        rootNav.navigate("MainTabs");
      }
      Alert.alert("Success", `Signed up successfully${name.trim() ? `, ${name.trim()}` : ""}.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Sign up failed";
      Alert.alert("Sign up failed", message);
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
            <Text style={styles.title}>Sign Up</Text>

            <View style={styles.form}>
              <Input placeholder="Name" value={name} onChangeText={setName} />
              <Input
                placeholder="Email"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
              />
              <Input
                placeholder="Enter Password"
                secureTextEntry
                rightIconName="eye-off"
                value={password}
                onChangeText={setPassword}
              />
            </View>

            <Button
              label={isSubmitting ? "Signing up..." : "Sign Up"}
              style={styles.primaryButton}
              onPress={handleSignUp}
              disabled={isSubmitting}
            />

            <Pressable style={styles.rememberRow}>
              <View style={styles.checkbox}>
                <Ionicons name="checkmark" size={12} color={colors.textMuted} />
              </View>
              <Text style={styles.rememberText}>Remember me</Text>
            </Pressable>

            <Text style={styles.footerText}>
              Already have an account?{
              " "}
              <Text
                style={styles.footerLink}
                onPress={() => authNav.navigate("Login")}
              >
                Sign in
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
  form: {
    gap: spacing.md,
  },
  primaryButton: {
    marginTop: spacing.xl,
  },
  rememberRow: {
    marginTop: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  checkbox: {
    width: 14,
    height: 14,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 3,
    alignItems: "center",
    justifyContent: "center",
  },
  rememberText: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.size.sm,
    color: colors.textMuted,
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
