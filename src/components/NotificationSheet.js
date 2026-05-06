import React from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import ConfirmationBadge from "./ConfirmationBadge";
import PrimaryButton from "./PrimaryButton";
import { formatDateTime } from "../lib/formatters";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";

export default function NotificationSheet({
  visible,
  notifications,
  onClose,
  onAction,
}) {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={() => {}}>
          <View style={styles.handle} />
          <Text style={styles.title}>Notifications</Text>

          <ScrollView showsVerticalScrollIndicator={false}>
            {notifications.length === 0 ? (
              <Text style={styles.empty}>No notifications</Text>
            ) : (
              notifications.map((notification, index) => (
                <View key={notification.id || index} style={styles.card}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle}>{notification.title}</Text>
                    <ConfirmationBadge status={notification.status} />
                  </View>
                  <Text style={styles.message}>{notification.message}</Text>
                  <Text style={styles.timestamp}>{formatDateTime(notification.createdAt)}</Text>

                  {notification.status === "PENDING" ? (
                    <View style={styles.actions}>
                      <PrimaryButton
                        label="Approve"
                        variant="success"
                        onPress={() => onAction(notification.id, "CONFIRMED")}
                        style={styles.actionButton}
                      />
                      <PrimaryButton
                        label="Reject"
                        variant="danger"
                        onPress={() => onAction(notification.id, "REJECTED")}
                        style={styles.actionButton}
                      />
                    </View>
                  ) : null}
                </View>
              ))
            )}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: colors.overlay,
  },
  sheet: {
    maxHeight: "78%",
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: colors.surface,
  },
  handle: {
    alignSelf: "center",
    width: 52,
    height: 5,
    borderRadius: 999,
    marginBottom: spacing.md,
    backgroundColor: "#c5aa6f",
  },
  title: {
    marginBottom: spacing.md,
    fontSize: 20,
    fontWeight: "700",
    color: colors.primary,
  },
  empty: {
    color: colors.textMuted,
    fontSize: 14,
  },
  card: {
    marginBottom: spacing.md,
    padding: spacing.md,
    borderRadius: 18,
    backgroundColor: "#f9e6bd",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  cardTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: "700",
    color: colors.primary,
  },
  message: {
    marginTop: spacing.sm,
    fontSize: 13,
    color: "#374151",
  },
  timestamp: {
    marginTop: spacing.xs,
    fontSize: 11,
    color: colors.textMuted,
  },
  actions: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  actionButton: {
    flex: 1,
  },
});
