import React, { useState } from "react";
import { Alert, Image, StyleSheet, Text, View } from "react-native";

import ScreenContainer from "../components/ScreenContainer";
import FormField from "../components/FormField";
import PrimaryButton from "../components/PrimaryButton";
import { useAuthContext } from "../context/AuthContext";
import { useCustomerContext } from "../context/CustomerContext";
import { useNotificationContext } from "../context/NotificationContext";
import { useTransactionContext } from "../context/TransactionContext";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";

export default function LoginScreen() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuthContext();
  const { refreshCustomers } = useCustomerContext();
  const { refreshTransactions } = useTransactionContext();
  const { refreshNotifications } = useNotificationContext();

  const handleLogin = async () => {
    if (!name.trim() || phone.length !== 10) {
      Alert.alert("Missing details", "Enter your name and a valid 10-digit mobile number.");
      return;
    }

    setLoading(true);
    try {
      await login({ name: name.trim(), phoneNumber: phone });
      await Promise.all([refreshCustomers(), refreshTransactions(), refreshNotifications()]);
    } catch (error) {
      Alert.alert("Login failed", error.message || "Unable to login right now.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer scroll keyboard>
      <View style={styles.wrapper}>
        <View style={styles.card}>
          <View style={styles.hero}>
            <Text style={styles.brand}>ConfirmLedger</Text>
            <Text style={styles.heroTitle}>Hisab OK</Text>
            <Text style={styles.heroText}>
              Same ledger flow, rebuilt for mobile with larger touch targets and quick access actions.
            </Text>
          </View>

          <View style={styles.form}>
            <FormField
              label="Name"
              placeholder="Enter your name"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              returnKeyType="next"
            />

            <FormField
              label="Mobile Number"
              placeholder="Enter mobile number"
              value={phone}
              onChangeText={(value) => setPhone(value.replace(/\D/g, "").slice(0, 10))}
              keyboardType="number-pad"
              returnKeyType="done"
            />

            <PrimaryButton label="Open Ledger" onPress={handleLogin} loading={loading} />
          </View>
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    justifyContent: "center",
    padding: spacing.lg,
  },
  card: {
    overflow: "hidden",
    borderRadius: 28,
    backgroundColor: colors.surface,
  },
  hero: {
    padding: spacing.xl,
    backgroundColor: colors.surfaceMuted,
  },
  brand: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.primary,
  },
  heroTitle: {
    marginTop: spacing.md,
    fontSize: 42,
    fontWeight: "800",
    lineHeight: 44,
    color: "#2563eb",
  },
  heroText: {
    marginTop: spacing.sm,
    fontSize: 14,
    lineHeight: 21,
    color: colors.textMuted,
  },
  form: {
    padding: spacing.xl,
    gap: spacing.md,
  },
});
