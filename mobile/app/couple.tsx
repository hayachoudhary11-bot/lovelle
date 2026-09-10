import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { useAuth } from '@/context/auth';
import { GradientButton } from '@/components/gradient-button';

export default function CoupleScreen() {
  const { createCouple, joinCouple } = useAuth();
  const [coupleName, setCoupleName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [createdInviteCode, setCreatedInviteCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await createCouple(coupleName);
      setCreatedInviteCode(result.inviteCode);
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : 'Could not create couple');
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    setLoading(true);
    setError('');
    try {
      await joinCouple(inviteCode);
      router.replace('/');
    } catch (joinError) {
      setError(joinError instanceof Error ? joinError.message : 'Could not join couple');
    } finally {
      setLoading(false);
    }
  };

  if (createdInviteCode) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Your couple is ready</Text>
        <Text style={styles.subtitle}>Share this invite code with your partner:</Text>
        <Text style={styles.inviteCode}>{createdInviteCode}</Text>
        <GradientButton style={styles.button} onPress={() => router.replace('/')}>
          <Text style={styles.buttonText}>Continue to Notes</Text>
        </GradientButton>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create or join</Text>
      <Text style={styles.subtitle}>Connect your account to a shared couple space.</Text>
      <Text style={styles.sectionTitle}>Create a couple</Text>
      <TextInput style={styles.input} placeholder="Couple name (optional)" value={coupleName} onChangeText={setCoupleName} />
      <GradientButton style={styles.button} onPress={handleCreate} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Creating...' : 'Create couple'}</Text>
      </GradientButton>
      <Text style={styles.or}>or</Text>
      <Text style={styles.sectionTitle}>Join a couple</Text>
      <TextInput style={styles.input} placeholder="Partner invite code" autoCapitalize="characters" value={inviteCode} onChangeText={setInviteCode} />
      <Pressable style={styles.secondaryButton} onPress={handleJoin} disabled={loading}>
        <Text style={styles.secondaryButtonText}>{loading ? 'Joining...' : 'Join couple'}</Text>
      </Pressable>
      {!!error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#f4efff' },
  title: { fontSize: 32, fontWeight: '700', color: '#302443', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#766889', marginBottom: 24 },
  sectionTitle: { color: '#302443', fontSize: 18, fontWeight: '700', marginBottom: 10 },
  input: { backgroundColor: '#fcfaff', borderColor: '#dfd1f1', borderWidth: 1, borderRadius: 18, padding: 14, fontSize: 16, marginBottom: 12, color: '#302443' },
  button: { backgroundColor: '#7651b8', borderRadius: 18, padding: 15, alignItems: 'center', shadowColor: '#2e2050', shadowOpacity: 0.14, shadowRadius: 8, elevation: 3 },
  buttonText: { color: '#fcfaff', fontSize: 16, fontWeight: '700' },
  secondaryButton: { borderColor: '#7651b8', borderWidth: 1, borderRadius: 18, padding: 14, alignItems: 'center' },
  secondaryButtonText: { color: '#62409d', fontSize: 16, fontWeight: '700' },
  or: { color: '#766889', textAlign: 'center', marginVertical: 20 },
  error: { color: '#9b496e', marginTop: 16 },
  inviteCode: { color: '#302443', fontSize: 36, fontWeight: '800', letterSpacing: 4, textAlign: 'center', marginVertical: 28 },
});
