import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { ShoppingBag, ArrowRight } from 'lucide-react-native';
import { Header } from '@/components/common/Header';
import { CartItemRow } from '@/components/cart/CartItemRow';
import { ShippingProgressBar } from '@/components/cart/ShippingProgressBar';
import { LuxuryButton } from '@/components/common/LuxuryButton';
import {
  useCartStore,
  selectCartSubtotal,
  selectCartShippingFee,
  selectCartTotal,
} from '@/store/cart';
import { formatNaira } from '@/utils/money';
import { useCartSync } from '@/hooks/useCartSync';

export default function CartScreen() {
  const router = useRouter();
  const { sync } = useCartSync();

  const items = useCartStore((s) => s.items);
  const setQty = useCartStore((s) => s.setQty);
  const remove = useCartStore((s) => s.remove);
  const clear = useCartStore((s) => s.clear);

  const subtotal = useCartStore(selectCartSubtotal);
  const shippingFee = useCartStore(selectCartShippingFee);
  const total = useCartStore(selectCartTotal);

  // Background sync with database whenever Cart screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      sync();
    }, [sync])
  );

  return (
    <View className="flex-1 bg-ink">
      <Header />

      {items.length === 0 ? (
        <View className="flex-1 items-center justify-center p-6">
          <View className="p-5 rounded-full bg-charcoal border border-gold/25 mb-4">
            <ShoppingBag size={36} color="#C5A880" />
          </View>
          <Text className="text-ivory font-serif text-2xl font-light text-center">
            Your Cart is Empty
          </Text>
          <Text className="text-muted text-xs text-center mt-2 max-w-xs leading-relaxed">
            You haven't selected any timepieces yet. Discover our curated collection from Main Market, Onitsha.
          </Text>
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/shop' as any)}
            className="mt-6 bg-gold py-3 px-6 rounded-md flex-row items-center gap-2"
            activeOpacity={0.8}
          >
            <Text className="text-ink text-xs uppercase tracking-widest font-bold">
              Explore Collection
            </Text>
            <ArrowRight size={14} color="#0B0D0E" />
          </TouchableOpacity>
        </View>
      ) : (
        <View className="flex-1">
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
          >
            {/* Free Shipping Progress Indicator */}
            <ShippingProgressBar subtotalKobo={subtotal} />

            {/* Cart Items List */}
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-ivory font-serif text-lg font-light">
                Selected Timepieces ({items.length})
              </Text>
              <TouchableOpacity onPress={clear}>
                <Text className="text-muted text-xs uppercase tracking-wider">
                  Clear All
                </Text>
              </TouchableOpacity>
            </View>

            {items.map((item) => (
              <CartItemRow
                key={item.productId}
                item={item}
                onIncrement={() => setQty(item.productId, item.quantity + 1)}
                onDecrement={() => setQty(item.productId, item.quantity - 1)}
                onRemove={() => remove(item.productId)}
              />
            ))}

            {/* Summary Breakdown */}
            <View className="mt-4 bg-charcoal p-4 rounded-xl border border-gold/20 gap-2.5">
              <Text className="text-gold text-[10px] uppercase tracking-[0.2em] font-semibold mb-1">
                Order Summary
              </Text>

              <View className="flex-row items-center justify-between">
                <Text className="text-muted text-xs">Subtotal</Text>
                <Text className="text-ivory text-xs font-medium">
                  {formatNaira(subtotal)}
                </Text>
              </View>

              <View className="flex-row items-center justify-between">
                <Text className="text-muted text-xs">Nationwide Delivery</Text>
                <Text className="text-ivory text-xs font-medium">
                  {shippingFee === 0 ? (
                    <Text className="text-gold">FREE</Text>
                  ) : (
                    formatNaira(shippingFee)
                  )}
                </Text>
              </View>

              <View className="h-[1px] bg-gold/15 my-1" />

              <View className="flex-row items-center justify-between">
                <Text className="text-ivory font-serif text-base font-normal">
                  Total
                </Text>
                <Text className="text-gold font-bold text-base">
                  {formatNaira(total)}
                </Text>
              </View>
            </View>
          </ScrollView>

          {/* Sticky Checkout Bar */}
          <View className="absolute bottom-0 left-0 right-0 p-4 bg-ink/95 border-t border-gold/20">
            <LuxuryButton
              title="Proceed to Checkout"
              onPress={() => router.push('/checkout' as any)}
            />
          </View>
        </View>
      )}
    </View>
  );
}
