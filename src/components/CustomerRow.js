import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { formatAmount } from "../lib/formatters";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";

export default function CustomerRow({ customer, balance, onPress }) {
  const amountColor = Number(balance) >= 0 ? colors.success : colors.danger;

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.row, pressed ? styles.pressed : null]}>
      <View style={styles.info}>
        <Text style={styles.name}>{customer.name}</Text>
        <Text style={styles.meta}>Last txn: {customer.lastTxn || "N/A"}</Text>
      </View>
      <Text style={[styles.amount, { color: amountColor }]}>{formatAmount(balance)}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 68,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  pressed: {
    backgroundColor: "#f6dfaa",
  },
  info: {
    flex: 1,
    paddingRight: spacing.md,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
  },
  meta: {
    marginTop: 4,
    fontSize: 12,
    color: colors.textMuted,
  },
  amount: {
    fontSize: 16,
    fontWeight: "700",
  },
});
