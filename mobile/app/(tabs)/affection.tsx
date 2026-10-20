import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAuth } from '@/context/auth';
import { API_BASE_URL } from '@/lib/api';

const AFFECTION_EVENT = 'affection';

type AffectionType =
  | 'kiss'
  | 'hug'
  | 'miss-you'
  | 'thinking-of-you'
  | 'good-morning'
  | 'good-night';

type AffectionEvent = {
  fromUserId: string;
  type: AffectionType;
  timestamp: string;
};

export default function AffectionScreen() {
  const { session } = useAuth();
  const [pulse, setPulse] = useState<string | null>(null);
  const socketRef = useRef<ReturnType<typeof io> | null>(null);

  useEffect(() => {
    if (!session?.token) return;

    const socket = io(API_BASE_URL, {
      auth: { token: session.token },
    });
    socketRef.current = socket;

    const handlePartnerAffection = (event: AffectionEvent) => {
      setPulse(event.type);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setTimeout(() => setPulse(null), 500);
    };

    socket.on('partner-affection', handlePartnerAffection);
    socket.on('connect', () => {
      socket.emit('join-board');
    });
    socket.on('connect_error', (error) => {
      console.warn('[Affection] socket error:', error.message);
    });

    return () => {
      socket.off('partner-affection', handlePartnerAffection);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [session?.token]);

  const sendAffection = (type: AffectionType) => {
    if (!session?.token || !socketRef.current) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    socketRef.current.emit(
      AFFECTION_EVENT,
      { type },
      (response?: { error?: string }) => {
        if (response?.error) {
          console.warn('[Affection] send failed:', response.error);
        }
      },
    );
  };

  const buttons: Array<{ type: AffectionType; label: string; icon: string; tone: string }> = [
    { type: 'kiss', label: 'Kiss', icon: '💋', tone: '#f9d4e7' },
    { type: 'hug', label: 'Hug', icon: '🤍', tone: '#dfe8ff' },
    { type: 'miss-you', label: 'Miss You', icon: '💌', tone: '#fbe7c3' },
    { type: 'thinking-of-you', label: 'Thinking of You', icon: '💭', tone: '#e6d9ff' },
    { type: 'good-morning', label: 'Good Morning', icon: '☀️', tone: '#f9e7b8' },
    { type: 'good-night', label: 'Good Night', icon: '🌙', tone: '#dfe8ff' },
  ];

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#2e1537', '#4d2147', '#7a4067']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.hero}
      >
        <Text style={styles.title}>Affection</Text>
        <Text style={styles.subtitle}>Send a warm little spark.</Text>
      </LinearGradient>

      <View style={styles.grid}>
        {buttons.map((button) => (
          <Pressable
            key={button.type}
            onPress={() => sendAffection(button.type)}
            style={({ pressed }) => [
              styles.button,
              { backgroundColor: button.tone },
              pressed && styles.pressed,
              pulse === button.type && styles.pulse,
            ]}
          >
            <Text style={styles.icon}>{button.icon}</Text>
            <Text style={styles.label}>{button.label}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1b0d1e', padding: 24, paddingTop: 72 },
  hero: { borderRadius: 28, padding: 22, marginBottom: 30, boxShadow: '0px 10px 18px rgba(232, 62, 140, 0.24)', elevation: 6 },
  title: { color: '#fff8fc', fontSize: 28, fontWeight: '800', marginBottom: 6 },
  subtitle: { color: '#f9d8ea', fontSize: 15, fontWeight: '600' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 14, justifyContent: 'space-between' },
  button: { width: '31%', minHeight: 120, borderRadius: 22, alignItems: 'center', justifyContent: 'center', padding: 16, borderWidth: 1, borderColor: 'rgba(60, 29, 52, 0.18)' },
  icon: { fontSize: 30, marginBottom: 8 },
  label: { color: '#2b1835', fontSize: 16, fontWeight: '800' },
  pulse: { transform: [{ scale: 1.04 }], shadowColor: '#f7bbd4', shadowOpacity: 0.5, shadowRadius: 16, elevation: 6 },
  pressed: { transform: [{ scale: 0.97 }], opacity: 0.9 },
});
