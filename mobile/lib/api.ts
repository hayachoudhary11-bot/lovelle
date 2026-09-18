const DEFAULT_LOCAL_HOST = "http://10.0.2.2:4000";
const FALLBACK_LOCAL_HOST = "http://localhost:4000";
const DEVICE_HOST = "http://192.168.1.25:4000";

export const API_BASE_URL = __DEV__ ? DEFAULT_LOCAL_HOST : DEVICE_HOST;

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
