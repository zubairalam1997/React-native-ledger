import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api, getCurrentUserId } from "../lib/api";

const TransactionContext = createContext(null);

export const useTransactionContext = () => {
  const context = useContext(TransactionContext);
  if (!context) {
    throw new Error("useTransactionContext must be used within a TransactionProvider");
  }
  return context;
};

export function TransactionProvider({ children }) {
  const [transactions, setTransactions] = useState([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);

  const refreshTransactions = useCallback(async (customerId) => {
    setIsLoadingTransactions(true);
    try {
      if (!(await getCurrentUserId())) {
        setTransactions([]);
        return;
      }

      const query = customerId ? `?customerId=${customerId}` : "";
      const response = await api.get(`/transactions${query}`);
      setTransactions(response.transactions || response.data?.transactions || []);
    } catch (error) {
      console.error("Failed to load transactions", error);
      setTransactions([]);
    } finally {
      setIsLoadingTransactions(false);
    }
  }, []);

  useEffect(() => {
    refreshTransactions().catch((error) => {
      console.error("Initial transaction load failed", error);
    });
  }, [refreshTransactions]);

  const addTransaction = useCallback(async (transaction, billImageUri = null) => {
    if (!(await getCurrentUserId())) {
      throw new Error("Please login first");
    }

    const payload = billImageUri ? { ...transaction, billImageUri } : transaction;
    const response = await api.post("/transactions", payload);
    const savedTransaction = response.transaction || response.data?.transaction;

    if (savedTransaction) {
      setTransactions((prev) => [...prev, savedTransaction]);
    }

    return savedTransaction;
  }, []);

  const getCustomerTotals = useCallback(
    (customerId) => {
      const customerTransactions = transactions.filter(
        (transaction) =>
          (transaction.customerId || transaction.contactId)?.toString() === customerId?.toString()
      );

      const totalGiven = customerTransactions
        .filter((transaction) => Number(transaction.amount) < 0)
        .reduce((sum, transaction) => sum + Math.abs(Number(transaction.amount)), 0);

      const totalReceived = customerTransactions
        .filter((transaction) => Number(transaction.amount) > 0)
        .reduce((sum, transaction) => sum + Number(transaction.amount), 0);

      return {
        totalGiven,
        totalReceived,
        balance: totalReceived - totalGiven,
      };
    },
    [transactions]
  );

  const value = useMemo(
    () => ({
      transactions,
      isLoadingTransactions,
      addTransaction,
      getCustomerTotals,
      refreshTransactions,
    }),
    [addTransaction, getCustomerTotals, isLoadingTransactions, refreshTransactions, transactions]
  );

  return <TransactionContext.Provider value={value}>{children}</TransactionContext.Provider>;
}
