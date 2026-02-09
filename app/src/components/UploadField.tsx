import React, { useState } from "react";
import * as DocumentPicker from "expo-document-picker";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import { Button } from "./Button";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";

type UploadFieldProps = {
  placeholder: string;
  types: string[];
  iconName?: React.ComponentProps<typeof Ionicons>["name"];
  value?: string | null;
  onChangeFileName?: (name: string | null) => void;
  onPickAsset?: (asset: DocumentPicker.DocumentPickerAsset | null) => void;
  boxStyle?: StyleProp<ViewStyle>;
};

export function UploadField({
  placeholder,
  types,
  iconName,
  value,
  onChangeFileName,
  onPickAsset,
  boxStyle,
}: UploadFieldProps) {
  const [internalName, setInternalName] = useState<string | null>(null);
  const fileName = value !== undefined ? value : internalName;

  const setFileName = (name: string | null) => {
    if (value === undefined) {
      setInternalName(name);
    }
    onChangeFileName?.(name);
    if (name === null) {
      onPickAsset?.(null);
    }
  };

  const handlePick = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: types,
      copyToCacheDirectory: true,
    });

    if (result.canceled || result.assets.length === 0) {
      return;
    }

    const asset = result.assets[0];
    setFileName(asset.name ?? "Selected file");
    onPickAsset?.(asset);
  };

  return (
    <View style={[styles.box, boxStyle]}>
      {iconName ? <Ionicons name={iconName} size={20} color={colors.textMuted} /> : null}
      <Text style={fileName ? styles.fileName : styles.placeholder}>
        {fileName ?? placeholder}
      </Text>
      {fileName ? (
        <Pressable onPress={() => setFileName(null)} style={styles.trashButton}>
          <Ionicons name="trash-outline" size={18} color={colors.textPrimary} />
        </Pressable>
      ) : (
        <Button label="Browse" variant="secondary" style={styles.browseButton} onPress={handlePick} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: spacing.md,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
  placeholder: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.size.md,
    color: colors.textMuted,
    textAlign: "center",
  },
  fileName: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.size.md,
    color: colors.textPrimary,
    textAlign: "center",
  },
  browseButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  trashButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
});
