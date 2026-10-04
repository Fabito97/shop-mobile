import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Watch, ShoppingBag } from 'lucide-react-native';
import { BRAND } from '@/config/brand';
import { useCartStore, selectCartCount } from '@/store/cart';

interface HeaderProps {
  showBack?: boolean;
  title?: string;
}

export function Header({ showBack = false, title }: HeaderProps) {
  const router = useRouter();
  const count = useCartStore(selectCartCount);

  return (
    <View className="bg-ink px-4 pt-3 pb-3 border-b border-gold/20 flex-row items-center justify-between">
      <TouchableOpacity
        onPress={() => router.push('/(tabs)' as any)}
        className="flex-row items-center gap-2"
        activeOpacity={0.7}
      >
        <Watch size={20} color="#C5A880" />
        <View>
          <Text className="text-ivory font-serif text-lg tracking-wider font-light">
            {BRAND.name}
          </Text>
          <Text className="text-gold text-[9px] uppercase tracking-widest -mt-0.5">
            Main Market, Onitsha
          </Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => router.push('/(tabs)/cart' as any)}
        className="relative p-2 rounded-full bg-charcoal border border-gold/20"
        activeOpacity={0.7}
      >
        <ShoppingBag size={18} color="#C5A880" />
        {count > 0 && (
          <View className="absolute -top-1 -right-1 bg-gold px-1.5 py-0.5 rounded-full min-w-[18px] items-center justify-center">
            <Text className="text-ink text-[10px] font-bold">{count}</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}
