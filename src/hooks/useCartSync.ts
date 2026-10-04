import { useCallback, useRef } from 'react';
import { useCartStore, CartItem } from '@/store/cart';
import { useAuthStore } from '@/store/auth';
import { CartApi, PopulatedCartItem } from '@/services/api';

/**
 * Mobile Last-Write-Wins Cart Sync Hook
 * Synchronizes local AsyncStorage cart with the Vercel backend.
 */
export function useCartSync() {
  const token = useAuthStore((s) => s.token);
  const setServerCart = useCartStore((s) => s.setServerCart);
  const isSyncingRef = useRef(false);

  const sync = useCallback(async () => {
    if (!token || isSyncingRef.current) return;

    try {
      isSyncingRef.current = true;
      const currentLocalItems = useCartStore.getState().items;

      if (currentLocalItems.length > 0) {
        // Sync local items with updatedAt timestamps
        const res = await CartApi.syncCart(
          currentLocalItems.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
            updatedAt: i.updatedAt,
          }))
        );

        if (res.data?.items) {
          applyServerCart(res.data.items);
        }
      } else {
        // Fetch server cart and hydrate
        const res = await CartApi.get();
        if (res.data?.items) {
          applyServerCart(res.data.items);
        }
      }
    } catch (err) {
      console.warn('[MobileCartSync] Error syncing cart:', err);
    } finally {
      isSyncingRef.current = false;
    }
  }, [token]);

  function applyServerCart(serverItems: PopulatedCartItem[]) {
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
  }

  return { sync };
}
