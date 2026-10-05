import { useCallback, useRef, useEffect } from 'react';
import { AppState, AppStateStatus, Platform } from 'react-native';
import { useCartStore, CartItem } from '@/store/cart';
import { useAuthStore } from '@/store/auth';
import { CartApi, PopulatedCartItem } from '@/services/api';

/**
 * Compares two cart item arrays to avoid redundant state updates in React Native.
 */
function areCartItemsEqual(local: CartItem[], server: PopulatedCartItem[]): boolean {
  if (local.length !== server.length) return false;
  const serverMap = new Map(server.map((s) => [s.product.id, s.quantity]));
  for (const item of local) {
    if (serverMap.get(item.productId) !== item.quantity) {
      return false;
    }
  }
  return true;
}

/**
 * Mobile Cart Sync Hook with 2.5s Adaptive Polling
 * - Polls backend every 2.5 seconds while app is in foreground / visible.
 * - Instant refetch on AppState 'active' (foreground) and focus.
 * - Resolves sync conflicts by treating database as single source of truth.
 * - One-time guest-to-user merge upon first authenticated session.
 */
export function useCartSync() {
  const token = useAuthStore((s) => s.token);
  const setServerCart = useCartStore((s) => s.setServerCart);
  const isSyncingRef = useRef(false);
  const hasMergedGuestRef = useRef(false);

  const applyServerCart = useCallback((serverItems: PopulatedCartItem[]) => {
    const mapped: CartItem[] = serverItems.map((row) => ({
      productId: row.product.id,
      slug: row.product.slug,
      name: row.product.name,
      brand: row.product.brand,
      image: row.product.imageUrl,
      priceKobo: row.product.priceKobo,
      quantity: row.quantity,
      stock: row.product.stock,
      updatedAt: row.updatedAt ? new Date(row.updatedAt).toISOString() : new Date().toISOString(),
    }));
    setServerCart(mapped);
  }, [setServerCart]);

  const sync = useCallback(async () => {
    if (!token || isSyncingRef.current) return;

    try {
      isSyncingRef.current = true;
      const res = await CartApi.get();
      if (!res.data?.items) return;

      const serverItems = res.data.items;
      const localItems = useCartStore.getState().items;

      // One-time guest cart merge upon first login if server cart is empty
      if (!hasMergedGuestRef.current && localItems.length > 0 && serverItems.length === 0) {
        hasMergedGuestRef.current = true;
        const syncRes = await CartApi.syncCart(
          localItems.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
            updatedAt: i.updatedAt,
          }))
        );
        if (syncRes.data?.items) {
          applyServerCart(syncRes.data.items);
          return;
        }
      }

      hasMergedGuestRef.current = true;

      // Only update local store if changes occurred (prevents unnecessary re-renders)
      if (!areCartItemsEqual(localItems, serverItems)) {
        applyServerCart(serverItems);
      }
    } catch (err) {
      console.warn('[MobileCartSync] Error syncing cart:', err);
    } finally {
      isSyncingRef.current = false;
    }
  }, [applyServerCart, token]);

  useEffect(() => {
    // Initial sync
    sync();

    // Native AppState foreground listener (instant refetch on return to app)
    const appStateSub = AppState.addEventListener('change', (nextState: AppStateStatus) => {
      if (nextState === 'active') {
        sync();
      }
    });

    // 2.5s Adaptive Polling while app is active
    const intervalId = setInterval(() => {
      if (AppState.currentState === 'active') {
        if (Platform.OS === 'web') {
          if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
            sync();
          }
        } else {
          sync();
        }
      }
    }, 2500);

    // Web browser focus listeners (for localhost:8081 testing)
    let handleFocus: (() => void) | null = null;
    let handleVisibility: (() => void) | null = null;

    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      handleFocus = () => sync();
      handleVisibility = () => {
        if (document.visibilityState === 'visible') {
          sync();
        }
      };
      window.addEventListener('focus', handleFocus);
      document.addEventListener('visibilitychange', handleVisibility);
    }

    return () => {
      appStateSub.remove();
      clearInterval(intervalId);
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        if (handleFocus) window.removeEventListener('focus', handleFocus);
        if (handleVisibility) document.removeEventListener('visibilitychange', handleVisibility);
      }
    };
  }, [sync]);

  return { sync };
}
