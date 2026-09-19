import Constants from "expo-constants";
import { Platform } from "react-native";

const DEFAULT_LOCAL_HOST = "http://10.0.2.2:4000";
const FALLBACK_LOCAL_HOST = "http://localhost:4000";
const PRODUCTION_API_URL = "http://192.168.1.25:4000";

function getDevApiBaseUrl(): string {
  if (Platform.OS === "web") {
    const webHostname =
      typeof window !== "undefined" ? window.location.hostname : "localhost";
    return `http://${webHostname}:4000`;
  }

  const hostUri =
    Constants.expoConfig?.hostUri ??
    (Constants as any).expoGoConfig?.hostUri ??
    (Constants as any).manifest?.debuggerHost ??
    (Constants as any).manifest2?.extra?.expoGo?.debuggerHost;

  if (typeof hostUri === "string" && hostUri.length > 0) {
    const detectedIp = hostUri.split(":")[0].replace(/\[|\]/g, "");
    if (detectedIp && detectedIp !== "localhost") {
      return `http://${detectedIp}:4000`;
    }
  }

  return DEFAULT_LOCAL_HOST;
}

export const API_BASE_URL = __DEV__ ? getDevApiBaseUrl() : PRODUCTION_API_URL;
console.log("[API] resolved API_BASE_URL:", API_BASE_URL);

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
