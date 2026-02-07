import React from "react";
import {
  GestureResponderEvent,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  ViewStyle,
} from "react-native";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";

type ButtonVariant = "primary" | "secondary";

type ButtonProps = {
  label: string;
  variant?: ButtonVariant;
  onPress?: (event: GestureResponderEvent) => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
};

export function Button({
  label,
  variant = "primary",
  onPress,
  disabled,
  style,
  textStyle,
}: ButtonProps) {
  const isPrimary = variant === "primary";
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.base,
        isPrimary ? styles.primary : styles.secondary,
        disabled && styles.disabled,
        style,
      ]}
    >
      <Text
        style={[
          styles.label,
          isPrimary ? styles.primaryText : styles.secondaryText,
          textStyle,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: "center",
    borderRadius: 14,
    justifyContent: "center",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  primary: {
    backgroundColor: colors.secondary,
  },
  secondary: {
    backgroundColor: colors.secondary,
    borderColor: colors.border,
    borderWidth: 1,
  },
  disabled: {
    opacity: 0.6,
  },
  label: {
    fontFamily: typography.fontFamily.medium,
    
  },
  primaryText: {
    color: colors.textPrimary,
    fontSize: 16,
  },
  secondaryText: {
    color: colors.textPrimary,
    fontSize: 13,
  },
});
