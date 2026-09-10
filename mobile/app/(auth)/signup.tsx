import { Link, router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { useAuth } from '@/context/auth';
import { GradientButton } from '@/components/gradient-button';

export default function SignupScreen() {
  const { signUp } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    setLoading(true);
    setError('');
    try {
      await signUp(email, password, name);
      router.replace('/couple');
    } catch (signupError) {
      setError(signupError instanceof Error ? signupError.message : 'Could not create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create your account</Text>
      <Text style={styles.subtitle}>Start a private shared space with someone you love.</Text>
      <TextInput style={styles.input} placeholder="Your name" value={name} onChangeText={setName} />
      <TextInput style={styles.input} placeholder="Email" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
      <TextInput style={styles.input} placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} />
      <GradientButton style={styles.button} onPress={handleSignup} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Creating account...' : 'Sign up'}</Text>
      </GradientButton>
      {!!error && <Text style={styles.error}>{error}</Text>}
      <Link href="/login" style={styles.link}>Already have an account? Sign in</Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#f4efff' },
  title: { fontSize: 34, lineHeight: 40, fontWeight: '700', color: '#302443', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#766889', marginBottom: 24 },
  input: { backgroundColor: '#fcfaff', borderColor: '#dfd1f1', borderWidth: 1, borderRadius: 18, padding: 14, fontSize: 16, marginBottom: 12, color: '#302443', shadowColor: '#2e2050', shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  button: { backgroundColor: '#7651b8', borderRadius: 18, padding: 15, alignItems: 'center', marginTop: 4, shadowColor: '#2e2050', shadowOpacity: 0.14, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 3 },
  buttonText: { color: '#fcfaff', fontSize: 16, fontWeight: '700' },
  error: { color: '#9b496e', marginTop: 16 },
  link: { color: '#62409d', textAlign: 'center', marginTop: 24, fontSize: 16, fontWeight: '600' },
});
