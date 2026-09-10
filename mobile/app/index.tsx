import { Redirect } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { useAuth } from '@/context/auth';

export default function EntryScreen() {
  const { session, restoring } = useAuth();

  if (restoring) {
    return (
      <View style={styles.container}>
        <ActivityIndicator color="#7651b8" />
      </View>
    );
  }

  if (!session) return <Redirect href="/login" />;
  if (!session.coupleId) return <Redirect href="/couple" />;
  return <Redirect href="/(tabs)" />;
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f4efff' },
});
