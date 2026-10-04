import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  ImageBackground,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ShieldCheck, Truck, MapPin, ArrowRight } from 'lucide-react-native';
import { Header } from '@/components/common/Header';
import { ProductCard } from '@/components/product/ProductCard';
import { ProductApi, Product } from '@/services/api';
import { BRAND } from '@/config/brand';

const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'classic', label: 'Classic' },
  { id: 'dress', label: 'Dress' },
  { id: 'sport', label: 'Sport' },
  { id: 'smart', label: 'Smart' },
];

export default function HomeScreen() {
  const router = useRouter();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchFeatured = async () => {
    try {
      const res = await ProductApi.list({ featured: true });
      if (res.data?.items) {
        setFeaturedProducts(res.data.items);
      }
    } catch (err) {
      console.warn('Failed to load featured products:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchFeatured();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchFeatured();
  };

  return (
    <View className="flex-1 bg-ink">
      <Header />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#C5A880"
          />
        }
      >
        {/* Luxury Hero Banner */}
        <View className="p-4">
          <View className="rounded-xl overflow-hidden border border-gold/30">
            <ImageBackground
              source={{
                uri: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1000',
              }}
              className="w-full h-80 justify-end"
              resizeMode="cover"
            >
              <View className="bg-gradient-to-t from-ink via-ink/80 to-transparent p-5">
                <Text className="text-gold text-[10px] uppercase tracking-[0.3em] font-semibold mb-1">
                  Verified Original Watches
                </Text>
                <Text className="text-ivory font-serif text-2xl font-light tracking-wide leading-tight">
                  Crafted for Excellence.{'\n'}Direct from Onitsha.
                </Text>
                <Text className="text-muted text-xs mt-2 line-clamp-2">
                  Explore original Swiss-movement, automatic, and designer timepieces curated for the Nigerian gentleman and lady.
                </Text>

                <TouchableOpacity
                  onPress={() => router.push('/(tabs)/shop' as any)}
                  activeOpacity={0.8}
                  className="bg-gold mt-4 py-3 px-5 rounded-md flex-row items-center justify-between"
                >
                  <Text className="text-ink text-xs uppercase tracking-[0.2em] font-bold">
                    Explore Collection
                  </Text>
                  <ArrowRight size={16} color="#0B0D0E" />
                </TouchableOpacity>
              </View>
            </ImageBackground>
          </View>
        </View>

        {/* Category Pills */}
        <View className="py-2">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
          >
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                onPress={() =>
                  router.push({
                    pathname: '/(tabs)/shop' as any,
                    params: cat.id !== 'all' ? { category: cat.id } : {},
                  })
                }
                className="bg-charcoal px-4 py-2 rounded-full border border-gold/25"
                activeOpacity={0.7}
              >
                <Text className="text-gold text-xs uppercase tracking-wider font-medium">
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Featured Section */}
        <View className="px-4 pt-6 pb-2 flex-row items-center justify-between">
          <View>
            <Text className="text-gold text-[10px] uppercase tracking-[0.25em] font-semibold">
              Curated Picks
            </Text>
            <Text className="text-ivory font-serif text-xl font-light mt-0.5">
              Featured Timepieces
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => router.push('/(tabs)/shop' as any)}
            className="flex-row items-center gap-1"
          >
            <Text className="text-gold text-xs tracking-wider uppercase font-medium">
              View All
            </Text>
            <ArrowRight size={14} color="#C5A880" />
          </TouchableOpacity>
        </View>

        {loading ? (
          <View className="py-12 items-center">
            <ActivityIndicator size="small" color="#C5A880" />
          </View>
        ) : (
          <View className="px-2.5 flex-row flex-wrap">
            {featuredProducts.map((product) => (
              <View key={product.id} className="w-1/2">
                <ProductCard product={product} />
              </View>
            ))}
          </View>
        )}

        {/* Trust Badges Strip */}
        <View className="m-4 mt-8 bg-charcoal p-5 rounded-xl border border-gold/20 gap-4">
          <View className="flex-row items-center gap-3">
            <View className="p-2 rounded-full bg-gold/10 border border-gold/30">
              <ShieldCheck size={20} color="#C5A880" />
            </View>
            <View className="flex-1">
              <Text className="text-ivory font-serif text-sm font-medium">
                100% Authentic Guarantee
              </Text>
              <Text className="text-muted text-[11px] mt-0.5">
                Every timepiece is strictly inspected for horological accuracy and genuine parts.
              </Text>
            </View>
          </View>

          <View className="h-[1px] bg-gold/15" />

          <View className="flex-row items-center gap-3">
            <View className="p-2 rounded-full bg-gold/10 border border-gold/30">
              <Truck size={20} color="#C5A880" />
            </View>
            <View className="flex-1">
              <Text className="text-ivory font-serif text-sm font-medium">
                Insured Nationwide Delivery
              </Text>
              <Text className="text-muted text-[11px] mt-0.5">
                Fast courier delivery to Lagos, Abuja, Port Harcourt, and all 36 states.
              </Text>
            </View>
          </View>

          <View className="h-[1px] bg-gold/15" />

          <View className="flex-row items-center gap-3">
            <View className="p-2 rounded-full bg-gold/10 border border-gold/30">
              <MapPin size={20} color="#C5A880" />
            </View>
            <View className="flex-1">
              <Text className="text-ivory font-serif text-sm font-medium">
                Main Market, Onitsha
              </Text>
              <Text className="text-muted text-[11px] mt-0.5">
                Physical showroom at {BRAND.location.address}. Walk-ins and inspections welcome.
              </Text>
            </View>
          </View>
        </View>

        <View className="h-10" />
      </ScrollView>
    </View>
  );
}
