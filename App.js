import "react-native-gesture-handler";
import React from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider, initialWindowMetrics } from "react-native-safe-area-context";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { AuthProvider } from "./src/context/AuthContext";
import { CustomerProvider } from "./src/context/CustomerContext";
import { TransactionProvider } from "./src/context/TransactionContext";
import { NotificationProvider } from "./src/context/NotificationContext";
import RootNavigator from "./src/navigation/RootNavigator";
import { colors } from "./src/theme/colors";

const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.background,
    card: colors.surface,
    text: colors.ink,
    border: colors.border,
    primary: colors.primary,
  },
};

export default function App() {
  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <AuthProvider>
        <NotificationProvider>
          <CustomerProvider>
            <TransactionProvider>
              <NavigationContainer theme={navigationTheme}>
                <StatusBar style="dark" />
                <RootNavigator />
              </NavigationContainer>
            </TransactionProvider>
          </CustomerProvider>
        </NotificationProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}


