import { Platform } from 'react-native';

const configuredUrl = process.env.EXPO_PUBLIC_API_URL?.trim();
if (!configuredUrl && !__DEV__) throw new Error('EXPO_PUBLIC_API_URL is required for production builds');
export const API_BASE_URL = (configuredUrl || (Platform.OS === 'android' ? 'http://10.0.2.2:4000' : 'http://localhost:4000')).replace(/\/+$/, '');
if (!/^https?:\/\//.test(API_BASE_URL) || (!__DEV__ && !API_BASE_URL.startsWith('https://'))) {
  throw new Error('EXPO_PUBLIC_API_URL must use HTTPS in production');
}

export async function getErrorMessage(response: Response): Promise<string> {
  try {
    const text = await response.text();
    try {
      const body = JSON.parse(text);
      if (body.error) return body.error;
      if (body.message) return body.message;
    } catch {
      if (text && text.length < 120 && !text.includes("<html")) {
        return text;
      }
    }
  } catch {}
  return `Request failed (${response.status})`;
}

export function authHeaders(token: string): Record<string, string> {
  return { Authorization: `Bearer ${token}` };
}
