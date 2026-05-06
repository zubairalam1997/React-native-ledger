import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api, getCurrentUserId } from "../lib/api";

const CustomerContext = createContext(null);

export const useCustomerContext = () => {
  const context = useContext(CustomerContext);
  if (!context) {
    throw new Error("useCustomerContext must be used within a CustomerProvider");
  }
  return context;
};

export function CustomerProvider({ children }) {
  const [customers, setCustomers] = useState([]);

  const refreshCustomers = useCallback(async () => {
    if (!(await getCurrentUserId())) {
      setCustomers([]);
      return;
    }

    try {
      const data = await api.get("/customers");
      setCustomers(data.customers || []);
    } catch (error) {
      console.error("Failed to load customers", error);
    }
  }, []);

  useEffect(() => {
    refreshCustomers().catch((error) => {
      console.error("Initial customer load failed", error);
    });
  }, [refreshCustomers]);

  const addCustomer = async (customer) => {
    if (!(await getCurrentUserId())) {
      throw new Error("Please login first");
    }

    const data = await api.post("/customers", customer);
    setCustomers((prev) => [...prev, data.customer]);
    return data.customer;
  };

  const value = useMemo(
    () => ({
      customers,
      addCustomer,
      refreshCustomers,
    }),
    [customers, refreshCustomers]
  );

  return <CustomerContext.Provider value={value}>{children}</CustomerContext.Provider>;
}
