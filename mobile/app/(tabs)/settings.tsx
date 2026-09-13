import * as Clipboard from "expo-clipboard";
import { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useAuth } from "@/context/auth";
import { GradientButton } from "@/components/gradient-button";
import { API_BASE_URL, authHeaders, getErrorMessage } from "@/lib/api";

type CoupleInfo = {
  name: string | null;
  inviteCode: string;
  relationshipStartDate: string | null;
};

export default function SettingsScreen() {
  const { session } = useAuth();
  const [couple, setCouple] = useState<CoupleInfo | null>(null);
  const [copied, setCopied] = useState(false);
  const [message, setMessage] = useState("");

  const loadCouple = async () => {
    if (!session?.token) return;
    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: authHeaders(session.token),
      });
      if (!response.ok) throw new Error(await getErrorMessage(response));
      const result = await response.json();
      setCouple(result.couple);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Could not load couple details",
      );
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadCouple();
    }, [session?.token]),
  );

  const copyInviteCode = async () => {
    if (!couple?.inviteCode) return;
    await Clipboard.setStringAsync(couple.inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Couple Settings</Text>
      <Text style={styles.subtitle}>Your shared couple details</Text>
      {couple ? (
        <View style={styles.details}>
          <Text style={styles.label}>Couple name</Text>
          <Text style={styles.value}>{couple.name || "Unnamed couple"}</Text>
          <Text style={styles.label}>Invite code</Text>
          <View style={styles.codeRow}>
            <Text style={styles.code}>{couple.inviteCode}</Text>
            <GradientButton style={styles.copyButton} onPress={copyInviteCode}>
              <Text style={styles.copyButtonText}>
                {copied ? "Copied" : "Copy"}
              </Text>
            </GradientButton>
          </View>
          {couple.relationshipStartDate && (
            <>
              <Text style={styles.label}>Together since</Text>
              <Text style={styles.value}>
                {new Date(couple.relationshipStartDate).toLocaleDateString()}
              </Text>
            </>
          )}
        </View>
      ) : (
        <Text style={styles.empty}>Loading couple details...</Text>
      )}
      {!!message && <Text style={styles.error}>{message}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    paddingTop: 72,
    backgroundColor: "#1f1025",
  },
  title: { fontSize: 32, fontWeight: "700", color: "#fff1f7", marginBottom: 8 },
  subtitle: { fontSize: 16, color: "#d4b1d0", marginBottom: 24 },
  details: {
    backgroundColor: "#422044",
    borderColor: "#693b69",
    borderWidth: 1,
    borderRadius: 18,
    shadowColor: "#08040f",
    shadowOpacity: 0.07,
    shadowRadius: 9,
    elevation: 2,
    padding: 20,
  },
  label: {
    color: "#f08ad0",
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
    marginTop: 16,
    marginBottom: 6,
  },
  value: { color: "#fff1f7", fontSize: 18 },
  codeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  code: { color: "#fff1f7", fontSize: 28, fontWeight: "800", letterSpacing: 3 },
  copyButton: {
    backgroundColor: "#d946b8",
    borderRadius: 18,
    shadowColor: "#08040f",
    shadowOpacity: 0.14,
    shadowRadius: 8,
    elevation: 3,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  copyButtonText: { color: "#fff1f7", fontWeight: "700" },
  empty: { color: "#d4b1d0", paddingTop: 20 },
  error: { color: "#f09ac2", marginTop: 16 },
});
