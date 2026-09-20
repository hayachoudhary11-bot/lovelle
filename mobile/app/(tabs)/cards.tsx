import { router } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { CARD_SECTIONS } from "@/data/cards";

export default function CardsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cards</Text>
      <Text style={styles.subtitle}>Little decks for better conversation.</Text>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {CARD_SECTIONS.map((section) => (
          <View key={section.id} style={styles.sectionBlock}>
            <Text style={styles.sectionTitle}>{section.heading}</Text>

            <View style={styles.cardRow}>
              {section.cards.map((card) => (
                <Pressable
                  key={card.id}
                  style={[
                    styles.deckCard,
                    {
                      backgroundColor: card.surface,
                      borderColor: card.border,
                      boxShadow: `0px 8px 18px ${card.border}33`,
                    },
                  ]}
                  onPress={() =>
                    router.push({
                      pathname: "/cards-detail",
                      params: { deckId: card.id },
                    })
                  }
                >
                  <View
                    style={[
                      styles.emojiBubble,
                      { backgroundColor: card.accent },
                    ]}
                  >
                    <Text style={styles.emoji}>{card.emoji}</Text>
                  </View>

                  <Text style={styles.cardTitle}>{card.title}</Text>
                  <Text style={styles.cardDescription}>{card.description}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f7ff",
    paddingTop: 72,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 34,
    fontWeight: "800",
    color: "#202a44",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    color: "#53627d",
    marginBottom: 18,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  sectionBlock: {
    marginBottom: 20,
  },
  sectionTitle: {
    color: "#2d3d5c",
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 10,
    letterSpacing: 0.3,
  },
  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  deckCard: {
    flex: 1,
    minHeight: 170,
    borderRadius: 22,
    borderWidth: 1,
    padding: 16,
    elevation: 3,
  },
  emojiBubble: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emoji: {
    fontSize: 26,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1d2540",
    marginBottom: 6,
  },
  cardDescription: {
    fontSize: 12.5,
    lineHeight: 18,
    color: "#4f5f7d",
    fontWeight: "600",
  },
});
