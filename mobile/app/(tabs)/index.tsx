import { useCallback, useState } from "react";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import {
  Alert,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { useAuth } from "@/context/auth";
import { GradientButton } from "@/components/gradient-button";
import { API_BASE_URL, authHeaders, getErrorMessage } from "@/lib/api";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { EmptyState } from "@/components/empty-state";
import { IconSymbol } from "@/components/ui/icon-symbol";

type Note = {
  _id: string;
  text: string;
  color?: string;
  createdAt?: string;
};

type Event = {
  _id: string;
  title: string;
  date: string;
  isCountdown: boolean;
};

type Photo = {
  _id: string;
  url: string;
  thumbUrl: string;
};

function getNearestCountdown(events: Event[]) {
  const now = Date.now();
  return events
    .filter(
      (event) => event.isCountdown && new Date(event.date).getTime() >= now,
    )
    .sort(
      (firstEvent, secondEvent) =>
        new Date(firstEvent.date).getTime() -
        new Date(secondEvent.date).getTime(),
    )[0];
}

function getDaysUntil(date: string) {
  return Math.ceil(
    (new Date(date).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
  );
}

export default function HomeScreen() {
  const colors = Colors[useColorScheme() === 'dark' ? 'dark' : 'light'];
  const { section } = useLocalSearchParams<{ section?: string }>();
  const showNotes = section === 'notes';
  const { session, signOut } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [countdown, setCountdown] = useState<Event | undefined>();
  const [featuredPhoto, setFeaturedPhoto] = useState<Photo | undefined>();
  const [newNote, setNewNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const loadNotes = async (authToken: string) => {
    const response = await fetch(`${API_BASE_URL}/notes`, {
      headers: authHeaders(authToken),
    });
    if (!response.ok) throw new Error(await getErrorMessage(response));
    setNotes(await response.json());
  };

  const loadCountdown = async (authToken: string) => {
    const response = await fetch(`${API_BASE_URL}/events`, {
      headers: authHeaders(authToken),
    });
    if (!response.ok) throw new Error(await getErrorMessage(response));
    setCountdown(getNearestCountdown(await response.json()));
  };

  const loadFeaturedPhoto = async (authToken: string) => {
    const [coupleResponse, photosResponse] = await Promise.all([
      fetch(`${API_BASE_URL}/auth/me`, { headers: authHeaders(authToken) }),
      fetch(`${API_BASE_URL}/photos`, { headers: authHeaders(authToken) }),
    ]);
    if (!coupleResponse.ok)
      throw new Error(await getErrorMessage(coupleResponse));
    if (!photosResponse.ok)
      throw new Error(await getErrorMessage(photosResponse));

    const coupleInfo = await coupleResponse.json();
    const photos: Photo[] = await photosResponse.json();
    const featuredPhotoId = coupleInfo.couple?.featuredPhotoId;
    setFeaturedPhoto(
      featuredPhotoId
        ? photos.find((photo) => photo._id === String(featuredPhotoId))
        : undefined,
    );
  };

  useFocusEffect(
    useCallback(() => {
      if (!session?.token) return;
      loadNotes(session.token).catch((error: Error) =>
        setMessage(error.message),
      );
      loadCountdown(session.token).catch((error: Error) =>
        setMessage(error.message),
      );
      loadFeaturedPhoto(session.token).catch((error: Error) =>
        setMessage(error.message),
      );
    }, [session?.token]),
  );

  const addNote = async () => {
    if (!session?.token || !newNote.trim()) return;
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/notes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders(session.token),
        },
        body: JSON.stringify({ text: newNote.trim() }),
      });
      if (!response.ok) throw new Error(await getErrorMessage(response));
      const createdNote = await response.json();
      setNotes((currentNotes) => [createdNote, ...currentNotes]);
      setNewNote("");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not add note");
    } finally {
      setLoading(false);
    }
  };

  const deleteNote = (noteId: string) => {
    if (!session?.token) return;
    Alert.alert(
      "Delete note?",
      "This will remove it from the shared couple account.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const response = await fetch(`${API_BASE_URL}/notes/${noteId}`, {
                method: "DELETE",
                headers: authHeaders(session.token),
              });
              if (!response.ok)
                throw new Error(await getErrorMessage(response));
              setNotes((currentNotes) =>
                currentNotes.filter((note) => note._id !== noteId),
              );
            } catch (error) {
              setMessage(
                error instanceof Error
                  ? error.message
                  : "Could not delete note",
              );
            }
          },
        },
      ],
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.homeBackground }]}>
      <LinearGradient colors={[colors.gradientStart, colors.gradientEnd]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
        <View style={styles.heroTopline}>
          <Text style={styles.heroEyebrow}>LOVELLE</Text>
          <Pressable onPress={signOut} hitSlop={10}>
            <Text style={styles.signOutHero}>Sign out</Text>
          </Pressable>
        </View>
        <View pointerEvents="none" style={styles.heroHearts}>
          <IconSymbol name="heart" size={36} color="rgba(255,244,251,0.22)" />
          <IconSymbol name="heart" size={18} color="rgba(255,244,251,0.42)" />
          <IconSymbol name="heart" size={12} color="rgba(255,244,251,0.6)" />
        </View>
        <Text style={styles.heroTitle}>{showNotes ? 'Your little love notes.' : 'Little moments, kept together.'}</Text>
        <Text style={styles.heroSubtitle}>{showNotes ? 'A private place for words meant just for you two.' : 'Choose a little way to feel closer today.'}</Text>
      </LinearGradient>
      {!showNotes && <ScrollView style={styles.featureScroll} contentContainerStyle={styles.featureSection} showsVerticalScrollIndicator={false}>
        <Text style={styles.featureEyebrow}>MAKE TIME FOR EACH OTHER</Text>
        <Text style={[styles.featureTitle, { color: colors.homeText }]}>What do you feel like doing?</Text>
        <View style={styles.featureGrid}>
          <Pressable style={[styles.featureCard, { backgroundColor: colors.homeCard, borderColor: colors.homeBorder }]} onPress={() => router.push('/?section=notes')}>
            <View style={[styles.featureIcon, { backgroundColor: '#f9d8ea' }]}>
              <IconSymbol name="heart" size={22} color={colors.loveAccent} />
            </View>
            <Text style={[styles.featureCardTitle, { color: colors.homeText }]}>Notes</Text>
            <Text style={[styles.featureCardDetail, { color: colors.homeMuted }]}>Leave a little love</Text>
          </Pressable>
          <Pressable style={[styles.featureCard, { backgroundColor: colors.homeCard, borderColor: colors.homeBorder }]} onPress={() => router.push('/messages')}>
            <View style={[styles.featureIcon, { backgroundColor: '#e7dcfa' }]}>
              <IconSymbol name="message.fill" size={22} color={colors.gradientStart} />
            </View>
            <Text style={[styles.featureCardTitle, { color: colors.homeText }]}>Chat</Text>
            <Text style={[styles.featureCardDetail, { color: colors.homeMuted }]}>Talk about today</Text>
          </Pressable>
          <Pressable style={[styles.featureCard, { backgroundColor: colors.homeCard, borderColor: colors.homeBorder }]} onPress={() => router.push('/gallery')}>
            <View style={[styles.featureIcon, { backgroundColor: '#fce8bd' }]}>
              <IconSymbol name="photo" size={22} color="#9a6518" />
            </View>
            <Text style={[styles.featureCardTitle, { color: colors.homeText }]}>Memories</Text>
            <Text style={[styles.featureCardDetail, { color: colors.homeMuted }]}>Keep the good bits</Text>
          </Pressable>
          <Pressable style={[styles.featureCard, { backgroundColor: colors.homeCard, borderColor: colors.homeBorder }]} onPress={() => router.push('/drawing')}>
            <View style={[styles.featureIcon, { backgroundColor: '#d8eee7' }]}>
              <IconSymbol name="pencil" size={22} color="#397d6a" />
            </View>
            <Text style={[styles.featureCardTitle, { color: colors.homeText }]}>Draw</Text>
            <Text style={[styles.featureCardDetail, { color: colors.homeMuted }]}>Make something together</Text>
          </Pressable>
          <Pressable style={[styles.featureCard, { backgroundColor: colors.homeCard, borderColor: colors.homeBorder }]} onPress={() => router.push('/todo')}>
            <View style={[styles.featureIcon, { backgroundColor: '#f5d7e6' }]}><IconSymbol name="checklist" size={22} color={colors.loveAccent} /></View>
            <Text style={styles.featureCardTitle}>Plans</Text><Text style={styles.featureCardDetail}>Make today feel easy</Text>
          </Pressable>
          <Pressable style={[styles.featureCard, { backgroundColor: colors.homeCard, borderColor: colors.homeBorder }]} onPress={() => router.push('/calendar')}>
            <View style={[styles.featureIcon, { backgroundColor: '#e3daf9' }]}><IconSymbol name="calendar" size={22} color="#9a76c9" /></View>
            <Text style={styles.featureCardTitle}>Dates</Text><Text style={styles.featureCardDetail}>Look forward together</Text>
          </Pressable>
          <Pressable style={[styles.featureCard, { backgroundColor: colors.homeCard, borderColor: colors.homeBorder }]} onPress={() => router.push('/prompts')}>
            <View style={[styles.featureIcon, { backgroundColor: '#f5dfb4' }]}><IconSymbol name="heart" size={22} color="#a96d20" /></View>
            <Text style={styles.featureCardTitle}>Prompts</Text><Text style={styles.featureCardDetail}>Ask something lovely</Text>
          </Pressable>
          <Pressable style={[styles.featureCard, { backgroundColor: colors.homeCard, borderColor: colors.homeBorder }]} onPress={() => router.push('/challenges')}>
            <View style={[styles.featureIcon, { backgroundColor: '#d8eee7' }]}><IconSymbol name="calendar" size={22} color="#397d6a" /></View>
            <Text style={styles.featureCardTitle}>Challenges</Text><Text style={styles.featureCardDetail}>Grow closer, playfully</Text>
          </Pressable>
        </View>
      </ScrollView>}
      {showNotes && <View style={styles.notesSection}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.homeText }]}>Shared Notes</Text>
        <Pressable onPress={() => router.replace('/')}><Text style={[styles.signOut, { color: colors.homeMuted }]}>All features</Text></Pressable>
      </View>
      {featuredPhoto && (
        <View style={styles.photoFrame}>
          <Image
            source={{ uri: featuredPhoto.url || featuredPhoto.thumbUrl }}
            style={styles.featuredImage}
            contentFit="cover"
          />
        </View>
      )}
      {countdown && (
        <View style={styles.countdown}>
          <Text style={styles.countdownLabel}>Next countdown</Text>
          <Text style={styles.countdownText}>
            {getDaysUntil(countdown.date)} days until {countdown.title}
          </Text>
        </View>
      )}
      <View style={styles.addRow}>
        <TextInput
          style={[styles.input, styles.noteInput]}
          placeholder="Write a note..."
          value={newNote}
          onChangeText={setNewNote}
        />
        <GradientButton style={styles.button} onPress={addNote} disabled={loading}>
          <Text style={styles.buttonText}>Add</Text>
        </GradientButton>
      </View>
      {!!message && <Text style={styles.error}>{message}</Text>}
      <FlatList
        data={notes}
        keyExtractor={(note) => note._id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<EmptyState message="Your shared story starts with a little note." />}
        renderItem={({ item }) => (
          <View style={[styles.note, { backgroundColor: colors.accentSoft, borderColor: colors.homeBorder }]}>
            <Text style={styles.noteText}>{item.text}</Text>
            <Pressable onPress={() => deleteNote(item._id)}>
              <Text style={styles.delete}>Delete</Text>
            </Pressable>
          </View>
        )}
      />
      </View>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    paddingTop: 72,
    backgroundColor: "#260f27",
    paddingBottom: 24,
  },
  hero: { borderRadius: 28, padding: 22, marginBottom: 20, overflow: "hidden", shadowColor: "#e83e8c", shadowOpacity: 0.32, shadowRadius: 18, elevation: 5 },
  heroTopline: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 28 },
  heroEyebrow: { color: "#f9d8ea", fontSize: 12, fontWeight: "800", letterSpacing: 1.5, marginBottom: 10 },
  heroTitle: { color: "#fff8fc", fontSize: 26, lineHeight: 32, fontWeight: "800", maxWidth: "90%" },
  heroSubtitle: { color: "#f9d8ea", fontSize: 15, lineHeight: 21, marginTop: 8, maxWidth: "88%" },
  heroHearts: { position: "absolute", right: 22, bottom: 22, width: 58, height: 54, alignItems: "center", justifyContent: "center" },
  signOutHero: { color: "#fff4fb", fontSize: 12, fontWeight: "700" },
  featureScroll: { flex: 1 },
  featureSection: { paddingBottom: 28 },
  featureEyebrow: { color: "#d8aeca", fontSize: 11, fontWeight: "800", letterSpacing: 1.2, marginBottom: 5 },
  featureTitle: { color: "#fff4fb", fontSize: 20, fontWeight: "800", marginBottom: 12 },
  featureGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  featureCard: { width: "47.5%", minHeight: 112, backgroundColor: "#431d43", borderColor: "#6d315f", borderWidth: 1, borderRadius: 18, padding: 12, shadowColor: "#120712", shadowOpacity: 0.24, shadowRadius: 8, elevation: 2 },
  featureIcon: { width: 38, height: 38, borderRadius: 13, alignItems: "center", justifyContent: "center", marginBottom: 8 },
  featureCardTitle: { color: "#fff4fb", fontSize: 16, fontWeight: "800" },
  featureCardDetail: { color: "#d8aeca", fontSize: 12, marginTop: 3 },
  notesSection: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: { fontSize: 34, lineHeight: 40, fontWeight: "700", color: "#302443", marginBottom: 8 },
  signOut: { color: "#62409d", fontWeight: "700" },
  photoFrame: {
    backgroundColor: "#fcfaff",
    borderColor: "#dfd1f1",
    borderWidth: 1,
    borderRadius: 18,
    shadowColor: "#2e2050",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
    padding: 6,
    marginBottom: 20,
  },
  featuredImage: { width: "100%", height: 150, borderRadius: 12 },
  countdown: {
    backgroundColor: "#d9c5f4",
    borderRadius: 18,
    padding: 16,
    marginBottom: 20,
  },
  countdownLabel: {
    color: "#62409d",
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
    marginBottom: 5,
  },
  countdownText: { color: "#302443", fontSize: 18, fontWeight: "700" },
  subtitle: { fontSize: 16, color: "#766889", marginBottom: 24 },
  input: {
    backgroundColor: "#fcfaff",
    borderColor: "#dfd1f1",
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
    fontSize: 16,
    marginBottom: 12,
  },
  button: {
    backgroundColor: "#7651b8",
    borderRadius: 18,
    shadowColor: "#2e2050",
    shadowOpacity: 0.14,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
    padding: 14,
    alignItems: "center",
  },
  buttonText: { color: "#fcfaff", fontSize: 16, fontWeight: "700" },
  error: { color: "#9b496e", marginTop: 16 },
  addRow: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  noteInput: { flex: 1 },
  list: { paddingTop: 12, paddingBottom: 24 },
  empty: { color: "#766889", paddingTop: 24 },
  note: {
    backgroundColor: "#d9c5f4",
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  noteText: { flex: 1, color: "#302443", fontSize: 18, lineHeight: 24, fontWeight: "700" },
  delete: { color: "#9b496e", fontWeight: "700" },
});
