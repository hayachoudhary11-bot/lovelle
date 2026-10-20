import { useCallback, useEffect, useRef, useState } from "react";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import {
  Alert,
  Animated,
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
  createdAt?: string;
};

type CoupleSummary = {
  name?: string | null;
  relationshipStartDate?: string | null;
  createdAt?: string;
  members?: Array<string | null>;
};

const FEATURE_WIDGETS = [
  {
    title: "Notes",
    description: "Leave a little love",
    route: "/?section=notes",
    icon: "heart",
    iconColor: "#f9d8ea",
    tint: "#e6488f",
  },
  {
    title: "Messages",
    description: "Talk about today",
    route: "/messages",
    icon: "message.fill",
    iconColor: "#e7dcfa",
    tint: "#7651b8",
  },
  {
    title: "Thumb touch",
    description: "Feel close, right now.",
    route: "/thumb-touch",
    icon: "fingerprint",
    iconColor: "#f5d7e6",
    tint: "#d93688",
  },
  {
    title: "Gallery",
    description: "Keep the good bits",
    route: "/gallery",
    icon: "photo",
    iconColor: "#fce8bd",
    tint: "#9a6518",
  },
  {
    title: "Drawing",
    description: "Make something together",
    route: "/drawing",
    icon: "pencil",
    iconColor: "#d8eee7",
    tint: "#397d6a",
  },
  {
    title: "To-Do",
    description: "Make today feel easy",
    route: "/todo",
    icon: "checklist",
    iconColor: "#f5d7e6",
    tint: "#e6488f",
  },
  {
    title: "Bucket List",
    description: "Dream a little bigger",
    route: "/bucket-list",
    icon: "list.bullet",
    iconColor: "#dff3ff",
    tint: "#4c8ed9",
  },
  {
    title: "Affection",
    description: "Send a warm little spark",
    route: "/affection",
    icon: "heart",
    iconColor: "#fbd8e7",
    tint: "#d14685",
  },
  {
    title: "Calendar",
    description: "Look forward together",
    route: "/calendar",
    icon: "calendar",
    iconColor: "#e3daf9",
    tint: "#9a76c9",
  },
  {
    title: "Cards",
    description: "spark a conversation",
    route: "/cards",
    icon: "gamepad",
    iconColor: "#dff8dc",
    tint: "#3a8f6a",
  },
  {
    title: "Prompts",
    description: "Ask something lovely",
    route: "/prompts",
    icon: "questionmark.circle",
    iconColor: "#f5dfb4",
    tint: "#a96d20",
  },
  {
    title: "Challenges",
    description: "Grow closer, playfully",
    route: "/challenges",
    icon: "flag",
    iconColor: "#d8eee7",
    tint: "#397d6a",
  },
] as const;

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

function getTogetherParts(startDate: Date) {
  const now = new Date();
  const from = new Date(startDate);
  from.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);

  let years = now.getFullYear() - from.getFullYear();
  let months = now.getMonth() - from.getMonth();
  let days = now.getDate() - from.getDate();

  if (days < 0) {
    const previousMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    days += previousMonth.getDate();
    months -= 1;
  }

  if (months < 0) {
    years -= 1;
    months += 12;
  }

  return { years, months, days };
}

export default function HomeScreen() {
  const colors = Colors[useColorScheme() === "dark" ? "dark" : "light"];
  const { section } = useLocalSearchParams<{ section?: string }>();
  const showNotes = section === "notes";
  const { session, signOut } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [countdown, setCountdown] = useState<Event | undefined>();
  const [featuredPhoto, setFeaturedPhoto] = useState<Photo | undefined>();
  const [galleryPhotos, setGalleryPhotos] = useState<Photo[]>([]);
  const [coupleStatus, setCoupleStatus] = useState<{
    currentStreak?: number;
    lastActivityAt?: string | null;
  } | null>(null);
  const [couple, setCouple] = useState<CoupleSummary | null>(null);
  const [currentUserName, setCurrentUserName] = useState("You");
  const [newNote, setNewNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const entranceAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(entranceAnimation, {
      toValue: 1,
      duration: 420,
      delay: 80,
      useNativeDriver: true,
    }).start();
  }, [entranceAnimation]);

  const hasPartner = (couple?.members?.filter(Boolean).length ?? 0) > 1;
  const startDate =
    couple?.relationshipStartDate || couple?.createdAt
      ? new Date(
          couple?.relationshipStartDate ||
            couple?.createdAt ||
            new Date().toISOString(),
        )
      : new Date();
  const anniversaryParts = getTogetherParts(startDate);
  const userInitial = currentUserName.trim().charAt(0).toUpperCase() || "Y";
  const partnerInitial = hasPartner ? "P" : "?";
  const latestGalleryPhotos = [...galleryPhotos]
    .sort(
      (firstPhoto, secondPhoto) =>
        new Date(secondPhoto.createdAt || 0).getTime() -
        new Date(firstPhoto.createdAt || 0).getTime(),
    )
    .slice(0, 2);
  const latestGalleryPhoto = latestGalleryPhotos[0];

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
    const [coupleResponse, photosResponse, statusResponse] = await Promise.all([
      fetch(`${API_BASE_URL}/auth/me`, { headers: authHeaders(authToken) }),
      fetch(`${API_BASE_URL}/photos`, { headers: authHeaders(authToken) }),
      fetch(`${API_BASE_URL}/couples/status`, { headers: authHeaders(authToken) }),
    ]);

    try {
      await fetch(`${API_BASE_URL}/couples/activity`, {
        method: "POST",
        headers: authHeaders(authToken),
      });
    } catch {
      // Ignore streak sync failures here; the home screen should still render.
    }
    if (!coupleResponse.ok)
      throw new Error(await getErrorMessage(coupleResponse));
    if (!photosResponse.ok)
      throw new Error(await getErrorMessage(photosResponse));
    if (!statusResponse.ok)
      throw new Error(await getErrorMessage(statusResponse));

    const coupleInfo = await coupleResponse.json();
    const photos: Photo[] = await photosResponse.json();
    const statusResult = await statusResponse.json();
    const featuredPhotoId = coupleInfo.couple?.featuredPhotoId;
    setGalleryPhotos(photos);
    setFeaturedPhoto(
      featuredPhotoId
        ? photos.find((photo) => photo._id === String(featuredPhotoId))
        : undefined,
    );
    setCoupleStatus(statusResult.couple || null);
    setCurrentUserName(coupleInfo.user?.name || "You");
    setCouple(coupleInfo.couple || null);
  };

  useFocusEffect(
    useCallback(() => {
      if (!session?.token) return;
      setMessage("");
      loadNotes(session.token).catch((error: Error) => {
        console.warn("[loadNotes error]:", error.message);
        setMessage(error.message);
      });
      loadCountdown(session.token).catch((error: Error) => {
        console.warn("[loadCountdown error]:", error.message);
      });
      loadFeaturedPhoto(session.token).catch((error: Error) => {
        console.warn("[loadFeaturedPhoto error]:", error.message);
      });
    }, [session?.token]),
  );

  const addNote = async () => {
    if (!session?.token || !newNote.trim()) return;
    setLoading(true);
    setMessage("");
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
      try {
        await fetch(`${API_BASE_URL}/couples/activity`, {
          method: "POST",
          headers: authHeaders(session.token),
        });
      } catch {
        // Ignore streak sync failures; note creation still succeeded.
      }
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
            setMessage("");
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
    <View
      style={[styles.container, { backgroundColor: colors.homeBackground }]}
    >
      <View style={styles.glassBackground} pointerEvents="none">
        <View style={[styles.glassBlob, styles.glassBlobOne]} />
        <View style={[styles.glassBlob, styles.glassBlobTwo]} />
        <View style={[styles.glassBlob, styles.glassBlobThree]} />
      </View>
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.hero}
      >
        <View style={styles.heroTopline}>
          <Text style={styles.heroEyebrow}>LOVELLE</Text>
          <Pressable onPress={signOut} hitSlop={10}>
            <Text style={styles.signOutHero}>Sign out</Text>
          </Pressable>
        </View>
        <View style={[styles.heroHearts, { pointerEvents: "none" }]}>
          <IconSymbol name="heart" size={36} color="rgba(255,244,251,0.22)" />
          <IconSymbol name="heart" size={18} color="rgba(255,244,251,0.42)" />
          <IconSymbol name="heart" size={12} color="rgba(255,244,251,0.6)" />
        </View>
        <Text style={styles.heroTitle}>
          {showNotes
            ? "Your little love notes."
            : "Little moments, kept together."}
        </Text>
        <Text style={styles.heroSubtitle}>
          {showNotes
            ? "A private place for words meant just for you two."
            : "Choose a little way to feel closer today."}
        </Text>
      </LinearGradient>
      {!showNotes && (
        <Animated.View
          style={[
            styles.homeContent,
            {
              opacity: entranceAnimation,
              transform: [
                {
                  translateY: entranceAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [18, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <ScrollView
            style={styles.featureScroll}
            contentContainerStyle={styles.featureSection}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.coupleHeaderRow}>
              <View style={styles.partnerCell}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{userInitial}</Text>
                </View>
                <Text style={styles.partnerName}>{currentUserName}</Text>
              </View>

              <View style={styles.heartBadge}>
                <IconSymbol name="heart" size={18} color="#fff5fb" />
              </View>

              <View style={styles.streakBadge}>
                <IconSymbol name="flame" size={14} color="#ffb86b" />
                <Text style={styles.streakValue}>{coupleStatus?.currentStreak ?? 0}</Text>
              </View>

              <View style={styles.partnerCell}>
                <View style={[styles.avatar, styles.partnerAvatar]}>
                  <Text style={styles.avatarText}>{partnerInitial}</Text>
                </View>
                <Text style={styles.partnerName}>
                  {hasPartner ? "Partner" : "Waiting"}
                </Text>
              </View>

              <View style={styles.statPillStack}>
                <View style={styles.statChip}>
                  <View style={[styles.statChipIcon, { backgroundColor: "#f8d9eb" }]}>
                    <IconSymbol name="heart" size={12} color="#9d3b75" />
                  </View>
                  <Text style={styles.statChipText}>{notes.length}</Text>
                </View>
                <View style={styles.statChip}>
                  <View style={[styles.statChipIcon, { backgroundColor: "#f5d7a1" }]}>
                    <IconSymbol name="photo" size={12} color="#8c5f18" />
                  </View>
                  <Text style={styles.statChipText}>{galleryPhotos.length}</Text>
                </View>
              </View>
            </View>

            <View style={styles.anniversaryPhotoStack}>
              {latestGalleryPhotos.length > 0 ? (
                latestGalleryPhotos.map((photo, index) => (
                  <View
                    key={photo._id}
                    style={[
                      styles.partnerThumbFrame,
                      index > 0 ? styles.partnerThumbFrameSecondary : null,
                    ]}
                  >
                    <Image
                      source={{ uri: photo.thumbUrl || photo.url }}
                      style={styles.partnerThumb}
                      contentFit="cover"
                    />
                  </View>
                ))
              ) : (
                <>
                  <View style={styles.avatarMini}>
                    <Text style={styles.avatarText}>{userInitial}</Text>
                  </View>
                  <View style={[styles.avatarMini, styles.partnerAvatarMini]}>
                    <Text style={styles.avatarText}>{partnerInitial}</Text>
                  </View>
                </>
              )}
            </View>

            <View style={styles.anniversaryCard}>
              <LinearGradient
                colors={["rgba(255, 187, 225, 0.15)", "rgba(139, 92, 197, 0.12)"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.anniversaryGlow}
              />
              <View style={styles.anniversaryPattern} pointerEvents="none">
                <View style={styles.patternOrbOne} />
                <View style={styles.patternOrbTwo} />
                <View style={styles.patternOrbThree} />
              </View>
              <Text style={styles.anniversaryLabel}>Together for</Text>
              <View style={styles.anniversaryRow}>
                <View style={styles.anniversaryBox}>
                  <Text style={styles.anniversaryValue}>
                    {anniversaryParts.years}
                  </Text>
                  <Text style={styles.anniversaryUnit}>Years</Text>
                </View>
                <View style={styles.anniversaryBox}>
                  <Text style={styles.anniversaryValue}>
                    {anniversaryParts.months}
                  </Text>
                  <Text style={styles.anniversaryUnit}>Months</Text>
                </View>
                <View style={styles.anniversaryBox}>
                  <Text style={styles.anniversaryValue}>
                    {anniversaryParts.days}
                  </Text>
                  <Text style={styles.anniversaryUnit}>Days</Text>
                </View>
              </View>
            </View>

            <Text style={styles.featureEyebrow}>MAKE TIME FOR EACH OTHER</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.featureWidgetRow}
            >
              {FEATURE_WIDGETS.map((feature) => {
                const isGalleryCard = feature.title === "Gallery";
                const hasGalleryPreview = isGalleryCard && !!latestGalleryPhoto;

                return (
                  <Pressable
                    key={feature.title}
                    style={[
                      styles.featureWidgetCard,
                      hasGalleryPreview && styles.featureWidgetCardPreview,
                    ]}
                    onPress={() => router.push(feature.route)}
                  >
                    {hasGalleryPreview && (
                      <>
                        <Image
                          source={{
                            uri:
                              latestGalleryPhoto.thumbUrl || latestGalleryPhoto.url,
                          }}
                          style={styles.featureWidgetPreviewImage}
                          contentFit="cover"
                        />
                        <View style={styles.featureWidgetPreviewOverlay} />
                      </>
                    )}
                    <View
                      style={[
                        styles.featureWidgetIcon,
                        { backgroundColor: feature.iconColor },
                      ]}
                    >
                      <IconSymbol
                        name={feature.icon as any}
                        size={22}
                        color={feature.tint}
                      />
                    </View>
                    <Text style={styles.featureWidgetTitle}>{feature.title}</Text>
                    <Text style={styles.featureWidgetDetail}>
                      {feature.description}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </ScrollView>
        </Animated.View>
      )}
      {showNotes && (
        <View style={styles.notesSection}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.homeText }]}>
              Shared Notes
            </Text>
            <Pressable onPress={() => router.replace("/")}>
              <Text style={[styles.signOut, { color: colors.homeMuted }]}>
                All features
              </Text>
            </Pressable>
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
              placeholderTextColor="#d7bfd1"
              value={newNote}
              onChangeText={setNewNote}
            />
            <GradientButton
              style={styles.button}
              onPress={addNote}
              disabled={loading}
            >
              <Text style={styles.buttonText}>Add</Text>
            </GradientButton>
          </View>
          {!!message && <Text style={styles.error}>{message}</Text>}
          <FlatList
            data={notes}
            keyExtractor={(note) => note._id}
            contentContainerStyle={styles.list}
            ListEmptyComponent={
              <EmptyState message="Your shared story starts with a little note." />
            }
            renderItem={({ item }) => (
              <View
                style={[
                  styles.note,
                  {
                    backgroundColor: colors.accentSoft,
                    borderColor: colors.homeBorder,
                  },
                ]}
              >
                <Text style={styles.noteText}>{item.text}</Text>
                <Pressable onPress={() => deleteNote(item._id)}>
                  <Text style={styles.delete}>Delete</Text>
                </Pressable>
              </View>
            )}
          />
        </View>
      )}
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
    position: "relative",
  },
  glassBackground: {
    ...StyleSheet.absoluteFill,
    overflow: "hidden",
  },
  glassBlob: {
    position: "absolute",
    borderRadius: 999,
    opacity: 0.9,
  },
  glassBlobOne: {
    width: 260,
    height: 260,
    top: -40,
    left: -30,
    backgroundColor: "rgba(255, 184, 220, 0.23)",
    shadowColor: "#ffb8d8",
    shadowOpacity: 0.28,
    shadowRadius: 40,
    elevation: 4,
  },
  glassBlobTwo: {
    width: 300,
    height: 300,
    right: -40,
    top: 120,
    backgroundColor: "rgba(185, 140, 255, 0.18)",
    shadowColor: "#b98cff",
    shadowOpacity: 0.26,
    shadowRadius: 48,
    elevation: 4,
  },
  glassBlobThree: {
    width: 200,
    height: 200,
    left: 110,
    bottom: -30,
    backgroundColor: "rgba(255, 146, 201, 0.12)",
    shadowColor: "#ff93c9",
    shadowOpacity: 0.2,
    shadowRadius: 36,
    elevation: 2,
  },
  hero: {
    borderRadius: 28,
    padding: 22,
    marginBottom: 20,
    overflow: "hidden",
    backgroundColor: "rgba(79, 45, 90, 0.54)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    boxShadow: "0px 10px 22px rgba(232, 62, 140, 0.28)",
    elevation: 5,
  },
  heroTopline: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 28,
  },
  heroEyebrow: {
    color: "#f9d8ea",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  heroTitle: {
    color: "#fff8fc",
    fontSize: 26,
    lineHeight: 32,
    fontWeight: "800",
    maxWidth: "90%",
  },
  heroSubtitle: {
    color: "#f9d8ea",
    fontSize: 15,
    lineHeight: 21,
    marginTop: 8,
    maxWidth: "88%",
  },
  heroHearts: {
    position: "absolute",
    right: 22,
    bottom: 22,
    width: 58,
    height: 54,
    alignItems: "center",
    justifyContent: "center",
  },
  signOutHero: { color: "#fff4fb", fontSize: 12, fontWeight: "700" },
  homeContent: { flex: 1 },
  featureScroll: { flex: 1 },
  featureSection: { paddingBottom: 28 },
  coupleHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
    paddingHorizontal: 4,
  },
  partnerCell: { alignItems: "center", flex: 1 },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#f5d7e6",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#fff7fb",
    marginBottom: 8,
  },
  partnerAvatar: { backgroundColor: "#e3daf9" },
  avatarText: { color: "#392148", fontSize: 18, fontWeight: "800" },
  partnerName: { color: "#fff4fb", fontSize: 14, fontWeight: "700" },
  heartBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 8,
  },
  streakBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 184, 107, 0.14)",
    borderColor: "rgba(255, 184, 107, 0.4)",
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 6,
    marginRight: 8,
    gap: 4,
  },
  streakValue: {
    color: "#fff4fb",
    fontSize: 11,
    fontWeight: "800",
  },
  statPillStack: {
    marginLeft: 10,
    gap: 8,
    alignItems: "flex-end",
  },
  statChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: 5,
    paddingHorizontal: 10,
    gap: 6,
  },
  statChipIcon: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  statChipText: {
    color: "#fff4fb",
    fontSize: 12,
    fontWeight: "800",
  },
  anniversaryPhotoStack: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
    marginTop: -2,
  },
  partnerThumbFrame: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 2,
    borderColor: "#fff4fb",
    overflow: "hidden",
    backgroundColor: "#f5d7e6",
  },
  partnerThumbFrameSecondary: {
    marginLeft: -8,
  },
  partnerThumb: { width: "100%", height: "100%" },
  avatarMini: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#f5d7e6",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#fff7fb",
  },
  partnerAvatarMini: { backgroundColor: "#e3daf9", marginLeft: -8 },
  anniversaryCard: {
    position: "relative",
    backgroundColor: "rgba(74, 44, 82, 0.58)",
    borderColor: "rgba(255,255,255,0.18)",
    borderWidth: 1,
    borderRadius: 24,
    padding: 18,
    marginBottom: 18,
    overflow: "hidden",
    boxShadow: "0px 6px 18px rgba(18, 7, 18, 0.2)",
    elevation: 3,
  },
  anniversaryGlow: {
    ...StyleSheet.absoluteFill,
    opacity: 0.9,
  },
  anniversaryPattern: {
    ...StyleSheet.absoluteFill,
    opacity: 0.7,
  },
  patternOrbOne: {
    position: "absolute",
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "rgba(255, 168, 214, 0.12)",
    top: -30,
    left: -8,
  },
  patternOrbTwo: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(160, 120, 255, 0.08)",
    bottom: -42,
    right: -22,
  },
  patternOrbThree: {
    position: "absolute",
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "rgba(255, 214, 144, 0.08)",
    top: 10,
    right: 48,
  },
  anniversaryLabel: {
    position: "relative",
    color: "#f7d8ea",
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1.1,
    marginBottom: 14,
  },
  anniversaryRow: {
    position: "relative",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  anniversaryBox: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 92,
  },
  anniversaryValue: { color: "#fff4fb", fontSize: 26, fontWeight: "800" },
  anniversaryUnit: {
    color: "#d8aeca",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 6,
  },
  featureEyebrow: {
    color: "#d8aeca",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.2,
    marginBottom: 10,
  },
  featureWidgetRow: { paddingRight: 12, paddingBottom: 8 },
  featureWidgetCard: {
    width: 176,
    minHeight: 150,
    backgroundColor: "rgba(71, 42, 79, 0.6)",
    borderColor: "rgba(255,255,255,0.14)",
    borderWidth: 1,
    borderRadius: 22,
    padding: 14,
    marginRight: 12,
    boxShadow: "0px 5px 12px rgba(18, 7, 18, 0.18)",
    elevation: 2,
    overflow: "hidden",
    justifyContent: "flex-end",
  },
  featureWidgetCardPreview: {
    paddingTop: 12,
  },
  featureWidgetPreviewImage: {
    ...StyleSheet.absoluteFill,
    opacity: 0.85,
  },
  featureWidgetPreviewOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(29, 12, 33, 0.42)",
  },
  featureWidgetIcon: {
    position: "relative",
    width: 52,
    height: 52,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
    zIndex: 1,
  },
  featureWidgetTitle: {
    position: "relative",
    color: "#fff4fb",
    fontSize: 17,
    fontWeight: "800",
    marginBottom: 4,
    zIndex: 1,
  },
  featureWidgetDetail: {
    position: "relative",
    color: "#f8dfe9",
    fontSize: 12,
    lineHeight: 18,
    zIndex: 1,
  },
  notesSection: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontSize: 34,
    lineHeight: 40,
    fontWeight: "700",
    color: "#fff5fb",
    marginBottom: 8,
  },
  signOut: { color: "#f8d7ea", fontWeight: "700" },
  photoFrame: {
    backgroundColor: "#351526",
    borderColor: "#70324e",
    borderWidth: 1,
    borderRadius: 18,
    boxShadow: "0px 5px 12px rgba(46, 32, 80, 0.12)",
    elevation: 3,
    padding: 6,
    marginBottom: 20,
  },
  featuredImage: { width: "100%", height: 150, borderRadius: 12 },
  countdown: {
    backgroundColor: "#54233d",
    borderRadius: 18,
    padding: 16,
    marginBottom: 20,
  },
  countdownLabel: {
    color: "#ffd3e6",
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
    marginBottom: 5,
  },
  countdownText: { color: "#fff9fc", fontSize: 18, fontWeight: "700" },
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
    boxShadow: "0px 5px 12px rgba(46, 32, 80, 0.18)",
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
  noteText: {
    flex: 1,
    color: "#fff5fb",
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "700",
  },
  delete: { color: "#ffd8eb", fontWeight: "700" },
});
