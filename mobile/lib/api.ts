export const API_BASE_URL = "http://192.168.1.6:4000";

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
