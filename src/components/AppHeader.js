import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";

export default function AppHeader({ title, subtitle, leftLabel, onLeftPress, rightAction }) {
  return (
    <View style={styles.container}>
      <View style={styles.side}>
        {leftLabel ? (
          <Pressable onPress={onLeftPress} hitSlop={12} style={styles.backButton}>
            <Text style={styles.backText}>{leftLabel}</Text>
          </Pressable>
        ) : null}
      </View>

      <View style={styles.center}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>

      <View style={[styles.side, styles.sideRight]}>{rightAction}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  side: {
    width: 72,
  },
  sideRight: {
    alignItems: "flex-end",
  },
  center: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.primary,
  },
  subtitle: {
    marginTop: 2,
    fontSize: 12,
    color: colors.textMuted,
  },
  backButton: {
    minHeight: 44,
    justifyContent: "center",
  },
  backText: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.primary,
  },
});
