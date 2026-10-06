import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import * as AuthSession from 'expo-auth-session';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { User as UserIcon, LogOut, MessageCircle, MapPin, Package, Shield, ExternalLink } from 'lucide-react-native';
import { Header } from '@/components/common/Header';
import { LuxuryButton } from '@/components/common/LuxuryButton';
import { useAuthStore } from '@/store/auth';
import { useCartSync } from '@/hooks/useCartSync';
import { OrderApi, AuthApi, Order } from '@/services/api';
import { BRAND } from '@/config/brand';
import { formatNaira } from '@/utils/money';

WebBrowser.maybeCompleteAuthSession();

if (Platform.OS !== 'web') {
  GoogleSignin.configure({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
    scopes: ['profile', 'email'],
  });
}

export default function AccountScreen() {
  const { user, token, logout, setSession, isCheckingAuth } = useAuthStore();
  const { sync } = useCartSync();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [signingIn, setSigningIn] = useState(false);

  // Web fallback using expo-auth-session
  const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
  const redirectUri = Platform.select({
    web: AuthSession.makeRedirectUri(),
    default: isExpoGo
      ? 'https://auth.expo.io/@fabbenco/shop-mobile'
      : AuthSession.makeRedirectUri({ scheme: 'shop-mobile' }),
  });

  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
    androidClientId:
      process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID ||
      process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
    scopes: ['openid', 'profile', 'email'],
    responseType: 'id_token',
    redirectUri,
  });

  // Handle native Google sign-in
  const handleGoogleSignIn = async () => {
    if (Platform.OS === 'web') {
      promptAsync();
      return;
    }

    try {
      setSigningIn(true);
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const signInResult = await GoogleSignin.signIn();

      if (signInResult.type === 'success' && signInResult.data?.idToken) {
        const res = await AuthApi.googleLogin(signInResult.data.idToken);
        if (res.data?.success && res.data.token && res.data.user) {
          await setSession(res.data.token, res.data.user);
          await sync();
          Alert.alert('Welcome', `Signed in as ${res.data.user.name || res.data.user.email}`);
        } else {
          Alert.alert('Sign-In Failed', res.error || 'Unable to authenticate with Google.');
        }
      }
    } catch (error: any) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        // User dismissed the account picker
      } else if (error.code === statusCodes.IN_PROGRESS) {
        // Sign-in already in progress
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        Alert.alert('Play Services Unavailable', 'Google Play Services is not available or outdated.');
      } else {
        Alert.alert('Sign-In Error', error?.message || 'Authentication error.');
      }
    } finally {
      setSigningIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      if (Platform.OS !== 'web') {
        await GoogleSignin.signOut().catch(() => {});
      }
    } catch (_) {}
    await logout();
  };

  useEffect(() => {
    if (response?.type === 'success') {
      const idToken =
        response.params?.id_token ||
        (response as any).authentication?.idToken;

      if (idToken) {
        setSigningIn(true);
        AuthApi.googleLogin(idToken)
          .then(async (res) => {
            if (res.data?.success && res.data.token && res.data.user) {
              await setSession(res.data.token, res.data.user);
              await sync();
              Alert.alert('Welcome', `Signed in as ${res.data.user.name || res.data.user.email}`);
            } else {
              Alert.alert('Sign-In Failed', res.error || 'Unable to authenticate with Google.');
            }
          })
          .catch((err) => {
            Alert.alert('Error', err?.message || 'Authentication error.');
          })
          .finally(() => {
            setSigningIn(false);
          });
      }
    } else if (response?.type === 'error') {
      Alert.alert('Google Sign-In Error', response.error?.message || 'Sign in was cancelled or failed.');
    }
  }, [response]);

  useEffect(() => {
    if (token) {
      setLoadingOrders(true);
      OrderApi.list()
        .then((res) => {
          if (res.data?.items) {
            setOrders(res.data.items);
          }
        })
        .finally(() => setLoadingOrders(false));
    } else {
      setOrders([]);
    }
  }, [token]);

  const handleWhatsApp = () => {
    const text = encodeURIComponent(BRAND.whatsapp.message);
    const url = `https://wa.me/${BRAND.whatsapp.number.replace(/\D/g, '')}?text=${text}`;
    Linking.openURL(url).catch(() => {});
  };

  return (
    <View className="flex-1 bg-ink">
      <Header />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      >
        {/* Profile / Authentication Status */}
        {isCheckingAuth ? (
          <View className="bg-charcoal p-8 rounded-xl border border-gold/25 mb-5 items-center justify-center min-h-[170px]">
            <ActivityIndicator size="small" color="#C5A880" />
            <Text className="text-sand text-xs mt-3 uppercase tracking-widest font-medium">
              Verifying Membership...
            </Text>
          </View>
        ) : user ? (
          <View className="bg-charcoal p-5 rounded-xl border border-gold/25 mb-5">
            <View className="flex-row items-center gap-3.5">
              <View className="w-12 h-12 rounded-full bg-gold/20 border border-gold/40 items-center justify-center">
                <UserIcon size={24} color="#C5A880" />
              </View>
              <View className="flex-1">
                <Text className="text-ivory font-serif text-lg font-medium">
                  {user.name || 'Dave Store Customer'}
                </Text>
                <Text className="text-muted text-xs">{user.email}</Text>
                <View className="flex-row mt-1.5">
                  <View className="bg-gold/15 px-2 py-0.5 rounded border border-gold/30">
                    <Text className="text-[10px] uppercase font-bold text-gold">
                      {user.role}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            <TouchableOpacity
              onPress={handleLogout}
              className="mt-4 pt-3 border-t border-gold/15 flex-row items-center gap-2 justify-center"
            >
              <LogOut size={14} color="#EF4444" />
              <Text className="text-danger text-xs uppercase tracking-wider font-semibold">
                Sign Out
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View className="bg-charcoal p-5 rounded-xl border border-gold/25 mb-5">
            <View className="items-center text-center mb-4">
              <View className="w-12 h-12 rounded-full bg-gold/15 border border-gold/30 items-center justify-center mb-2">
                <Shield size={24} color="#C5A880" />
              </View>
              <Text className="text-ivory font-serif text-lg font-medium text-center">
                Member Account
              </Text>
              <Text className="text-muted text-xs text-center mt-1 max-w-xs leading-relaxed">
                Sign in with your Google account to synchronize your cart across devices and track your courier delivery in real time.
              </Text>
            </View>

            <LuxuryButton
              title="Continue with Google"
              loading={signingIn}
              disabled={signingIn}
              onPress={handleGoogleSignIn}
              className="w-full"
            />
          </View>
        )}

        {/* Order History */}
        {user && (
          <View className="mb-6">
            <View className="flex-row items-center gap-2 mb-3">
              <Package size={16} color="#C5A880" />
              <Text className="text-ivory font-serif text-base">Your Orders</Text>
            </View>

            {loadingOrders ? (
              <ActivityIndicator size="small" color="#C5A880" className="py-6" />
            ) : orders.length === 0 ? (
              <View className="bg-charcoal p-5 rounded-xl border border-gold/15 items-center">
                <Text className="text-muted text-xs">No orders placed yet.</Text>
              </View>
            ) : (
              orders.map((ord) => (
                <View
                  key={ord.id}
                  className="bg-charcoal p-4 rounded-xl border border-gold/15 mb-2.5"
                >
                  <View className="flex-row items-center justify-between mb-2">
                    <Text className="text-gold font-bold text-xs uppercase">
                      {ord.orderNumber}
                    </Text>
                    <View className="bg-ink px-2 py-0.5 rounded border border-gold/20">
                      <Text className="text-[10px] text-ivory uppercase">
                        {ord.status}
                      </Text>
                    </View>
                  </View>

                  <Text className="text-ivory font-medium text-sm">
                    {formatNaira(ord.totalKobo)}
                  </Text>
                  <Text className="text-muted text-[11px] mt-0.5">
                    Delivering to {ord.deliveryCity}, {ord.deliveryState}
                  </Text>
                </View>
              ))
            )}
          </View>
        )}

        {/* Concierge Support Section */}
        <View className="bg-charcoal p-5 rounded-xl border border-gold/20 gap-4">
          <Text className="text-gold text-[10px] uppercase tracking-[0.25em] font-semibold">
            Concierge & Support
          </Text>

          <TouchableOpacity
            onPress={handleWhatsApp}
            activeOpacity={0.8}
            className="flex-row items-center justify-between bg-ink p-3.5 rounded-lg border border-gold/25"
          >
            <View className="flex-row items-center gap-3">
              <View className="p-2 rounded-full bg-emerald-500/10 border border-emerald-500/30">
                <MessageCircle size={18} color="#10B981" />
              </View>
              <View>
                <Text className="text-ivory text-xs font-semibold">
                  WhatsApp Support
                </Text>
                <Text className="text-muted text-[11px]">
                  {BRAND.whatsapp.display} · Chat with our horologist
                </Text>
              </View>
            </View>
            <ExternalLink size={14} color="#71717A" />
          </TouchableOpacity>

          <View className="flex-row items-start gap-3 pt-2 border-t border-gold/15">
            <MapPin size={16} color="#C5A880" className="mt-0.5" />
            <View className="flex-1">
              <Text className="text-ivory text-xs font-medium">Showroom Location</Text>
              <Text className="text-muted text-[11px] mt-0.5">
                {BRAND.location.address}, {BRAND.location.city}, {BRAND.location.state}
              </Text>
            </View>
          </View>
        </View>

        <Text className="text-center text-muted text-[10px] mt-8 uppercase tracking-widest">
          {BRAND.name} · v1.0.0
        </Text>
      </ScrollView>
    </View>
  );
}
