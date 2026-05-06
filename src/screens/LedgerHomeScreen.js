import React, { useCallback, useEffect, useState } from "react";
import { Alert, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import ScreenContainer from "../components/ScreenContainer";
import CustomerRow from "../components/CustomerRow";
import NotificationSheet from "../components/NotificationSheet";
import { useAuthContext } from "../context/AuthContext";
import { useCustomerContext } from "../context/CustomerContext";
import { useNotificationContext } from "../context/NotificationContext";
import { useTransactionContext } from "../context/TransactionContext";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";

export default function LedgerHomeScreen({ navigation }) {
  const { user, logout } = useAuthContext();
  const { customers, refreshCustomers } = useCustomerContext();
  const { getCustomerTotals, refreshTransactions } = useTransactionContext();
  const { notifications, refreshNotifications, updateNotificationStatus } = useNotificationContext();
  const [showNotifications, setShowNotifications] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    await Promise.all([refreshCustomers(), refreshTransactions(), refreshNotifications()]);
  }, [refreshCustomers, refreshNotifications, refreshTransactions]);

  useEffect(() => {
    loadData().catch((error) => {
      console.error("Failed to load initial data", error);
    });
  }, [loadData]);

  useFocusEffect(
    useCallback(() => {
      loadData().catch((error) => {
        console.error("Failed to refresh ledger home on focus", error);
      });
    }, [loadData])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadData();
    } finally {
      setRefreshing(false);
    }
  }, [loadData]);

  const openCustomerLedger = async (customer) => {
    try {
      await refreshTransactions(customer.id);
      navigation.navigate("CustomerLedger", { customer });
    } catch (error) {
      Alert.alert("Open failed", "Could not load this customer's ledger.");
    }
  };

  const handleNotificationAction = async (id, status) => {
    try {
      await updateNotificationStatus(id, status);
      await Promise.all([refreshNotifications(), refreshTransactions()]);
    } catch (error) {
      Alert.alert("Update failed", error.message || "Unable to update notification.");
    }
  };

  const toggleNotifications = async () => {
    setShowNotifications((prev) => !prev);
    try {
      await refreshNotifications();
    } catch (error) {
      console.error("Failed to refresh notifications", error);
    }
  };

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <View style={styles.profileRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{(user?.displayName || user?.name || "M").slice(0, 1)}</Text>
          </View>
          <View style={styles.headerText}>
            <Text style={styles.title}>{user?.displayName || user?.name || "My Ledger"}</Text>
            <Text style={styles.subtitle}>ConfirmLedger</Text>
          </View>
        </View>

        <View style={styles.headerActions}>
          <Pressable onPress={toggleNotifications} hitSlop={12} style={styles.iconButton}>
            <Text style={styles.iconText}>🔔</Text>
            {notifications.length > 0 ? (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{notifications.length}</Text>
              </View>
            ) : null}
          </Pressable>

          <Pressable onPress={logout} hitSlop={12} style={styles.iconButton}>
            <Text style={styles.iconText}>Exit</Text>
          </Pressable>
        </View>
      </View>

      <FlatList
        data={customers}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => {
          const { balance } = getCustomerTotals(item.id);
          return <CustomerRow customer={item} balance={balance} onPress={() => openCustomerLedger(item)} />;
        }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        contentContainerStyle={customers.length === 0 ? styles.emptyContainer : styles.listContent}
        ListEmptyComponent={<Text style={styles.emptyText}>No customers found yet.</Text>}
      />

      <Pressable style={styles.fab} onPress={() => navigation.navigate("AddCustomer")}>
        <Text style={styles.fabText}>+</Text>
      </Pressable>

      <NotificationSheet
        visible={showNotifications}
        notifications={notifications}
        onClose={() => setShowNotifications(false)}
        onAction={handleNotificationAction}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.accent,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.primary,
  },
  headerText: {
    marginLeft: spacing.sm,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.primary,
  },
  subtitle: {
    fontSize: 12,
    color: colors.textMuted,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  iconButton: {
    minWidth: 44,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  iconText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.primary,
  },
  badge: {
    position: "absolute",
    top: 4,
    right: 2,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.danger,
  },
  badgeText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: "700",
  },
  listContent: {
    paddingBottom: 96,
  },
  emptyContainer: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: 15,
    color: colors.textMuted,
  },
  fab: {
    position: "absolute",
    right: spacing.lg,
    bottom: spacing.xl,
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  fabText: {
    fontSize: 34,
    lineHeight: 34,
    color: colors.primary,
  },
});
