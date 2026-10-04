import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, Building2, Banknote, ShieldAlert } from 'lucide-react-native';
import {
  useCartStore,
  selectCartSubtotal,
  selectCartShippingFee,
  selectCartTotal,
} from '@/store/cart';
import { formatNaira } from '@/utils/money';
import { SHOP, isPayOnDeliverySupported } from '@/config/shop';
import { LuxuryButton } from '@/components/common/LuxuryButton';
import { OrderApi } from '@/services/api';

const NIGERIAN_STATES = [
  'Anambra',
  'Lagos',
  'Abuja (FCT)',
  'Rivers',
  'Enugu',
  'Imo',
  'Delta',
  'Ogun',
  'Oyo',
  'Kano',
  'Kaduna',
  'Edo',
];

export default function CheckoutScreen() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clear);

  const subtotal = useCartStore(selectCartSubtotal);
  const shippingFee = useCartStore(selectCartShippingFee);
  const total = useCartStore(selectCartTotal);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [state, setState] = useState('Anambra');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'bank_transfer' | 'pay_on_delivery'>('bank_transfer');
  const [loading, setLoading] = useState(false);

  const podSupported = isPayOnDeliverySupported(state);

  const handlePlaceOrder = async () => {
    if (!fullName.trim() || !email.trim() || !phone.trim() || !address.trim() || !city.trim()) {
      Alert.alert('Required Fields', 'Please fill in all delivery details before placing your order.');
      return;
    }

    if (paymentMethod === 'pay_on_delivery' && !podSupported) {
      Alert.alert('Payment Method', 'Pay on Delivery is only supported in Lagos and Anambra.');
      return;
    }

    try {
      setLoading(true);
      const res = await OrderApi.create({
        customerName: fullName.trim(),
        customerEmail: email.trim(),
        customerPhone: phone.trim(),
        deliveryAddress: address.trim(),
        deliveryCity: city.trim(),
        deliveryState: state,
        paymentMethod,
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
      });

      if (res.data?.success && res.data.order) {
        clearCart();
        router.replace({
          pathname: '/order-confirmation' as any,
          params: {
            orderNumber: res.data.order.orderNumber,
            totalKobo: res.data.order.totalKobo,
            paymentMethod: res.data.order.paymentMethod,
          },
        });
      } else {
        Alert.alert('Order Failed', res.error || 'Failed to place order. Please try again.');
      }
    } catch (err: any) {
      Alert.alert('Order Failed', err?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-ink">
      {/* Header */}
      <View className="px-4 pt-3 pb-3 border-b border-gold/20 flex-row items-center justify-between">
        <TouchableOpacity
          onPress={() => router.back()}
          className="p-2 -ml-2 rounded-full"
          activeOpacity={0.7}
        >
          <ChevronLeft size={24} color="#C5A880" />
        </TouchableOpacity>

        <Text className="text-ivory font-serif text-base font-light tracking-wider">
          Checkout
        </Text>

        <View className="w-8" />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 110 }}
      >
        {/* Customer Information */}
        <View className="bg-charcoal p-4 rounded-xl border border-gold/20 mb-4 gap-3">
          <Text className="text-gold text-[10px] uppercase tracking-[0.2em] font-semibold">
            Contact Information
          </Text>

          <View>
            <Text className="text-muted text-[11px] mb-1">Full Name</Text>
            <TextInput
              placeholder="Emeka Okafor"
              placeholderTextColor="#71717A"
              value={fullName}
              onChangeText={setFullName}
              className="bg-ink px-3.5 py-2.5 rounded-lg border border-gold/25 text-ivory text-xs"
            />
          </View>

          <View>
            <Text className="text-muted text-[11px] mb-1">Email Address</Text>
            <TextInput
              placeholder="emeka@example.com"
              placeholderTextColor="#71717A"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
              className="bg-ink px-3.5 py-2.5 rounded-lg border border-gold/25 text-ivory text-xs"
            />
          </View>

          <View>
            <Text className="text-muted text-[11px] mb-1">Phone Number</Text>
            <TextInput
              placeholder="0801 234 5678"
              placeholderTextColor="#71717A"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
              className="bg-ink px-3.5 py-2.5 rounded-lg border border-gold/25 text-ivory text-xs"
            />
          </View>
        </View>

        {/* Delivery Details */}
        <View className="bg-charcoal p-4 rounded-xl border border-gold/20 mb-4 gap-3">
          <Text className="text-gold text-[10px] uppercase tracking-[0.2em] font-semibold">
            Delivery Destination
          </Text>

          <View>
            <Text className="text-muted text-[11px] mb-1.5">State</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="gap-2">
              {NIGERIAN_STATES.map((s) => {
                const isSelected = state === s;
                return (
                  <TouchableOpacity
                    key={s}
                    onPress={() => {
                      setState(s);
                      if (!isPayOnDeliverySupported(s)) {
                        setPaymentMethod('bank_transfer');
                      }
                    }}
                    className={`px-3 py-1.5 rounded-full border ${
                      isSelected ? 'bg-gold border-gold' : 'bg-ink border-gold/25'
                    }`}
                  >
                    <Text
                      className={`text-xs font-medium ${
                        isSelected ? 'text-ink font-bold' : 'text-gold'
                      }`}
                    >
                      {s}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          <View>
            <Text className="text-muted text-[11px] mb-1">City / Town</Text>
            <TextInput
              placeholder="Onitsha, Ikeja, Lekki, Port Harcourt..."
              placeholderTextColor="#71717A"
              value={city}
              onChangeText={setCity}
              className="bg-ink px-3.5 py-2.5 rounded-lg border border-gold/25 text-ivory text-xs"
            />
          </View>

          <View>
            <Text className="text-muted text-[11px] mb-1">Street Address</Text>
            <TextInput
              placeholder="12 Market Road, Flat 4"
              placeholderTextColor="#71717A"
              value={address}
              onChangeText={setAddress}
              className="bg-ink px-3.5 py-2.5 rounded-lg border border-gold/25 text-ivory text-xs"
            />
          </View>
        </View>

        {/* Payment Method Selector */}
        <View className="bg-charcoal p-4 rounded-xl border border-gold/20 mb-4 gap-3">
          <Text className="text-gold text-[10px] uppercase tracking-[0.2em] font-semibold">
            Payment Method
          </Text>

          {/* Bank Transfer Option */}
          <TouchableOpacity
            onPress={() => setPaymentMethod('bank_transfer')}
            activeOpacity={0.8}
            className={`p-3.5 rounded-lg border flex-row items-center gap-3 ${
              paymentMethod === 'bank_transfer'
                ? 'bg-ink border-gold'
                : 'bg-ink/50 border-gold/20'
            }`}
          >
            <Building2 size={20} color={paymentMethod === 'bank_transfer' ? '#C5A880' : '#71717A'} />
            <View className="flex-1">
              <Text className="text-ivory text-xs font-semibold">
                Direct Bank Transfer (Instant Verification)
              </Text>
              <Text className="text-muted text-[11px] mt-0.5">
                Transfer to Dave Store corporate account. Verified immediately via WhatsApp.
              </Text>
            </View>
            <View
              className={`w-4 h-4 rounded-full border items-center justify-center ${
                paymentMethod === 'bank_transfer' ? 'border-gold bg-gold' : 'border-muted'
              }`}
            />
          </TouchableOpacity>

          {/* Pay on Delivery Option */}
          <TouchableOpacity
            disabled={!podSupported}
            onPress={() => setPaymentMethod('pay_on_delivery')}
            activeOpacity={0.8}
            className={`p-3.5 rounded-lg border flex-row items-center gap-3 ${
              !podSupported
                ? 'opacity-40 bg-zinc-900 border-zinc-800'
                : paymentMethod === 'pay_on_delivery'
                ? 'bg-ink border-gold'
                : 'bg-ink/50 border-gold/20'
            }`}
          >
            <Banknote size={20} color={paymentMethod === 'pay_on_delivery' ? '#C5A880' : '#71717A'} />
            <View className="flex-1">
              <Text className="text-ivory text-xs font-semibold">
                Pay on Delivery
              </Text>
              <Text className="text-muted text-[11px] mt-0.5">
                {podSupported
                  ? 'Pay with cash or POS upon courier inspection.'
                  : 'Currently available only in Lagos and Anambra.'}
              </Text>
            </View>
            <View
              className={`w-4 h-4 rounded-full border items-center justify-center ${
                paymentMethod === 'pay_on_delivery' ? 'border-gold bg-gold' : 'border-muted'
              }`}
            />
          </TouchableOpacity>
        </View>

        {/* Order Summary Card */}
        <View className="bg-charcoal p-4 rounded-xl border border-gold/20 gap-2">
          <Text className="text-gold text-[10px] uppercase tracking-[0.2em] font-semibold mb-1">
            Total Payable
          </Text>

          <View className="flex-row items-center justify-between">
            <Text className="text-muted text-xs">Subtotal ({items.length} items)</Text>
            <Text className="text-ivory text-xs">{formatNaira(subtotal)}</Text>
          </View>

          <View className="flex-row items-center justify-between">
            <Text className="text-muted text-xs">Delivery Fee</Text>
            <Text className="text-ivory text-xs">
              {shippingFee === 0 ? <Text className="text-gold">FREE</Text> : formatNaira(shippingFee)}
            </Text>
          </View>

          <View className="h-[1px] bg-gold/15 my-1" />

          <View className="flex-row items-center justify-between">
            <Text className="text-ivory font-serif text-base">Grand Total</Text>
            <Text className="text-gold font-bold text-base">{formatNaira(total)}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Sticky Place Order Bar */}
      <View className="absolute bottom-0 left-0 right-0 p-4 bg-ink/95 border-t border-gold/20">
        <LuxuryButton
          title={`Confirm & Place Order · ${formatNaira(total)}`}
          loading={loading}
          onPress={handlePlaceOrder}
        />
      </View>
    </View>
  );
}
