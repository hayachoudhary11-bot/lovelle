import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { decodeToken, useAuth } from '@/context/auth';
import { GradientButton } from '@/components/gradient-button';
import { EmptyState } from '@/components/empty-state';
import { API_BASE_URL, authHeaders, getErrorMessage } from '@/lib/api';

type Message = {
  _id: string;
  coupleId: string;
  senderId: string;
  text: string;
  createdAt: string;
};

function normalizeMessage(message: Partial<Message> | null | undefined): Message | null {
  if (!message || !message._id || !message.senderId || !message.text) return null;
  return {
    _id: String(message._id),
    coupleId: String(message.coupleId ?? ''),
    senderId: String(message.senderId),
    text: String(message.text),
    createdAt: String(message.createdAt ?? new Date().toISOString()),
  };
}

function formatTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

export default function MessagesScreen() {
  const { session } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const listRef = useRef<FlatList<Message>>(null);
  const socketRef = useRef<ReturnType<typeof io> | null>(null);

  let currentUserId: string | null = null;
  if (session?.token) {
    try {
      currentUserId = decodeToken(session.token).userId ?? null;
    } catch {
      currentUserId = null;
    }
  }

  useEffect(() => {
    if (!session?.token) return;

    let mounted = true;

    const loadHistory = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/messages/history`, {
          headers: authHeaders(session.token),
        });
        if (!response.ok) throw new Error(await getErrorMessage(response));
        const history = (await response.json()) as Array<Partial<Message>>;
        if (!mounted) return;
        const parsedMessages = history
          .map(normalizeMessage)
          .filter((message): message is Message => Boolean(message));
        setMessages(parsedMessages);
      } catch (loadError) {
        if (mounted) {
          setError(loadError instanceof Error ? loadError.message : 'Could not load messages');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    const socket = io(API_BASE_URL, {
      auth: { token: session.token },
    });
    socketRef.current = socket;

    const handleConnect = () => {
      socket.emit('join-board');
    };
    const handleIncomingMessage = (message: Partial<Message>) => {
      const normalized = normalizeMessage(message);
      if (!normalized || !mounted) return;
      setMessages((currentMessages) => {
        if (currentMessages.some((existing) => existing._id === normalized._id)) return currentMessages;
        return [...currentMessages, normalized];
      });
    };

    socket.on('connect', handleConnect);
    socket.on('new-message', handleIncomingMessage);
    socket.on('connect_error', (connectError) => {
      if (mounted) setError(`Messages connection failed: ${connectError.message}`);
    });

    loadHistory();

    return () => {
      mounted = false;
      socket.off('connect', handleConnect);
      socket.off('new-message', handleIncomingMessage);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [session?.token]);

  useEffect(() => {
    if (!messages.length) return;
    requestAnimationFrame(() => {
      listRef.current?.scrollToEnd({ animated: true });
    });
  }, [messages.length]);

  const sendMessage = () => {
    const trimmedText = draft.trim();
    if (!trimmedText || !session?.token || !socketRef.current) return;

    setError('');
    socketRef.current.emit(
      'send-message',
      { text: trimmedText },
      (response?: { error?: string; message?: Partial<Message> }) => {
        if (response?.error) {
          setError(response.error);
          return;
        }
        setDraft('');
      },
    );
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={90}>
      <View style={styles.header}>
        <Text style={styles.title}>Messages</Text>
        <Text style={styles.subtitle}>Keep it sweet</Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color="#7651b8" />
        </View>
      ) : (
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.chatList}
          ListEmptyComponent={<EmptyState message="A sweet hello is only a message away." />}
          renderItem={({ item }) => {
            const isMine = item.senderId === currentUserId;
            return (
              <View style={[styles.messageRow, isMine ? styles.messageRowMine : styles.messageRowPartner]}>
                {!isMine && <Text style={styles.senderLabel}>Partner</Text>}
                {isMine && <Text style={styles.senderLabelSelf}>You</Text>}
                <View style={[styles.bubble, isMine ? styles.myBubble : styles.partnerBubble]}>
                  <Text style={[styles.messageText, isMine ? styles.myMessageText : styles.partnerMessageText]}>{item.text}</Text>
                  <Text style={[styles.timeStamp, isMine ? styles.myTimeStamp : styles.partnerTimeStamp]}>{formatTime(item.createdAt)}</Text>
                </View>
              </View>
            );
          }}
        />
      )}

      {!!error && <Text style={styles.error}>{error}</Text>}

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={draft}
          onChangeText={setDraft}
          placeholder="Type a message"
          placeholderTextColor="#84759d"
          multiline
          maxLength={500}
        />
        <GradientButton style={[styles.sendButton, !draft.trim() && styles.sendButtonDisabled]} onPress={sendMessage} disabled={!draft.trim()}>
          <Text style={styles.sendButtonText}>Send</Text>
        </GradientButton>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4efff', paddingHorizontal: 20, paddingTop: 72 },
  header: { marginBottom: 12 },
  title: { fontSize: 32, fontWeight: '700', color: '#302443' },
  subtitle: { fontSize: 16, color: '#766889', marginTop: 4 },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  chatList: { paddingBottom: 10 },
  empty: { textAlign: 'center', color: '#84759d', marginTop: 24 },
  messageRow: { marginBottom: 12 },
  messageRowMine: { alignItems: 'flex-end' },
  messageRowPartner: { alignItems: 'flex-start' },
  senderLabel: { fontSize: 12, color: '#806b9d', marginBottom: 4, marginLeft: 8 },
  senderLabelSelf: { fontSize: 12, color: '#806b9d', marginBottom: 4, marginRight: 8 },
  bubble: { maxWidth: '78%', borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10 },
  myBubble: { backgroundColor: '#7651b8', borderBottomRightRadius: 5, shadowColor: '#2e2050', shadowOpacity: 0.1, shadowRadius: 8, elevation: 2 },
  partnerBubble: { backgroundColor: '#e5d9f4', borderBottomLeftRadius: 5 },
  messageText: { fontSize: 16, lineHeight: 22 },
  myMessageText: { color: '#f4efff' },
  partnerMessageText: { color: '#302443' },
  timeStamp: { fontSize: 11, marginTop: 4 },
  myTimeStamp: { color: 'rgba(255,250,243,0.8)', textAlign: 'right' },
  partnerTimeStamp: { color: '#806b9d', textAlign: 'left' },
  error: { color: '#9b496e', marginBottom: 8 },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 10, borderTopWidth: 1, borderTopColor: '#d7c8ea', paddingTop: 12, paddingBottom: 18 },
  input: { flex: 1, maxHeight: 120, minHeight: 48, borderWidth: 1, borderColor: '#dfd1f1', borderRadius: 18, paddingHorizontal: 14, paddingVertical: 12, backgroundColor: '#fcfaff', color: '#302443' },
  sendButton: { backgroundColor: '#7651b8', borderRadius: 18, paddingHorizontal: 18, paddingVertical: 12, shadowColor: '#2e2050', shadowOpacity: 0.12, shadowRadius: 8, elevation: 2 },
  sendButtonDisabled: { opacity: 0.45 },
  sendButtonText: { color: '#f4efff', fontWeight: '700' },
});
