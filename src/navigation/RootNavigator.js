import React from "react";
import { ActivityIndicator, View } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuthContext } from "../context/AuthContext";
import LoginScreen from "../screens/LoginScreen";
import LedgerHomeScreen from "../screens/LedgerHomeScreen";
import AddCustomerScreen from "../screens/AddCustomerScreen";
import CustomerLedgerScreen from "../screens/CustomerLedgerScreen";
import AddTransactionScreen from "../screens/AddTransactionScreen";
import { colors } from "../theme/colors";

const Stack = createNativeStackNavigator();

function LoadingScreen() {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}

export default function RootNavigator() {
  const { isBootstrapping, isLoggedIn } = useAuthContext();

  if (isBootstrapping) {
    return <LoadingScreen />;
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        animation: "slide_from_right",
      }}
    >
      {!isLoggedIn ? (
        <Stack.Screen name="Login" component={LoginScreen} />
      ) : (
        <>
          <Stack.Screen name="LedgerHome" component={LedgerHomeScreen} />
          <Stack.Screen name="AddCustomer" component={AddCustomerScreen} />
          <Stack.Screen name="CustomerLedger" component={CustomerLedgerScreen} />
          <Stack.Screen name="AddTransaction" component={AddTransactionScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}
