import React from 'react';
import { Tabs } from 'expo-router';
import { View, Text } from 'react-native';
import { Home, Compass, ShoppingBag, User } from 'lucide-react-native';
import { useCartStore, selectCartCount } from '@/store/cart';

export default function TabsLayout() {
  const cartCount = useCartStore(selectCartCount);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0B0D0E',
          borderTopColor: 'rgba(197, 168, 128, 0.2)',
          borderTopWidth: 1,
          height: 62,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: '#C5A880',
        tabBarInactiveTintColor: '#71717A',
        tabBarLabelStyle: {
          fontSize: 10,
          textTransform: 'uppercase',
          letterSpacing: 1.2,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Home size={size || 20} color={color} />,
        }}
      />
      <Tabs.Screen
        name="shop"
        options={{
          title: 'Collection',
          tabBarIcon: ({ color, size }) => <Compass size={size || 20} color={color} />,
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: 'Cart',
          tabBarIcon: ({ color, size }) => (
            <View className="relative">
              <ShoppingBag size={size || 20} color={color} />
              {cartCount > 0 && (
                <View className="absolute -top-1.5 -right-2 bg-gold px-1 rounded-full min-w-[16px] h-4 items-center justify-center">
                  <Text className="text-ink text-[9px] font-bold">{cartCount}</Text>
                </View>
              )}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: 'Account',
          tabBarIcon: ({ color, size }) => <User size={size || 20} color={color} />,
        }}
      />
    </Tabs>
  );
}
