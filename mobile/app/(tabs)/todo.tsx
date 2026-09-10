import { useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { useAuth } from '@/context/auth';
import { GradientButton } from '@/components/gradient-button';
import { EmptyState } from '@/components/empty-state';
import { API_BASE_URL, authHeaders, getErrorMessage } from '@/lib/api';

type Task = {
  _id: string;
  text: string;
  done: boolean;
  createdAt?: string;
};

export default function TodoScreen() {
  const { session } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const loadTasks = async (token: string) => {
    const response = await fetch(`${API_BASE_URL}/tasks`, {
      headers: authHeaders(token),
    });
    if (!response.ok) throw new Error(await getErrorMessage(response));
    setTasks(await response.json());
  };

  useEffect(() => {
    if (!session?.token) return;
    loadTasks(session.token).catch((error: Error) => setMessage(error.message));
  }, [session?.token]);

  const addTask = async () => {
    if (!session?.token || !newTask.trim()) return;
    setLoading(true);
    setMessage('');
    try {
      const response = await fetch(`${API_BASE_URL}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders(session.token),
        },
        body: JSON.stringify({ text: newTask.trim() }),
      });
      if (!response.ok) throw new Error(await getErrorMessage(response));
      const createdTask: Task = await response.json();
      setTasks((currentTasks) => [createdTask, ...currentTasks]);
      setNewTask('');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not add task');
    } finally {
      setLoading(false);
    }
  };

  const toggleTask = async (task: Task) => {
    if (!session?.token) return;
    setMessage('');
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${task._id}`, {
        method: 'PATCH',
        headers: authHeaders(session.token),
      });
      if (!response.ok) throw new Error(await getErrorMessage(response));
      const updatedTask: Task = await response.json();
      setTasks((currentTasks) =>
        currentTasks.map((currentTask) =>
          currentTask._id === updatedTask._id ? updatedTask : currentTask,
        ),
      );
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not update task');
    }
  };

  const deleteTask = async (taskId: string) => {
    if (!session?.token) return;
    setMessage('');
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
        method: 'DELETE',
        headers: authHeaders(session.token),
      });
      if (!response.ok) throw new Error(await getErrorMessage(response));
      setTasks((currentTasks) => currentTasks.filter((task) => task._id !== taskId));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not delete task');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>To-Do List</Text>
      <Text style={styles.subtitle}>Shared tasks and groceries</Text>
      <View style={styles.addRow}>
        <TextInput
          style={[styles.input, styles.taskInput]}
          placeholder="Add a task..."
          value={newTask}
          onChangeText={setNewTask}
          onSubmitEditing={addTask}
          returnKeyType="done"
        />
        <GradientButton style={styles.button} onPress={addTask} disabled={loading}>
          <Text style={styles.buttonText}>Add</Text>
        </GradientButton>
      </View>
      {!!message && <Text style={styles.error}>{message}</Text>}
      <FlatList
        data={tasks}
        keyExtractor={(task) => task._id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<EmptyState message="A few shared plans make the day feel lighter." />}
        renderItem={({ item }) => (
          <View style={styles.task}>
            <Pressable style={styles.taskAction} onPress={() => toggleTask(item)}>
              <View style={[styles.checkbox, item.done && styles.checkboxDone]}>
                {item.done && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={[styles.taskText, item.done && styles.taskTextDone]}>{item.text}</Text>
            </Pressable>
            <Pressable onPress={() => deleteTask(item._id)} hitSlop={8}>
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
  subtitle: { fontSize: 16, color: '#766889', marginBottom: 24 },
  addRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  input: { backgroundColor: '#fcfaff', borderColor: '#dfd1f1', borderWidth: 1, borderRadius: 18, padding: 14, fontSize: 16, marginBottom: 12, color: '#302443' },
  taskInput: { flex: 1 },
  button: { backgroundColor: '#7651b8', borderRadius: 18, padding: 15, alignItems: 'center', shadowColor: '#2e2050', shadowOpacity: 0.14, shadowRadius: 8, elevation: 3 },
  buttonText: { color: '#fcfaff', fontSize: 16, fontWeight: '700' },
  error: { color: '#9b496e', marginTop: 4 },
  list: { paddingTop: 12, paddingBottom: 24 },
  empty: { color: '#766889', paddingTop: 24 },
  task: { backgroundColor: '#fcfaff', borderColor: '#dfd1f1', borderWidth: 1, borderRadius: 18, padding: 14, marginBottom: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, shadowColor: '#2e2050', shadowOpacity: 0.07, shadowRadius: 9, elevation: 2 },
  taskAction: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  checkbox: { width: 24, height: 24, borderColor: '#7651b8', borderWidth: 2, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  checkboxDone: { backgroundColor: '#7651b8' },
  checkmark: { color: '#fcfaff', fontWeight: '700' },
  taskText: { flex: 1, color: '#302443', fontSize: 17, lineHeight: 23, fontWeight: '700' },
  taskTextDone: { color: '#a88982', textDecorationLine: 'line-through' },
  delete: { color: '#9b496e', fontWeight: '700' },
});
