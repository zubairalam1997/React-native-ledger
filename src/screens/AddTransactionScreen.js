import React, { useState } from "react";
import { Alert, Image, Pressable, StyleSheet, Text, View } from "react-native";
import ScreenContainer from "../components/ScreenContainer";
import AppHeader from "../components/AppHeader";
import FormField from "../components/FormField";
import PrimaryButton from "../components/PrimaryButton";
import { useTransactionContext } from "../context/TransactionContext";
import { todayString } from "../lib/formatters";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import * as ImagePicker from "expo-image-picker";

export default function AddTransactionScreen({ navigation, route }) {
  const { type, customer, confirmationMode } = route.params || {};
  const { addTransaction } = useTransactionContext();

  const [amount, setAmount] = useState("");
  const [desc, setDesc] = useState("");
  const [date, setDate] = useState(todayString());
  const [billImageUri, setBillImageUri] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!customer) {
    navigation.replace("LedgerHome");
    return null;
  }

  const handleImagePick = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission required", "Photo library access is needed to attach a bill image.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled && result.assets?.[0]?.uri) {
      setBillImageUri(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    const numAmount = parseFloat(amount);
    if (Number.isNaN(numAmount) || numAmount <= 0) {
      Alert.alert("Invalid amount", "Please enter a valid amount.");
      return;
    }

    setLoading(true);
    try {
      await addTransaction(
        {
          customerId: customer.id,
          receiverPhone: customer.phone,
          type: type === "given" ? "given" : "received",
          note: desc,
          date: new Date(date).toISOString(),
          amount: numAmount,
          confirmationMode: confirmationMode || "SIMPLE",
        },
        billImageUri
      );

      navigation.goBack();
    } catch (error) {
      Alert.alert("Save failed", error.message || "Unable to save transaction.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer scroll>
      <AppHeader
        title={type === "given" ? "You Gave (Udhaar)" : "You Got (Jama)"}
        subtitle={`Transaction with ${customer.name}`}
        leftLabel="Back"
        onLeftPress={navigation.goBack}
      />

      <View style={styles.content}>
        <View style={styles.amountCard}>
          <Text style={styles.currency}>Rs</Text>
          <FormField
            value={amount}
            onChangeText={setAmount}
            placeholder="0"
            keyboardType="decimal-pad"
            inputStyle={styles.amountInput}
          />
          {confirmationMode === "STRICT" ? <Text style={styles.strictText}>This transaction requires confirmation.</Text> : null}
        </View>

        <FormField
          label="Description"
          value={desc}
          onChangeText={setDesc}
          placeholder="Enter details"
          multiline
          style={styles.fieldGap}
        />

        <FormField
          label="Date"
          value={date}
          onChangeText={setDate}
          placeholder="YYYY-MM-DD"
          style={styles.fieldGap}
        />

        <View style={styles.attachmentCard}>
          <Text style={styles.attachmentLabel}>Bill Attachment</Text>
          <Pressable onPress={handleImagePick} style={({ pressed }) => [styles.attachButton, pressed ? styles.attachPressed : null]}>
            <Text style={styles.attachText}>{billImageUri ? "Change Bill" : "Attach Bill"}</Text>
          </Pressable>

          {billImageUri ? (
            <View style={styles.previewWrap}>
              <Image source={{ uri: billImageUri }} style={styles.previewImage} />
              <Pressable onPress={() => setBillImageUri(null)} style={styles.removeButton}>
                <Text style={styles.removeText}>Remove</Text>
              </Pressable>
            </View>
          ) : null}
        </View>
      </View>

      <View style={styles.footer}>
        <PrimaryButton label="Cancel" variant="secondary" onPress={navigation.goBack} style={styles.footerButton} />
        <PrimaryButton
          label={loading ? "Saving..." : "Save Transaction"}
          variant={type === "given" ? "danger" : "success"}
          onPress={handleSave}
          loading={loading}
          style={styles.footerButton}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.md,
    gap: spacing.md,
  },
  amountCard: {
    padding: spacing.lg,
    borderRadius: 22,
    backgroundColor: colors.surface,
  },
  currency: {
    marginBottom: spacing.sm,
    fontSize: 20,
    fontWeight: "700",
    color: colors.textMuted,
  },
  amountInput: {
    minHeight: 68,
    fontSize: 32,
    fontWeight: "700",
  },
  strictText: {
    marginTop: spacing.sm,
    fontSize: 12,
    color: colors.warning,
  },
  fieldGap: {
    marginBottom: 0,
  },
  attachmentCard: {
    padding: spacing.lg,
    borderRadius: 22,
    backgroundColor: colors.surface,
  },
  attachmentLabel: {
    marginBottom: spacing.sm,
    fontSize: 14,
    fontWeight: "700",
    color: colors.primary,
  },
  attachButton: {
    minHeight: 46,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  attachPressed: {
    backgroundColor: "#f6dfaa",
  },
  attachText: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.primary,
  },
  previewWrap: {
    marginTop: spacing.md,
    alignItems: "flex-start",
  },
  previewImage: {
    width: 120,
    height: 120,
    borderRadius: 18,
  },
  removeButton: {
    marginTop: spacing.sm,
  },
  removeText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.danger,
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
});
