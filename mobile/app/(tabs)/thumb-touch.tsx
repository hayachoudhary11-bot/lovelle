import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useAuth } from "@/context/auth";
import { API_BASE_URL } from "@/lib/api";
import { IconSymbol } from "@/components/ui/icon-symbol";

const TOUCH_EVENT = "touch";
const PARTNER_TOUCH_EVENT = "partner-touch";

type TouchPayload = {
  source?: string;
};

type PartnerTouchEvent = {
  fromUserId: string;
  source: string;
  timestamp: string;
};

export default function ThumbTouchScreen() {
  const { session } = useAuth();
  const [partnerPulse, setPartnerPulse] = useState(false);
  const socketRef = useRef<ReturnType<typeof io> | null>(null);

  useEffect(() => {
    if (!session?.token) return;

    const socket = io(API_BASE_URL, {
      auth: { token: session.token },
      transports: ["websocket"],
    });
    socketRef.current = socket;

    const handlePartnerTouch = (event: PartnerTouchEvent) => {
      setPartnerPulse(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setTimeout(() => setPartnerPulse(false), 450);
    };

    socket.on(PARTNER_TOUCH_EVENT, handlePartnerTouch);
    socket.on("connect", () => {
      socket.emit("join-board");
    });
    socket.on("connect_error", (error) => {
      console.warn("[Thumb touch] socket error:", error.message);
    });

    return () => {
      socket.off(PARTNER_TOUCH_EVENT, handlePartnerTouch);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [session?.token]);

  const sendTouch = (source: string) => {
    if (!session?.token || !socketRef.current) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    socketRef.current.emit(
      TOUCH_EVENT,
      { source } as TouchPayload,
      (response?: { error?: string }) => {
        if (response?.error) {
          console.warn("[Thumb touch] send failed:", response.error);
        }
      },
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#2a1230", "#4a1d4e", "#6d315f"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.hero}
      >
        <Text style={styles.title}>Thumb touch</Text>
        <Text style={styles.subtitle}>Feel close, right now.</Text>
      </LinearGradient>

      <View style={styles.touchRow}>
        <Pressable
          style={({ pressed }) => [
            styles.touchCircle,
            styles.userTouch,
            pressed && styles.pressedCircle,
          ]}
          onPressIn={() => sendTouch("user")}
          onLongPress={() => sendTouch("user")}
        >
          <IconSymbol name="fingerprint" size={42} color="#fff5fb" />
          <Text style={styles.touchLabel}>You</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.touchCircle,
            styles.partnerTouch,
            partnerPulse && styles.partnerPulse,
            pressed && styles.pressedCircle,
          ]}
          onPress={() => sendTouch("partner")}
        >
          <IconSymbol name="heart" size={42} color="#fff5fb" />
          <Text style={styles.touchLabel}>Partner</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1f0d1d",
    padding: 24,
    paddingTop: 72,
  },
  hero: {
    borderRadius: 28,
    padding: 22,
    marginBottom: 26,
    boxShadow: "0px 10px 18px rgba(232, 62, 140, 0.24)",
    elevation: 6,
  },
  title: {
    color: "#fff8fc",
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 6,
  },
  subtitle: {
    color: "#f9d8ea",
    fontSize: 15,
    fontWeight: "600",
  },
  touchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 18,
    marginTop: 12,
  },
  touchCircle: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0px 9px 18px rgba(18, 7, 18, 0.28)",
    elevation: 6,
    borderWidth: 1,
  },
  userTouch: {
    backgroundColor: "#4d2355",
    borderColor: "#8c5a8f",
  },
  partnerTouch: {
    backgroundColor: "#51316c",
    borderColor: "#9f88d1",
  },
  partnerPulse: {
    transform: [{ scale: 1.08 }],
    borderColor: "#ffd8ef",
    boxShadow: "0px 0px 22px rgba(255, 154, 200, 0.9)",
  },
  pressedCircle: {
    transform: [{ scale: 0.97 }],
    opacity: 0.9,
  },
  touchLabel: {
    marginTop: 10,
    color: "#fff5fb",
    fontSize: 18,
    fontWeight: "700",
  },
});
