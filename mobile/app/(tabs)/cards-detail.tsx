import { router, useLocalSearchParams } from "expo-router";
import { useRef, useState } from "react";
import {
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { CARD_DECK_LOOKUP } from "@/data/cards";

export default function CardsDetailScreen() {
  const { deckId } = useLocalSearchParams<{ deckId?: string }>();
  const deck = deckId ? CARD_DECK_LOOKUP[deckId] : undefined;
  const [index, setIndex] = useState(0);
  const [dragX, setDragX] = useState(0);

  if (!deck) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>This deck could not be found.</Text>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Back</Text>
        </Pressable>
      </View>
    );
  }

  const goNext = () => {
    setIndex((current) => (current + 1) % deck.questions.length);
  };

  const goPrevious = () => {
    setIndex(
      (current) => (current - 1 + deck.questions.length) % deck.questions.length,
    );
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) =>
        Math.abs(gesture.dx) > 15 || Math.abs(gesture.dy) > 15,
      onPanResponderMove: (_, gesture) => {
        setDragX(gesture.dx);
      },
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dx < -60) {
          goNext();
        } else if (gesture.dx > 60) {
          goPrevious();
        }
        setDragX(0);
      },
    }),
  ).current;

  const currentQuestion = deck.questions[index];

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>Back</Text>
        </Pressable>
        <Text style={styles.counter}>
          {index + 1}/{deck.questions.length}
        </Text>
      </View>

      <View
        style={[
          styles.deckHeader,
          { backgroundColor: deck.accent, borderColor: deck.border },
        ]}
      >
        <View style={[styles.emojiBubble, { backgroundColor: deck.surface }]}>
          <Text style={styles.emoji}>{deck.emoji}</Text>
        </View>
        <Text style={styles.deckTitle}>{deck.title}</Text>
      </View>

      <View
        style={[
          styles.questionCard,
          {
            backgroundColor: deck.surface,
            borderColor: deck.border,
            transform: [{ translateX: dragX * 0.12 }],
            boxShadow: `0px 12px 24px ${deck.border}50`,
          },
        ]}
        {...panResponder.panHandlers}
      >
        <Text style={styles.cardLabel}>Prompt</Text>
        <Text style={styles.questionText}>{currentQuestion}</Text>
      </View>

      <View style={styles.buttonRow}>
        <Pressable style={[styles.navButton, styles.secondaryButton]} onPress={goPrevious}>
          <Text style={styles.secondaryButtonText}>Previous</Text>
        </Pressable>
        <Pressable style={[styles.navButton, styles.primaryButton, { backgroundColor: deck.border }]} onPress={goNext}>
          <Text style={styles.primaryButtonText}>Next</Text>
        </Pressable>
      </View>

      <Text style={styles.hint}>Swipe left or right to move through this deck.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f6ff",
    paddingTop: 72,
    paddingHorizontal: 20,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  backButton: {
    backgroundColor: "#ffffff",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#dfe7ff",
    boxShadow: "0px 4px 10px rgba(41, 58, 90, 0.08)",
  },
  backButtonText: {
    color: "#2d3d5c",
    fontWeight: "700",
    fontSize: 14,
  },
  counter: {
    color: "#53627d",
    fontSize: 14,
    fontWeight: "700",
  },
  deckHeader: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },
  emojiBubble: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  emoji: {
    fontSize: 26,
  },
  deckTitle: {
    color: "#1d2540",
    fontWeight: "800",
    fontSize: 22,
  },
  questionCard: {
    borderWidth: 1,
    borderRadius: 26,
    padding: 22,
    minHeight: 250,
    justifyContent: "center",
    elevation: 4,
  },
  cardLabel: {
    color: "#53627d",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.2,
    marginBottom: 14,
    textTransform: "uppercase",
  },
  questionText: {
    color: "#1d2540",
    fontSize: 24,
    lineHeight: 32,
    fontWeight: "700",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    gap: 12,
  },
  navButton: {
    flex: 1,
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  primaryButton: {
    borderColor: "transparent",
  },
  primaryButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "800",
  },
  secondaryButton: {
    backgroundColor: "#ffffff",
    borderColor: "#dfe7ff",
  },
  secondaryButtonText: {
    color: "#2d3d5c",
    fontSize: 16,
    fontWeight: "800",
  },
  hint: {
    marginTop: 16,
    color: "#53627d",
    textAlign: "center",
    fontSize: 12,
    fontWeight: "600",
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: "#f3f6ff",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2d3d5c",
    marginBottom: 16,
  },
});
