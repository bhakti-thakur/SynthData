import React from "react";
import {
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";

type SegmentedControlProps = {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  style?: StyleProp<ViewStyle>;
};

export function SegmentedControl({
  options,
  value,
  onChange,
  style,
}: SegmentedControlProps) {
  return (
    <View style={[styles.container, style]}>
      {options.map((option) => {
        const isActive = option === value;
        return (
          <Pressable
            key={option}
            onPress={() => onChange(option)}
            style={[styles.segment, isActive && styles.segmentActive]}
          >
            <Text style={[styles.label, isActive && styles.labelActive]}>
              {option}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: spacing.xs,
    alignSelf: "center",
    gap: spacing.xs,
  },
  segment: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 12,
  },
  segmentActive: {
    backgroundColor: colors.backgroundStart,
  },
  label: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.size.md,
    color: colors.textMuted,
  },
  labelActive: {
    color: colors.textPrimary,
    fontFamily: typography.fontFamily.semibold,
  },
});
