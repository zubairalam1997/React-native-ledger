import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors } from "../theme/colors";

const content = {
  CONFIRMED: { label: "Confirmed", backgroundColor: "#dcfce7", color: colors.success },
  PENDING: { label: "Pending", backgroundColor: "#fef3c7", color: colors.warning },
  DISPUTED: { label: "Disputed", backgroundColor: "#fee2e2", color: colors.danger },
  REJECTED: { label: "Rejected", backgroundColor: "#fee2e2", color: colors.danger },
};

export default function ConfirmationBadge({ status }) {
  const tone = content[status];
  if (!tone) {
    return null;
  }

  return (
    <View style={[styles.badge, { backgroundColor: tone.backgroundColor }]}>
      <Text style={[styles.text, { color: tone.color }]}>{tone.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  text: {
    fontSize: 11,
    fontWeight: "700",
  },
});
