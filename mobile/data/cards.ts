export type CardDeck = {
  id: string;
  title: string;
  emoji: string;
  description: string;
  accent: string;
  surface: string;
  border: string;
  questions: string[];
};

export type CardSection = {
  id: string;
  heading: string;
  cards: CardDeck[];
};

export const CARD_SECTIONS: CardSection[] = [
  {
    id: "deep-talks",
    heading: "Deep & late-night talks",
    cards: [
      {
        id: "deep-questions",
        title: "Deep Questions",
        emoji: "🌙",
        description: "The ones that stay with you.",
        accent: "#FCD7D0",
        surface: "#FFF3EE",
        border: "#F29F88",
        questions: [
          "What is something about your life that you still feel a little nervous to share?",
          "When do you feel most like yourself with me?",
          "What part of our relationship feels the most healing lately?",
          "What is one dream you have that you’ve never said out loud?",
          "What do you think I misunderstand about you most often?",
          "What kind of love makes you feel safe enough to be honest?",
        ],
      },
      {
        id: "would-you-rather",
        title: "Would You Rather",
        emoji: "🎲",
        description: "Quick, funny, and surprisingly honest.",
        accent: "#DCEEFF",
        surface: "#F3F9FF",
        border: "#83B8FF",
        questions: [
          "Would you rather have a perfect beach date or a perfect movie night at home?",
          "Would you rather be the goofy one in the relationship or the emotional one?",
          "Would you rather always know what I’m thinking or always be surprised by me?",
          "Would you rather go on a spontaneous trip together or plan the dream home together?",
          "Would you rather laugh with me every day or always feel deeply understood by me?",
          "Would you rather have one perfect anniversary or ten sweet ordinary weekends?",
        ],
      },
    ],
  },
  {
    id: "playful-sparks",
    heading: "Playful sparks",
    cards: [
      {
        id: "never-have-i-ever",
        title: "Never Have I Ever",
        emoji: "🔥",
        description: "Silly confessions, zero pressure.",
        accent: "#FDE9C0",
        surface: "#FFF9EE",
        border: "#F1B558",
        questions: [
          "Never have I ever eaten dessert before dinner on purpose.",
          "Never have I ever stayed up too late to avoid a hard conversation.",
          "Never have I ever gotten a little jealous over a social media post.",
          "Never have I ever laughed so hard I cried in public.",
          "Never have I ever wanted to be someone else for a day.",
          "Never have I ever been genuinely surprised by how much I wanted someone.",
        ],
      },
      {
        id: "truth-or-dare",
        title: "Truth or Dare",
        emoji: "✨",
        description: "Low-stakes chaos and sweet bravery.",
        accent: "#E5D9FF",
        surface: "#F9F3FF",
        border: "#A48BEA",
        questions: [
          "Truth: what is one tiny thing I do that instantly makes you feel loved?",
          "Dare: tell me your most ridiculous childhood dream.",
          "Truth: what is a habit of mine that you secretly find adorable?",
          "Dare: make me laugh in under ten seconds.",
          "Truth: what is one thing you would totally change about our routine together?",
          "Dare: describe our future home in one sentence.",
        ],
      },
    ],
  },
  {
    id: "everyday-life",
    heading: "Everyday couple life",
    cards: [
      {
        id: "appreciation-list",
        title: "The Appreciation List",
        emoji: "💌",
        description: "Notice the little things.",
        accent: "#DFF7E7",
        surface: "#F3FFF8",
        border: "#77C9A2",
        questions: [
          "What is one thing I have done recently that made your day easier?",
          "What is a quality of mine that you appreciate more than I realize?",
          "What is something I’ve said that made you feel seen?",
          "What is a small habit of mine you wish others noticed more?",
          "What part of how we do life together feels especially comforting right now?",
          "What is one way I could make you feel more supported this week?",
        ],
      },
      {
        id: "getting-to-know",
        title: "Getting To Know",
        emoji: "🧭",
        description: "Fresh questions, new layers.",
        accent: "#FFE6C9",
        surface: "#FFF7F0",
        border: "#F6A867",
        questions: [
          "What is a childhood memory that still shapes how you love?",
          "What kind of energy makes you feel most like yourself?",
          "What is a talent you have that most people don’t know about?",
          "What is something small that instantly makes you feel cared for?",
          "What is one thing you think you’re better at than people expect?",
          "What is a personal rule you wish more people respected?",
        ],
      },
    ],
  },
  {
    id: "love-and-compatibility",
    heading: "Love & compatibility",
    cards: [
      {
        id: "couple-questions",
        title: "Couple Questions",
        emoji: "💞",
        description: "A little nudge toward honest closeness.",
        accent: "#F7D6E6",
        surface: "#FFF6FA",
        border: "#E47CAD",
        questions: [
          "What are you most excited about in the next chapter of us?",
          "Which part of our relationship has grown the most lately?",
          "What is one thing we do well as a couple that we should celebrate more?",
          "When do you feel most connected to me in a normal day?",
          "What is one thing you wish we talked about more openly?",
          "What is one way we can make our home life feel more like us?",
        ],
      },
      {
        id: "green-flag-red-flag",
        title: "Green Flag or Red Flag",
        emoji: "✅",
        description: "Tiny signals, huge meaning.",
        accent: "#DDF4E6",
        surface: "#F3FFF8",
        border: "#6DBD8E",
        questions: [
          "Green flag or red flag: someone who always plans ahead but never leaves room for spontaneity?",
          "Green flag or red flag: taking emotional responsibility without being asked?",
          "Green flag or red flag: listening to understand instead of just to respond?",
          "Green flag or red flag: a partner who wants quality time but also respects space?",
          "Green flag or red flag: saying “I’m okay” when you’re clearly not?",
          "Green flag or red flag: making future plans together with no pressure?",
        ],
      },
    ],
  },
  {
    id: "future-love",
    heading: "Future plans & sweet rituals",
    cards: [
      {
        id: "dream-date-night",
        title: "Dream Date Night",
        emoji: "🍽️",
        description: "A little fantasy, a lot of laughter.",
        accent: "#E5D9FF",
        surface: "#F8F3FF",
        border: "#9F87F5",
        questions: [
          "What would be your dream date if there were no budget limits?",
          "What kind of date would make you feel most relaxed and adored?",
          "What is the perfect little ritual for us to do on a random weeknight?",
          "What is your ideal way to celebrate a small win together?",
          "If we planned a full day just for us, what would make it feel magical?",
          "What is one date idea that feels both fun and deeply us?",
        ],
      },
      {
        id: "relationship-goals",
        title: "Relationship Goals",
        emoji: "🚀",
        description: "Dream big, love deeper.",
        accent: "#D9F0FF",
        surface: "#F2FAFF",
        border: "#6BAFDD",
        questions: [
          "What is one goal we have that would make our life together feel even richer?",
          "What kind of rhythm do you want us to build over the next year?",
          "What is a habit we should keep doing even when life gets busy?",
          "What does a happy, settled version of us look like?",
          "What would make you feel more like a full partner in our story?",
          "What is one emotional skill we could both grow a little more?",
        ],
      },
    ],
  },
];

export const CARD_DECKS = CARD_SECTIONS.flatMap((section) => section.cards);

export const CARD_DECK_LOOKUP = Object.fromEntries(
  CARD_DECKS.map((deck) => [deck.id, deck]),
) as Record<string, CardDeck>;
