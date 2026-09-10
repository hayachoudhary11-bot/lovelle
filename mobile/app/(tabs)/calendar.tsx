import { useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Switch, Text, TextInput, View } from 'react-native';

import { useAuth } from '@/context/auth';
import { GradientButton } from '@/components/gradient-button';
import { EmptyState } from '@/components/empty-state';
import { API_BASE_URL, authHeaders, getErrorMessage } from '@/lib/api';

type Event = {
  _id: string;
  title: string;
  date: string;
  notes?: string;
  isCountdown: boolean;
};

function formatDate(date: string) {
  return new Date(date).toLocaleDateString();
}

export default function CalendarScreen() {
  const { session } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [notes, setNotes] = useState('');
  const [isCountdown, setIsCountdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const loadEvents = async (token: string) => {
    const response = await fetch(`${API_BASE_URL}/events`, {
      headers: authHeaders(token),
    });
    if (!response.ok) throw new Error(await getErrorMessage(response));
    setEvents(await response.json());
  };

  useEffect(() => {
    if (!session?.token) return;
    loadEvents(session.token).catch((error: Error) => setMessage(error.message));
  }, [session?.token]);

  const addEvent = async () => {
    if (!session?.token || !title.trim() || !date.trim()) {
      setMessage('Title and date are required');
      return;
    }

    const parsedDate = new Date(`${date.trim()}T12:00:00`);
    if (Number.isNaN(parsedDate.getTime())) {
      setMessage('Use a date like 2026-12-31');
      return;
    }

    setLoading(true);
    setMessage('');
    try {
      const response = await fetch(`${API_BASE_URL}/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders(session.token),
        },
        body: JSON.stringify({
          title: title.trim(),
          date: parsedDate.toISOString(),
          notes: notes.trim(),
          isCountdown,
        }),
      });
      if (!response.ok) throw new Error(await getErrorMessage(response));
      const createdEvent: Event = await response.json();
      setEvents((currentEvents) =>
        [...currentEvents, createdEvent].sort(
          (firstEvent, secondEvent) => new Date(firstEvent.date).getTime() - new Date(secondEvent.date).getTime(),
        ),
      );
      setTitle('');
      setDate('');
      setNotes('');
      setIsCountdown(false);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not add event');
    } finally {
      setLoading(false);
    }
  };

  const deleteEvent = async (eventId: string) => {
    if (!session?.token) return;
    setMessage('');
    try {
      const response = await fetch(`${API_BASE_URL}/events/${eventId}`, {
        method: 'DELETE',
        headers: authHeaders(session.token),
      });
      if (!response.ok) throw new Error(await getErrorMessage(response));
      setEvents((currentEvents) => currentEvents.filter((event) => event._id !== eventId));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not delete event');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Calendar</Text>
      <Text style={styles.subtitle}>Dates and countdowns</Text>
      <TextInput style={styles.input} placeholder="Event title" value={title} onChangeText={setTitle} />
      <TextInput
        style={styles.input}
        placeholder="Date (YYYY-MM-DD)"
        value={date}
        onChangeText={setDate}
        autoCapitalize="none"
        keyboardType="numbers-and-punctuation"
      />
      <TextInput style={styles.input} placeholder="Notes (optional)" value={notes} onChangeText={setNotes} />
      <View style={styles.toggleRow}>
        <Text style={styles.toggleLabel}>This is a countdown</Text>
        <Switch value={isCountdown} onValueChange={setIsCountdown} trackColor={{ true: '#7651b8' }} />
      </View>
      <GradientButton style={styles.button} onPress={addEvent} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Adding...' : 'Add event'}</Text>
      </GradientButton>
      {!!message && <Text style={styles.error}>{message}</Text>}
      <FlatList
        data={events}
        keyExtractor={(event) => event._id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<EmptyState message="Add a date worth looking forward to." />}
        renderItem={({ item }) => (
          <View style={styles.event}>
            <View style={styles.eventDetails}>
              <Text style={styles.eventTitle}>{item.title}</Text>
              <Text style={styles.eventDate}>{formatDate(item.date)}{item.isCountdown ? '  • Countdown' : ''}</Text>
              {!!item.notes && <Text style={styles.eventNotes}>{item.notes}</Text>}
            </View>
            <Pressable onPress={() => deleteEvent(item._id)} hitSlop={8}>
              <Text style={styles.delete}>Delete</Text>
            </Pressable>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, paddingTop: 72, backgroundColor: '#f4efff' },
  title: { fontSize: 32, fontWeight: '700', color: '#302443', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#766889', marginBottom: 20 },
  input: { backgroundColor: '#fcfaff', borderColor: '#dfd1f1', borderWidth: 1, borderRadius: 18, padding: 14, fontSize: 16, marginBottom: 12, color: '#302443' },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  toggleLabel: { color: '#302443', fontSize: 16 },
  button: { backgroundColor: '#7651b8', borderRadius: 18, padding: 15, alignItems: 'center', shadowColor: '#2e2050', shadowOpacity: 0.14, shadowRadius: 8, elevation: 3 },
  buttonText: { color: '#fcfaff', fontSize: 16, fontWeight: '700' },
  error: { color: '#9b496e', marginTop: 12 },
  list: { paddingTop: 16, paddingBottom: 24 },
  empty: { color: '#766889', paddingTop: 24 },
  event: { backgroundColor: '#fcfaff', borderColor: '#dfd1f1', borderWidth: 1, borderRadius: 18, padding: 16, marginBottom: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, shadowColor: '#2e2050', shadowOpacity: 0.07, shadowRadius: 9, elevation: 2 },
  eventDetails: { flex: 1 },
  eventTitle: { color: '#302443', fontSize: 18, fontWeight: '700' },
  eventDate: { color: '#62409d', marginTop: 5, fontWeight: '600' },
  eventNotes: { color: '#766889', marginTop: 6 },
  delete: { color: '#9b496e', fontWeight: '700' },
});
