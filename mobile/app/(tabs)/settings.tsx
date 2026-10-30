import * as Clipboard from "expo-clipboard";
import { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

import { useAuth } from "@/context/auth";
import { GradientButton } from "@/components/gradient-button";
import { API_BASE_URL, authHeaders, getErrorMessage } from "@/lib/api";

type CoupleInfo = {
  name: string | null;
  inviteCode: string;
  relationshipStartDate: string | null;
};

type ActivityDay = {
  date: string;
  count: number;
};

export default function SettingsScreen() {
  const { session } = useAuth();
  const [couple, setCouple] = useState<CoupleInfo | null>(null);
  const [weeklyActivity, setWeeklyActivity] = useState<ActivityDay[]>([]);
  const [copied, setCopied] = useState(false);
  const [message, setMessage] = useState("");

  const loadCouple = useCallback(async () => {
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
  }, [session]);

  const loadWeeklyActivity = useCallback(async () => {
    if (!session?.token) return;
    try {
      const response = await fetch(`${API_BASE_URL}/couples/activity/week`, {
        headers: authHeaders(session.token),
      });
      if (!response.ok) throw new Error(await getErrorMessage(response));
      const result = await response.json();
      setWeeklyActivity(Array.isArray(result.activity) ? result.activity : []);
    } catch (error) {
      console.warn("[Settings] failed to load weekly activity:", error);
    }
  }, [session]);

  useFocusEffect(
    useCallback(() => {
      loadCouple();
      loadWeeklyActivity();
    }, [loadCouple, loadWeeklyActivity]),
  );

  const copyInviteCode = async () => {
    if (!couple?.inviteCode) return;
    await Clipboard.setStringAsync(couple.inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const maxActivityCount = Math.max(1, ...weeklyActivity.map((day) => day.count));

  return (
    <View style={styles.container}>
      <View style={styles.backgroundGlow} pointerEvents="none">
        <View style={[styles.blob, styles.blobOne]} />
        <View style={[styles.blob, styles.blobTwo]} />
      </View>
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

      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>Weekly activity</Text>
        <Text style={styles.chartSubtitle}>Last 7 days</Text>
        <View style={styles.chartRow}>
          {weeklyActivity.length > 0 ? (
            weeklyActivity.map((day) => {
              const height = Math.max(18, (day.count / maxActivityCount) * 100);
              return (
                <View key={day.date} style={styles.chartColumn}>
                  <Text style={styles.chartCount}>{day.count}</Text>
                  <View style={styles.chartBarWrap}>
                    <View
                      style={[
                        styles.chartBar,
                        { height: `${height}%` },
                        day.count > 0 && styles.chartBarActive,
                      ]}
                    />
                  </View>
                  <Text style={styles.chartDay}>
                    {new Date(day.date).toLocaleDateString(undefined, {
                      weekday: "short",
                    })}
                  </Text>
                </View>
              );
            })
          ) : (
            <Text style={styles.empty}>No recent activity yet.</Text>
          )}
        </View>
      </View>

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
    position: "relative",
  },
  backgroundGlow: {
    ...StyleSheet.absoluteFill,
    overflow: "hidden",
  },
  blob: {
    position: "absolute",
    borderRadius: 999,
    opacity: 0.8,
  },
  blobOne: {
    width: 260,
    height: 260,
    left: -40,
    top: -30,
    backgroundColor: "rgba(255, 173, 214, 0.22)",
    shadowColor: "#ffb8d8",
    shadowOpacity: 0.35,
    shadowRadius: 60,
    elevation: 3,
  },
  blobTwo: {
    width: 280,
    height: 280,
    right: -60,
    bottom: 40,
    backgroundColor: "rgba(167, 123, 255, 0.18)",
    shadowColor: "#b582ff",
    shadowOpacity: 0.28,
    shadowRadius: 60,
    elevation: 3,
  },
  title: { fontSize: 32, fontWeight: "700", color: "#fff1f7", marginBottom: 8 },
  subtitle: { fontSize: 16, color: "#d4b1d0", marginBottom: 24 },
  chartCard: {
    marginTop: 20,
    backgroundColor: "rgba(83, 48, 92, 0.62)",
    borderColor: "rgba(255,255,255,0.18)",
    borderWidth: 1,
    borderRadius: 18,
    padding: 18,
  },
  chartTitle: {
    color: "#fff1f7",
    fontSize: 18,
    fontWeight: "800",
  },
  chartSubtitle: {
    color: "#d4b1d0",
    fontSize: 12,
    marginTop: 4,
    marginBottom: 18,
  },
  chartRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    minHeight: 132,
    gap: 8,
  },
  chartColumn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
  },
  chartCount: {
    color: "#fbd6ee",
    fontSize: 11,
    fontWeight: "700",
    marginBottom: 8,
  },
  chartBarWrap: {
    width: 22,
    height: 90,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.08)",
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  chartBar: {
    width: "100%",
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.12)",
    minHeight: 18,
  },
  chartBarActive: {
    backgroundColor: "#e58ecb",
  },
  chartDay: {
    color: "#d4b1d0",
    fontSize: 11,
    marginTop: 8,
    textTransform: "uppercase",
  },
  details: {
    backgroundColor: "rgba(83, 48, 92, 0.62)",
    borderColor: "rgba(255,255,255,0.18)",
    borderWidth: 1,
    borderRadius: 18,
    shadowColor: "#08040f",
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 4,
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
