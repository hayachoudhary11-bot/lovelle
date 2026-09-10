import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, PropsWithChildren, useContext, useEffect, useState } from 'react';

import { API_BASE_URL, getErrorMessage } from '@/lib/api';

const SESSION_KEY = 'lovelle_session';

type Session = {
  token: string;
  coupleId: string | null;
};

type AuthContextValue = {
  session: Session | null;
  restoring: boolean;
  signIn: (email: string, password: string) => Promise<Session>;
  signUp: (email: string, password: string, name: string) => Promise<Session>;
  createCouple: (coupleName: string) => Promise<{ session: Session; inviteCode: string }>;
  joinCouple: (inviteCode: string) => Promise<Session>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function decodeToken(token: string): { exp?: number; coupleId?: string | null; userId?: string } {
  const payload = token.split('.')[1];
  if (!payload || typeof globalThis.atob !== 'function') throw new Error('Invalid token');

  const base64Payload = payload.replace(/-/g, '+').replace(/_/g, '/');
  const paddedPayload = base64Payload.padEnd(Math.ceil(base64Payload.length / 4) * 4, '=');
  const decoded = globalThis.atob(paddedPayload);
  const parsed = JSON.parse(decoded) as unknown;
  if (!parsed || typeof parsed !== 'object') throw new Error('Invalid token');
  return parsed as { exp?: number; coupleId?: string | null; userId?: string };
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [restoring, setRestoring] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(SESSION_KEY)
      .then((storedSession) => {
        if (!storedSession) return;
        const parsedSession = JSON.parse(storedSession) as Session;
        const payload = decodeToken(parsedSession.token);
        if (payload.exp && payload.exp * 1000 <= Date.now()) return;
        setSession(parsedSession);
      })
      .catch(() => AsyncStorage.removeItem(SESSION_KEY))
      .finally(() => setRestoring(false));
  }, []);

  const saveSession = async (token: string): Promise<Session> => {
    const payload = decodeToken(token);
    const nextSession = { token, coupleId: payload.coupleId ?? null };
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(nextSession));
    setSession(nextSession);
    return nextSession;
  };

  const signIn = async (email: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim(), password }),
    });
    if (!response.ok) throw new Error(await getErrorMessage(response));
    const result = await response.json();
    return saveSession(result.token);
  };

  const signUp = async (email: string, password: string, name: string) => {
    const signupBody = JSON.stringify({ email: email.trim(), password, name: name.trim() });
    console.log('[signup] request body:', signupBody);
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: signupBody,
    });
    if (!response.ok) throw new Error(await getErrorMessage(response));
    const result = await response.json();
    return saveSession(result.token);
  };

  const createCouple = async (coupleName: string) => {
    if (!session) throw new Error('You must be logged in first');
    const response = await fetch(`${API_BASE_URL}/auth/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.token}` },
      body: JSON.stringify({ coupleName: coupleName.trim() || undefined }),
    });
    if (!response.ok) throw new Error(await getErrorMessage(response));
    const result = await response.json();
    const nextSession = await saveSession(result.token);
    return { session: nextSession, inviteCode: result.couple.inviteCode as string };
  };

  const joinCouple = async (inviteCode: string) => {
    if (!session) throw new Error('You must be logged in first');
    const response = await fetch(`${API_BASE_URL}/auth/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.token}` },
      body: JSON.stringify({ inviteCode: inviteCode.trim().toUpperCase() }),
    });
    if (!response.ok) throw new Error(await getErrorMessage(response));
    const result = await response.json();
    return saveSession(result.token);
  };

  const signOut = async () => {
    await AsyncStorage.removeItem(SESSION_KEY);
    setSession(null);
  };

  return (
    <AuthContext.Provider value={{ session, restoring, signIn, signUp, createCouple, joinCouple, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
