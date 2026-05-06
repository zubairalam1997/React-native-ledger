import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import ScreenContainer from "../components/ScreenContainer";
import AppHeader from "../components/AppHeader";
import PrimaryButton from "../components/PrimaryButton";
import { useCustomerContext } from "../context/CustomerContext";
import { useTransactionContext } from "../context/TransactionContext";
import { formatAmount, formatDate } from "../lib/formatters";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";

export default function CustomerLedgerScreen({ navigation, route }) {
  const customerFromRoute = route.params?.customer;
  const { customers } = useCustomerContext();
  const { transactions, refreshTransactions, isLoadingTransactions } = useTransactionContext();
  const [confirmationModes, setConfirmationModes] = useState({});

  const customer = useMemo(() => {
    if (customerFromRoute) {
      return customerFromRoute;
    }

    const customerId = route.params?.customerId;
    return customers.find((entry) => String(entry.id) === String(customerId));
  }, [customerFromRoute, customers, route.params?.customerId]);

  useEffect(() => {
    if (customer?.id) {
      refreshTransactions(customer.id).catch((error) => {
        console.error("Failed to refresh transactions", error);
      });
    }
  }, [customer?.id, refreshTransactions]);

  const confirmationMode = confirmationModes[customer?.id] || "STRICT";

  const customerTransactions = useMemo(() => {
    if (!customer?.id) {
      return [];
    }

    return transactions
      .filter(
        (transaction) =>
          (transaction.customerId || transaction.contactId)?.toString() === customer.id?.toString()
      )
      .sort((a, b) => new Date(b.transactionDate || b.date) - new Date(a.transactionDate || a.date));
  }, [customer?.id, transactions]);

  const totalBalance = customerTransactions.reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0);

  if (!customer) {
    return (
      <ScreenContainer>
        <View style={styles.centered}>
          <Text style={styles.emptyText}>Customer not found.</Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <AppHeader
        title={customer.name}
        subtitle="Transaction History"
        leftLabel="Back"
        onLeftPress={navigation.goBack}
      />

      <View style={styles.modeWrap}>
        <Pressable
          onPress={() => setConfirmationModes((prev) => ({ ...prev, [customer.id]: "STRICT" }))}
          style={[styles.modePill, confirmationMode === "STRICT" ? styles.modeActive : null]}
        >
          <Text style={[styles.modeText, confirmationMode === "STRICT" ? styles.modeTextActive : null]}>Two-Way</Text>
        </Pressable>
        <Pressable
          onPress={() => setConfirmationModes((prev) => ({ ...prev, [customer.id]: "PERSONAL" }))}
          style={[styles.modePill, confirmationMode === "PERSONAL" ? styles.modeActive : null]}
        >
          <Text style={[styles.modeText, confirmationMode === "PERSONAL" ? styles.modeTextActive : null]}>Personal</Text>
        </Pressable>
      </View>

      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Total Balance</Text>
        <Text style={[styles.balanceValue, { color: totalBalance >= 0 ? colors.success : colors.danger }]}>
          {formatAmount(totalBalance)}
        </Text>
      </View>

      {isLoadingTransactions ? (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={customerTransactions}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={customerTransactions.length === 0 ? styles.centeredFill : styles.listContent}
          renderItem={({ item }) => (
            <View style={styles.transactionRow}>
              <View style={styles.transactionInfo}>
                <Text style={styles.transactionTitle}>{item.desc || item.note || "No description"}</Text>
                <Text style={styles.transactionDate}>{formatDate(item.date || item.transactionDate)}</Text>
              </View>
              <Text style={[styles.transactionAmount, { color: Number(item.amount) >= 0 ? colors.success : colors.danger }]}>
                {formatAmount(item.amount)}
              </Text>
            </View>
          )}
          ListEmptyComponent={<Text style={styles.emptyText}>No transactions yet.</Text>}
        />
      )}

      <View style={styles.footer}>
        <PrimaryButton
          label="Add Given"
          onPress={() => navigation.navigate("AddTransaction", { type: "given", customer, confirmationMode })}
          style={styles.footerButton}
        />
        <PrimaryButton
          label="Add Received"
          variant="success"
          onPress={() => navigation.navigate("AddTransaction", { type: "received", customer, confirmationMode })}
          style={styles.footerButton}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  modeWrap: {
    flexDirection: "row",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  modePill: {
    minHeight: 42,
    paddingHorizontal: spacing.md,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.accent,
  },
  modeActive: {
    backgroundColor: colors.primary,
  },
  modeText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.primary,
  },
  modeTextActive: {
    color: colors.white,
  },
  balanceCard: {
    margin: spacing.md,
    padding: spacing.lg,
    borderRadius: 22,
    backgroundColor: colors.surface,
  },
  balanceLabel: {
    fontSize: 13,
    color: colors.textMuted,
  },
  balanceValue: {
    marginTop: spacing.xs,
    fontSize: 24,
    fontWeight: "800",
  },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: 110,
  },
  transactionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  transactionInfo: {
    flex: 1,
    paddingRight: spacing.md,
  },
  transactionTitle: {
    fontSize: 15,
    color: "#111827",
  },
  transactionDate: {
    marginTop: 4,
    fontSize: 12,
    color: colors.textMuted,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: "700",
  },
  footer: {
    flexDirection: "row",
    gap: spacing.sm,
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  footerButton: {
    flex: 1,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  centeredFill: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: 14,
    color: colors.textMuted,
  },
});
