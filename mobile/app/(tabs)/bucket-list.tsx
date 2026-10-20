import { useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { useAuth } from '@/context/auth';
import { GradientButton } from '@/components/gradient-button';
import { EmptyState } from '@/components/empty-state';
import { API_BASE_URL, authHeaders, getErrorMessage } from '@/lib/api';

type BucketListItem = {
  _id: string;
  text: string;
  done: boolean;
  createdAt?: string;
};

export default function BucketListScreen() {
  const { session } = useAuth();
  const [items, setItems] = useState<BucketListItem[]>([]);
  const [newItem, setNewItem] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const loadItems = async (token: string) => {
    const response = await fetch(`${API_BASE_URL}/bucket-list`, {
      headers: authHeaders(token),
    });
    if (!response.ok) throw new Error(await getErrorMessage(response));
    setItems(await response.json());
  };

  useEffect(() => {
    if (!session?.token) return;
    loadItems(session.token).catch((error: Error) => setMessage(error.message));
  }, [session?.token]);

  const addItem = async () => {
    if (!session?.token || !newItem.trim()) return;
    setLoading(true);
    setMessage('');
    try {
      const response = await fetch(`${API_BASE_URL}/bucket-list`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders(session.token),
        },
        body: JSON.stringify({ text: newItem.trim() }),
      });
      if (!response.ok) throw new Error(await getErrorMessage(response));
      const createdItem: BucketListItem = await response.json();
      setItems((currentItems) => [createdItem, ...currentItems]);
      setNewItem('');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not add bucket list item');
    } finally {
      setLoading(false);
    }
  };

  const toggleItem = async (item: BucketListItem) => {
    if (!session?.token) return;
    setMessage('');
    try {
      const response = await fetch(`${API_BASE_URL}/bucket-list/${item._id}`, {
        method: 'PATCH',
        headers: authHeaders(session.token),
      });
      if (!response.ok) throw new Error(await getErrorMessage(response));
      const updatedItem: BucketListItem = await response.json();
      setItems((currentItems) =>
        currentItems.map((currentItem) =>
          currentItem._id === updatedItem._id ? updatedItem : currentItem,
        ),
      );
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not update bucket list item');
    }
  };

  const deleteItem = async (itemId: string) => {
    if (!session?.token) return;
    setMessage('');
    try {
      const response = await fetch(`${API_BASE_URL}/bucket-list/${itemId}`, {
        method: 'DELETE',
        headers: authHeaders(session.token),
      });
      if (!response.ok) throw new Error(await getErrorMessage(response));
      setItems((currentItems) => currentItems.filter((item) => item._id !== itemId));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not delete bucket list item');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bucket List</Text>
      <Text style={styles.subtitle}>Dream big, together.</Text>
      <View style={styles.addRow}>
        <TextInput
          style={[styles.input, styles.itemInput]}
          placeholder="Add a dream..."
          value={newItem}
          onChangeText={setNewItem}
          onSubmitEditing={addItem}
          returnKeyType="done"
        />
        <GradientButton style={styles.button} onPress={addItem} disabled={loading}>
          <Text style={styles.buttonText}>Add</Text>
        </GradientButton>
      </View>
      {!!message && <Text style={styles.error}>{message}</Text>}
      <FlatList
        data={items}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<EmptyState message="A few shared dreams make the future feel brighter." />}
        renderItem={({ item }) => (
          <View style={styles.itemRow}>
            <Pressable style={styles.itemAction} onPress={() => toggleItem(item)}>
              <View style={[styles.checkbox, item.done && styles.checkboxDone]}>
                {item.done && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={[styles.itemText, item.done && styles.itemTextDone]}>{item.text}</Text>
            </Pressable>
            <Pressable onPress={() => deleteItem(item._id)} hitSlop={8}>
              <Text style={styles.delete}>Delete</Text>
            </Pressable>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, paddingTop: 72, backgroundColor: '#eef7ff' },
  title: { fontSize: 32, fontWeight: '700', color: '#1f3b52', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#4d6783', marginBottom: 24 },
  addRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  input: { backgroundColor: '#fcfaff', borderColor: '#dfeaf7', borderWidth: 1, borderRadius: 18, padding: 14, fontSize: 16, marginBottom: 12, color: '#1f3b52' },
  itemInput: { flex: 1 },
  button: { backgroundColor: '#4c8ed9', borderRadius: 18, padding: 15, alignItems: 'center', shadowColor: '#2d4d70', shadowOpacity: 0.14, shadowRadius: 8, elevation: 3 },
  buttonText: { color: '#fcfaff', fontSize: 16, fontWeight: '700' },
  error: { color: '#9b496e', marginTop: 4 },
  list: { paddingTop: 12, paddingBottom: 24 },
  itemRow: { backgroundColor: '#fcfaff', borderColor: '#dfeaf7', borderWidth: 1, borderRadius: 18, padding: 14, marginBottom: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, shadowColor: '#2d4d70', shadowOpacity: 0.07, shadowRadius: 9, elevation: 2 },
  itemAction: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  checkbox: { width: 24, height: 24, borderColor: '#4c8ed9', borderWidth: 2, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  checkboxDone: { backgroundColor: '#4c8ed9' },
  checkmark: { color: '#fcfaff', fontWeight: '700' },
  itemText: { flex: 1, color: '#1f3b52', fontSize: 17, lineHeight: 23, fontWeight: '700' },
  itemTextDone: { color: '#7a8fa8', textDecorationLine: 'line-through' },
  delete: { color: '#9b496e', fontWeight: '700' },
});
