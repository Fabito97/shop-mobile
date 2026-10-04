import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Minus, Plus, Trash2 } from 'lucide-react-native';
import { CartItem } from '@/store/cart';
import { formatNaira } from '@/utils/money';

interface CartItemRowProps {
  item: CartItem;
  onIncrement: () => void;
  onDecrement: () => void;
  onRemove: () => void;
}

export function CartItemRow({
  item,
  onIncrement,
  onDecrement,
  onRemove,
}: CartItemRowProps) {
  const isMaxStock = item.quantity >= item.stock;

  return (
    <View className="bg-charcoal p-3.5 rounded-lg border border-gold/15 mb-2.5 flex-row items-center gap-3">
      <View className="w-16 h-16 rounded bg-ink overflow-hidden border border-gold/20 items-center justify-center">
        <Image
          source={{ uri: item.image }}
          className="w-full h-full"
          resizeMode="cover"
        />
      </View>

      <View className="flex-1">
        <Text className="text-[10px] uppercase tracking-wider text-muted font-medium">
          {item.brand}
        </Text>
        <Text
          numberOfLines={1}
          className="text-ivory font-serif text-sm font-normal mt-0.5"
        >
          {item.name}
        </Text>
        <Text className="text-gold font-medium text-xs mt-1">
          {formatNaira(item.priceKobo)}
        </Text>
      </View>

      <View className="items-end gap-2">
        <TouchableOpacity
          onPress={onRemove}
          className="p-1"
          activeOpacity={0.7}
        >
          <Trash2 size={15} color="#71717A" />
        </TouchableOpacity>

        <View className="flex-row items-center bg-ink rounded border border-gold/30">
          <TouchableOpacity
            onPress={onDecrement}
            className="p-1 px-2"
            activeOpacity={0.7}
          >
            <Minus size={13} color="#C5A880" />
          </TouchableOpacity>

          <Text className="text-ivory font-bold text-xs px-1 min-w-[20px] text-center">
            {item.quantity}
          </Text>

          <TouchableOpacity
            onPress={onIncrement}
            disabled={isMaxStock}
            className={`p-1 px-2 ${isMaxStock ? 'opacity-30' : 'opacity-100'}`}
            activeOpacity={0.7}
          >
            <Plus size={13} color="#C5A880" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
