import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Linking,
  Share,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { CheckCircle2, MessageCircle, Copy, ArrowRight, Building2 } from 'lucide-react-native';
import { BRAND } from '@/config/brand';
import { SHOP } from '@/config/shop';
import { formatNaira } from '@/utils/money';
import { LuxuryButton } from '@/components/common/LuxuryButton';

export default function OrderConfirmationScreen() {
  const { orderNumber, totalKobo, paymentMethod } = useLocalSearchParams<{
    orderNumber: string;
    totalKobo: string;
    paymentMethod: string;
  }>();

  const router = useRouter();
  const numericTotal = Number(totalKobo) || 0;
  const isBankTransfer = paymentMethod === 'bank_transfer';

  const handleWhatsApp = () => {
    const message = `Hello Dave Store! I just placed order #${orderNumber} for ${formatNaira(
      numericTotal
    )}. Here is my payment confirmation.`;
    const url = `https://wa.me/${BRAND.whatsapp.number.replace(/\D/g, '')}?text=${encodeURIComponent(
      message
    )}`;
    Linking.openURL(url).catch(() => {});
  };

  const handleShare = () => {
    Share.share({
      message: `My Dave Store Order #${orderNumber} for ${formatNaira(numericTotal)} has been received!`,
    }).catch(() => {});
  };

  return (
    <View className="flex-1 bg-ink">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20, paddingTop: 40, paddingBottom: 40 }}
      >
        <View className="items-center mb-6">
          <View className="p-4 rounded-full bg-emerald-500/15 border border-emerald-500/30 mb-3">
            <CheckCircle2 size={44} color="#10B981" />
          </View>

          <Text className="text-ivory font-serif text-2xl font-light text-center">
            Order Confirmed
          </Text>

          <Text className="text-muted text-xs text-center mt-1">
            Thank you for shopping with Dave Store, Main Market, Onitsha.
          </Text>
        </View>

        {/* Order Identifier Card */}
        <View className="bg-charcoal p-4 rounded-xl border border-gold/25 mb-4 items-center">
          <Text className="text-muted text-[10px] uppercase tracking-widest">
            Order Reference
          </Text>
          <Text className="text-gold font-serif text-xl font-bold tracking-widest mt-1">
            {orderNumber || 'ORD-UNKNOWN'}
          </Text>

          <TouchableOpacity
            onPress={handleShare}
            className="mt-3 flex-row items-center gap-1.5 bg-ink px-3 py-1.5 rounded-full border border-gold/20"
          >
            <Copy size={12} color="#C5A880" />
            <Text className="text-gold text-[10px] uppercase tracking-wider">
              Share Reference
            </Text>
          </TouchableOpacity>
        </View>

        {/* Bank Transfer Instructions */}
        {isBankTransfer && (
          <View className="bg-charcoal p-5 rounded-xl border border-gold/25 mb-5 gap-3.5">
            <View className="flex-row items-center gap-2">
              <Building2 size={18} color="#C5A880" />
              <Text className="text-gold text-xs uppercase tracking-widest font-semibold">
                Wire Transfer Instructions
              </Text>
            </View>

            <Text className="text-muted text-xs leading-relaxed">
              Please transfer <Text className="text-gold font-bold">{formatNaira(numericTotal)}</Text> to the corporate account below:
            </Text>

            <View className="bg-ink p-3.5 rounded-lg border border-gold/20 gap-2">
              <View className="flex-row justify-between">
                <Text className="text-muted text-xs">Bank</Text>
                <Text className="text-ivory font-semibold text-xs">
                  {SHOP.bankTransfer.bankName}
                </Text>
              </View>

              <View className="flex-row justify-between">
                <Text className="text-muted text-xs">Account Name</Text>
                <Text className="text-ivory font-semibold text-xs">
                  {SHOP.bankTransfer.accountName}
                </Text>
              </View>

              <View className="flex-row justify-between">
                <Text className="text-muted text-xs">Account Number</Text>
                <Text className="text-gold font-bold text-sm tracking-wider">
                  {SHOP.bankTransfer.accountNumber}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={handleWhatsApp}
              activeOpacity={0.8}
              className="bg-emerald-600/20 border border-emerald-500/40 p-3.5 rounded-lg flex-row items-center justify-center gap-2 mt-1"
            >
              <MessageCircle size={18} color="#10B981" />
              <Text className="text-emerald-400 text-xs font-semibold uppercase tracking-wider">
                Send Receipt via WhatsApp
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Action Button */}
        <LuxuryButton
          title="Return to Collection"
          onPress={() => router.replace('/(tabs)/shop' as any)}
          variant="secondary"
          className="mt-2"
        />
      </ScrollView>
    </View>
  );
}
