import React from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";

export default function FormField({ label, multiline = false, style, inputStyle, ...props }) {
  return (
    <View style={style}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        placeholderTextColor={colors.textMuted}
        multiline={multiline}
        style={[styles.input, multiline ? styles.multiline : null, inputStyle]}
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    marginBottom: spacing.xs,
    fontSize: 13,
    fontWeight: "600",
    color: colors.primary,
  },
  input: {
    minHeight: 48,
    paddingHorizontal: spacing.md,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    color: "#1f2937",
    fontSize: 15,
  },
  multiline: {
    minHeight: 90,
    paddingTop: spacing.md,
    textAlignVertical: "top",
  },
});
