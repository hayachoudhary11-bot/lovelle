import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { useAuth } from '@/context/auth';
import { GradientButton } from '@/components/gradient-button';
import { EmptyState } from '@/components/empty-state';
import { API_BASE_URL, authHeaders, getErrorMessage } from '@/lib/api';

type ChallengeQuestion = {
  _id: string;
  questionText: string;
  category?: string | null;
};

type ChallengeAnswer = {
  answeredBy: string | { _id: string; name?: string };
  answerText: string;
};

type TodayResponse = {
  date: string;
  question: ChallengeQuestion;
  answered: boolean;
  partnerAnswered: boolean;
  bothAnswered: boolean;
  answers?: ChallengeAnswer[];
};

type HistoryItem = {
  date: string;
  question: ChallengeQuestion;
  answers: ChallengeAnswer[];
};

function getAnswererName(answer: ChallengeAnswer) {
  return typeof answer.answeredBy === 'object' ? answer.answeredBy.name || 'Partner' : 'Answer';
}

export default function ChallengesScreen() {
  const { session } = useAuth();
  const [today, setToday] = useState<TodayResponse | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [answerText, setAnswerText] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const loadChallenges = async (token: string) => {
    const [todayResponse, historyResponse] = await Promise.all([
      fetch(`${API_BASE_URL}/challenges/today`, { headers: authHeaders(token) }),
      fetch(`${API_BASE_URL}/challenges/history`, { headers: authHeaders(token) }),
    ]);
    if (!todayResponse.ok) throw new Error(await getErrorMessage(todayResponse));
    if (!historyResponse.ok) throw new Error(await getErrorMessage(historyResponse));
    setToday(await todayResponse.json());
    setHistory(await historyResponse.json());
  };

  useEffect(() => {
    if (!session?.token) return;
    setLoading(true);
    loadChallenges(session.token)
      .catch((error: Error) => setMessage(error.message))
      .finally(() => setLoading(false));
  }, [session?.token]);

  const submitAnswer = async () => {
    if (!session?.token || !answerText.trim()) return;
    setSubmitting(true);
    setMessage('');
    try {
      const response = await fetch(`${API_BASE_URL}/challenges/answer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders(session.token),
        },
        body: JSON.stringify({ answerText: answerText.trim() }),
      });
      if (!response.ok) throw new Error(await getErrorMessage(response));
      setAnswerText('');
      await loadChallenges(session.token);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not submit challenge answer');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <View style={styles.center}><ActivityIndicator color="#7651b8" /></View>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Today&apos;s Challenge</Text>
      {today ? (
        <>
          <View style={styles.challengeCard}>
            {!!today.question.category && <Text style={styles.category}>{today.question.category}</Text>}
            <Text style={styles.questionText}>{today.question.questionText}</Text>
          </View>
          {!today.answered ? (
            <>
              <TextInput
                style={styles.answerInput}
                placeholder="Take on the challenge..."
                value={answerText}
                onChangeText={setAnswerText}
                multiline
              />
              <GradientButton style={styles.button} onPress={submitAnswer} disabled={submitting}>
                {submitting ? <ActivityIndicator color="#fcfaff" /> : <Text style={styles.buttonText}>Submit answer</Text>}
              </GradientButton>
            </>
          ) : today.bothAnswered ? (
            <View style={styles.statusCard}>
              <Text style={styles.statusTitle}>You both answered</Text>
              {today.answers?.map((answer, index) => (
                <Text style={styles.answer} key={`${answer.answeredBy.toString()}-${index}`}>
                  {getAnswererName(answer)}: {answer.answerText}
                </Text>
              ))}
            </View>
          ) : (
            <View style={styles.statusCard}>
              <Text style={styles.statusTitle}>Waiting for your partner</Text>
              <Text style={styles.statusText}>Their answer will appear here once they respond.</Text>
            </View>
          )}
        </>
      ) : (
        <EmptyState message="A new little challenge will be ready soon." />
      )}
      {!!message && <Text style={styles.error}>{message}</Text>}
      <Text style={styles.historyTitle}>Challenge History</Text>
      <FlatList
        data={history}
        keyExtractor={(item, index) => `${item.date}-${item.question._id}-${index}`}
        contentContainerStyle={styles.historyList}
        ListEmptyComponent={<EmptyState message="Your shared wins will build up here." />}
        renderItem={({ item }) => (
          <View style={styles.historyItem}>
            <Text style={styles.historyDate}>{new Date(item.date).toLocaleDateString()}</Text>
            <Text style={styles.historyQuestion}>{item.question.questionText}</Text>
            {item.answers.map((answer, index) => (
              <Text style={styles.historyAnswer} key={`${answer.answeredBy.toString()}-${index}`}>
                {getAnswererName(answer)}: {answer.answerText}
              </Text>
            ))}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f4efff' },
  container: { flex: 1, padding: 24, paddingTop: 72, backgroundColor: '#f4efff' },
  title: { fontSize: 32, fontWeight: '700', color: '#302443', marginBottom: 20 },
  challengeCard: { backgroundColor: '#ddd0f0', borderRadius: 18, padding: 20, marginBottom: 16, shadowColor: '#2e2050', shadowOpacity: 0.08, shadowRadius: 10, elevation: 2 },
  category: { color: '#8b5552', fontSize: 13, fontWeight: '700', textTransform: 'uppercase', marginBottom: 8 },
  questionText: { color: '#302443', fontSize: 21, lineHeight: 29, fontWeight: '700' },
  answerInput: { minHeight: 100, textAlignVertical: 'top', backgroundColor: '#fcfaff', borderColor: '#dfd1f1', borderWidth: 1, borderRadius: 18, padding: 14, fontSize: 16, marginBottom: 12, color: '#302443' },
  button: { minHeight: 50, backgroundColor: '#7651b8', borderRadius: 18, padding: 15, alignItems: 'center', justifyContent: 'center', shadowColor: '#2e2050', shadowOpacity: 0.14, shadowRadius: 8, elevation: 3 },
  buttonText: { color: '#fcfaff', fontSize: 16, fontWeight: '700' },
  statusCard: { backgroundColor: '#fcfaff', borderColor: '#dfd1f1', borderWidth: 1, borderRadius: 18, padding: 16, marginBottom: 20, shadowColor: '#2e2050', shadowOpacity: 0.07, shadowRadius: 9, elevation: 2 },
  statusTitle: { color: '#302443', fontSize: 18, fontWeight: '700', marginBottom: 6 },
  statusText: { color: '#766889' },
  answer: { color: '#302443', fontSize: 16, marginTop: 10, lineHeight: 23 },
  error: { color: '#9b496e', marginTop: 12 },
  historyTitle: { color: '#302443', fontSize: 22, fontWeight: '700', marginTop: 16, marginBottom: 8 },
  historyList: { paddingBottom: 24 },
  historyItem: { backgroundColor: '#fcfaff', borderColor: '#dfd1f1', borderWidth: 1, borderRadius: 18, padding: 14, marginBottom: 10, shadowColor: '#2e2050', shadowOpacity: 0.07, shadowRadius: 9, elevation: 2 },
  historyDate: { color: '#62409d', fontSize: 13, fontWeight: '700', marginBottom: 6 },
  historyQuestion: { color: '#302443', fontSize: 17, lineHeight: 23, fontWeight: '700' },
  historyAnswer: { color: '#766889', marginTop: 8, lineHeight: 21 },
  empty: { color: '#766889', paddingTop: 12 },
});
