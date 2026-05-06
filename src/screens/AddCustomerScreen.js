import React, { useMemo, useState } from "react";
import { Alert, FlatList, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import ScreenContainer from "../components/ScreenContainer";
import AppHeader from "../components/AppHeader";
import FormField from "../components/FormField";
import PrimaryButton from "../components/PrimaryButton";
import { useCustomerContext } from "../context/CustomerContext";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";

const contacts = [
  { id: 1, name: "Ramesh Kumar", phone: "9876543210" },
  { id: 2, name: "Suresh Patel", phone: "9123456789" },
  { id: 3, name: "Aman Verma", phone: "9988776655" },
  { id: 4, name: "Neha Sharma", phone: "9090909090" },
  { id: 5, name: "Rahul Traders", phone: "8899001122" },
];

export default function AddCustomerScreen({ navigation }) {
  const { customers, addCustomer } = useCustomerContext();
  const [manualMode, setManualMode] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [popupOpen, setPopupOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);

  const customerPhones = useMemo(() => new Map(customers.map((customer) => [customer.phone, customer])), [customers]);

  const navigateToCustomer = (customer) => {
    navigation.replace("CustomerLedger", { customer });
  };

  const saveCustomer = async (payload) => {
    const existingCustomer = customerPhones.get(payload.phone);
    if (existingCustomer) {
      Alert.alert("Customer exists", "Opening existing ledger instead.");
      navigateToCustomer(existingCustomer);
      return;
    }

    const saved = await addCustomer(payload);
    navigateToCustomer(saved);
  };

  const handleManualSave = async () => {
    if (!name.trim() || !/^[0-9]{10}$/.test(phone)) {
      Alert.alert("Invalid details", "Enter a valid customer name and 10-digit mobile number.");
      return;
    }

    try {
      await saveCustomer({ name: name.trim(), phone });
    } catch (error) {
      Alert.alert("Save failed", error.message || "Could not add customer.");
    }
  };

  const handleContactClick = (contact) => {
    setSelectedContact(contact);
    setName(contact.name);
    setPopupOpen(true);
  };

  const confirmContactAdd = async () => {
    if (!selectedContact) {
      return;
    }

    try {
      await saveCustomer({ name: name.trim(), phone: selectedContact.phone });
      setPopupOpen(false);
    } catch (error) {
      Alert.alert("Save failed", error.message || "Could not add customer.");
    }
  };

  return (
    <ScreenContainer>
      <AppHeader title="Add Customer" subtitle="Add manually or from contacts" leftLabel="Back" onLeftPress={navigation.goBack} />

      <View style={styles.content}>
        {!manualMode ? (
          <PrimaryButton label="Add Manually" onPress={() => setManualMode(true)} />
        ) : (
          <View style={styles.manualCard}>
            <Pressable onPress={() => setManualMode(false)} style={styles.modeToggle}>
              <Text style={styles.modeToggleText}>Hide</Text>
            </Pressable>

            <FormField
              label="Customer Name"
              value={name}
              onChangeText={setName}
              placeholder="Enter customer name"
              autoCapitalize="words"
            />

            <FormField
              label="Mobile Number"
              value={phone}
              onChangeText={(value) => setPhone(value.replace(/\D/g, "").slice(0, 10))}
              placeholder="Enter mobile number"
              keyboardType="number-pad"
            />

            <PrimaryButton label="Save Customer" onPress={handleManualSave} />
          </View>
        )}

        <Text style={styles.sectionTitle}>Select from contacts</Text>

        <FlatList
          data={contacts}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <Pressable onPress={() => handleContactClick(item)} style={({ pressed }) => [styles.contactRow, pressed ? styles.contactPressed : null]}>
              <Text style={styles.contactName}>{item.name}</Text>
              <Text style={styles.contactPhone}>{item.phone}</Text>
            </Pressable>
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.contactsContent}
        />
      </View>

      <Modal visible={popupOpen} transparent animationType="fade" onRequestClose={() => setPopupOpen(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Confirm customer name</Text>
            <FormField value={name} onChangeText={setName} placeholder="Customer name" />
            <View style={styles.modalActions}>
              <PrimaryButton label="OK" onPress={confirmContactAdd} style={styles.modalButton} />
              <PrimaryButton label="Cancel" variant="danger" onPress={() => setPopupOpen(false)} style={styles.modalButton} />
            </View>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    padding: spacing.md,
  },
  manualCard: {
    gap: spacing.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderRadius: 22,
    backgroundColor: colors.surface,
  },
  modeToggle: {
    alignSelf: "flex-end",
    minHeight: 36,
    justifyContent: "center",
  },
  modeToggleText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.primary,
  },
  sectionTitle: {
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    fontSize: 14,
    fontWeight: "700",
    color: colors.primary,
  },
  contactsContent: {
    paddingBottom: spacing.xxl,
  },
  contactRow: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: 16,
    marginBottom: spacing.sm,
    backgroundColor: colors.surface,
  },
  contactPressed: {
    backgroundColor: "#f6dfaa",
  },
  contactName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
  },
  contactPhone: {
    marginTop: 4,
    fontSize: 12,
    color: colors.textMuted,
  },
  modalOverlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
    backgroundColor: colors.overlay,
  },
  modalCard: {
    width: "100%",
    padding: spacing.lg,
    borderRadius: 22,
    backgroundColor: colors.surface,
  },
  modalTitle: {
    marginBottom: spacing.md,
    fontSize: 16,
    fontWeight: "700",
    color: colors.primary,
  },
  modalActions: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  modalButton: {
    flex: 1,
  },
});
