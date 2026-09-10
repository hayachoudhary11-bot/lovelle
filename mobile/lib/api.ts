export const API_BASE_URL = "http://192.168.1.7:4000";

export async function getErrorMessage(response: Response): Promise<string> {
  const body = await response.json().catch(() => ({}));
  return body.error || `Request failed (${response.status})`;
}

export function authHeaders(token: string): Record<string, string> {
  return { Authorization: `Bearer ${token}` };
}
