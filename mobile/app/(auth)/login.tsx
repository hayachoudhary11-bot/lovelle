import { Link, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { useAuth } from '@/context/auth';
import { GradientButton } from '@/components/gradient-button';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function LoginScreen() {
  const colors = Colors[useColorScheme() ?? 'light'];
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const nextSession = await signIn(email, password);
      router.replace(nextSession.coupleId ? '/' : '/couple');
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={[colors.gradientStart, colors.gradientEnd]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
        <Text style={styles.heroEyebrow}>LOVELLE</Text>
        <Text style={styles.heroTitle}>Welcome back</Text>
        <Text style={styles.heroSubtitle}>Your shared space is waiting.</Text>
      </LinearGradient>
      <TextInput style={styles.input} placeholder="Email" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
      <TextInput style={styles.input} placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} />
      <GradientButton style={styles.button} onPress={handleLogin} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Signing in...' : 'Sign in'}</Text>
      </GradientButton>
      {!!error && <Text style={styles.error}>{error}</Text>}
      <Link href="/signup" style={styles.link}>Create an account</Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#f4efff' },
  hero: { borderRadius: 28, padding: 24, marginBottom: 24, overflow: 'hidden' },
  heroEyebrow: { color: '#f9d8ea', fontSize: 12, fontWeight: '800', letterSpacing: 2, marginBottom: 12 },
  heroTitle: { color: '#fff8fc', fontSize: 34, lineHeight: 40, fontWeight: '800' },
  heroSubtitle: { color: '#f9d8ea', fontSize: 16, marginTop: 8 },
  title: { fontSize: 34, lineHeight: 40, fontWeight: '700', color: '#302443', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#766889', marginBottom: 24 },
  input: { backgroundColor: '#fcfaff', borderColor: '#dfd1f1', borderWidth: 1, borderRadius: 18, padding: 14, fontSize: 16, marginBottom: 12, color: '#302443', shadowColor: '#2e2050', shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  button: { backgroundColor: '#7651b8', borderRadius: 18, padding: 15, alignItems: 'center', marginTop: 4, shadowColor: '#2e2050', shadowOpacity: 0.14, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 3 },
  buttonText: { color: '#fcfaff', fontSize: 16, fontWeight: '700' },
  error: { color: '#9b496e', marginTop: 16 },
  link: { color: '#62409d', textAlign: 'center', marginTop: 24, fontSize: 16, fontWeight: '600' },
});
