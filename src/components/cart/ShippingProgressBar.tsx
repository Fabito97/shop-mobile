import React from 'react';
import { View, Text } from 'react-native';
import { Truck } from 'lucide-react-native';
import { SHOP } from '@/config/shop';
import { formatNaira, getFreeShippingProgress } from '@/utils/money';

interface ShippingProgressBarProps {
  subtotalKobo: number;
}

export function ShippingProgressBar({ subtotalKobo }: ShippingProgressBarProps) {
  const { progressPercent, remainingKobo, isEligible } = getFreeShippingProgress(
    subtotalKobo,
    SHOP.freeShippingThresholdKobo
  );

  return (
    <View className="bg-charcoal p-3.5 rounded-lg border border-gold/15 mb-3">
      <View className="flex-row items-center gap-2 mb-2">
        <Truck size={16} color="#C5A880" />
        <Text className="text-xs text-ivory">
          {isEligible ? (
            <Text className="text-gold font-medium">
              You qualify for free nationwide delivery!
            </Text>
          ) : (
            <>
              Add{' '}
              <Text className="text-gold font-medium">
                {formatNaira(remainingKobo)}
              </Text>{' '}
              more to qualify for free delivery
            </>
          )}
        </Text>
      </View>

      <View className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
        <View
          className="bg-gold h-full rounded-full"
          style={{ width: `${progressPercent}%` }}
        />
      </View>
    </View>
  );
}
