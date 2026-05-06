import React from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text } from "react-native";
import { colors } from "../theme/colors";

export default function PrimaryButton({
  label,
  onPress,
  variant = "primary",
  disabled = false,
  loading = false,
  style,
}) {
  const tone = tones[variant] || tones.primary;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: tone.background, borderColor: tone.border },
        pressed && !disabled && !loading ? styles.pressed : null,
        (disabled || loading) ? styles.disabled : null,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={tone.text} />
      ) : (
        <Text style={[styles.label, { color: tone.text }]}>{label}</Text>
      )}
    </Pressable>
  );
}

const tones = {
  primary: {
    background: colors.primary,
    border: colors.primary,
    text: colors.white,
  },
  success: {
    background: colors.success,
    border: colors.success,
    text: colors.white,
  },
  danger: {
    background: colors.danger,
    border: colors.danger,
    text: colors.white,
  },
  secondary: {
    background: colors.white,
    border: "#cbd5e1",
    text: colors.textMuted,
  },
};

const styles = StyleSheet.create({
  button: {
    minHeight: 48,
    paddingHorizontal: 18,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: 15,
    fontWeight: "700",
  },
  pressed: {
    transform: [{ scale: 0.98 }],
  },
  disabled: {
    opacity: 0.65,
  },
});
