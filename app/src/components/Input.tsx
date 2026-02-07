import React from "react";
import { Ionicons } from "@expo/vector-icons";
import {
  KeyboardTypeOptions,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";

type InputProps = {
  label?: string;
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  rightIconName?: React.ComponentProps<typeof Ionicons>["name"];
  onRightIconPress?: () => void;
  style?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
};

export function Input({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry,
  keyboardType,
  rightIconName,
  onRightIconPress,
  style,
  inputStyle,
}: InputProps) {
  return (
    <View style={[styles.wrapper, style]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={styles.inputRow}>
        <TextInput
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          placeholderTextColor={colors.textMuted}
          underlineColorAndroid="transparent"
          style={[styles.input, rightIconName && styles.inputWithIcon, inputStyle]}
        />
        {rightIconName ? (
          <Pressable onPress={onRightIconPress} style={styles.iconButton}>
            <Ionicons name={rightIconName} size={18} color={colors.textMuted} />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.xs,
  },
  label: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.size.sm,
    color: colors.textPrimary,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
  },
  input: {
    flex: 1,
    color: colors.textPrimary,
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.size.md,
    paddingVertical: spacing.sm,
    borderWidth: 0,
    outlineWidth: 0,
    outlineColor: "transparent",
  },
  inputWithIcon: {
    paddingRight: spacing.sm,
  },
  iconButton: {
    paddingLeft: spacing.sm,
    paddingVertical: spacing.sm,
  },
});
