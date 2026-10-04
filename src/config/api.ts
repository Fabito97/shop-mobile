import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from '@/store/auth';

export const API_BASE_URL = (
  process.env.EXPO_PUBLIC_API_URL || 'https://small-business-shop-98wb.vercel.app'
).replace(/\/$/, '');

const TOKEN_KEY = 'dave_store_jwt';

export async function getAuthToken(): Promise<string | null> {
  try {
    const memoryToken = useAuthStore.getState().token;
    if (memoryToken) return memoryToken;

    if (Platform.OS === 'web') {
      return await AsyncStorage.getItem(TOKEN_KEY);
    }
    return await SecureStore.getItemAsync(TOKEN_KEY);
  } catch {
    return null;
  }
}

export async function setAuthToken(token: string): Promise<void> {
  try {
    if (Platform.OS === 'web') {
      await AsyncStorage.setItem(TOKEN_KEY, token);
      return;
    }
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  } catch (err) {
    console.warn('[Storage] Failed to save token:', err);
  }
}

export async function clearAuthToken(): Promise<void> {
  try {
    if (Platform.OS === 'web') {
      await AsyncStorage.removeItem(TOKEN_KEY);
      return;
    }
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  } catch (err) {
    console.warn('[Storage] Failed to delete token:', err);
  }
}

/**
 * Standard fetch wrapper that automatically attaches the Bearer token if present
 * and parses JSON response.
 */
export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ data: T | null; error: string | null; status: number }> {
  try {
    const token = await getAuthToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const cleanPath = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = `${API_BASE_URL}${cleanPath}`;

    const res = await fetch(url, {
      ...options,
      headers,
    });

    const status = res.status;

    if (status === 204) {
      return { data: null, error: null, status };
    }

    const json = await res.json().catch(() => null);

    if (!res.ok) {
      const errMsg =
        json?.error?.message ||
        json?.message ||
        `Request failed with status ${status}`;
      return { data: null, error: errMsg, status };
    }

    return { data: json as T, error: null, status };
  } catch (err: any) {
    return {
      data: null,
      error: err?.message || 'Network request failed. Check your internet connection.',
      status: 0,
    };
  }
}
