import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, ShoppingBag, Minus, Plus, ShieldCheck } from 'lucide-react-native';
import { ProductApi, Product } from '@/services/api';
import { formatNaira } from '@/utils/money';
import { useCartStore, selectCartCount } from '@/store/cart';
import { LuxuryButton } from '@/components/common/LuxuryButton';

export default function ProductDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const cartCount = useCartStore(selectCartCount);
  const addToCart = useCartStore((s) => s.add);

  useEffect(() => {
    if (slug) {
      ProductApi.getBySlug(slug)
        .then((res) => {
          if (res.data) setProduct(res.data);
        })
        .finally(() => setLoading(false));
    }
  }, [slug]);

  if (loading) {
    return (
      <View className="flex-1 bg-ink items-center justify-center">
        <ActivityIndicator size="small" color="#C5A880" />
      </View>
    );
  }

  if (!product) {
    return (
      <View className="flex-1 bg-ink items-center justify-center p-6">
        <Text className="text-ivory font-serif text-xl">Watch not found</Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="mt-4 bg-charcoal px-5 py-2.5 rounded border border-gold/30"
        >
          <Text className="text-gold text-xs uppercase">Return</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 3;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addToCart(
      {
        productId: product.id,
        slug: product.slug,
        name: product.name,
        brand: product.brand,
        image: product.imageUrl,
        priceKobo: product.priceKobo,
        stock: product.stock,
      },
      quantity
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <View className="flex-1 bg-ink">
      {/* Top Bar */}
      <View className="px-4 pt-3 pb-3 border-b border-gold/20 flex-row items-center justify-between">
        <TouchableOpacity
          onPress={() => router.back()}
          className="p-2 -ml-2 rounded-full"
          activeOpacity={0.7}
        >
          <ChevronLeft size={24} color="#C5A880" />
        </TouchableOpacity>

        <Text className="text-ivory font-serif text-sm tracking-wider uppercase">
          {product.brand}
        </Text>

        <TouchableOpacity
          onPress={() => router.push('/(tabs)/cart' as any)}
          className="relative p-2 rounded-full bg-charcoal border border-gold/20"
          activeOpacity={0.7}
        >
          <ShoppingBag size={18} color="#C5A880" />
          {cartCount > 0 && (
            <View className="absolute -top-1 -right-1 bg-gold px-1 rounded-full min-w-[16px] h-4 items-center justify-center">
              <Text className="text-ink text-[9px] font-bold">{cartCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 110 }}
      >
        {/* Watch Image Showcase */}
        <View className="w-full aspect-square bg-charcoal items-center justify-center border-b border-gold/15">
          <Image
            source={{ uri: product.imageUrl }}
            className="w-full h-full"
            resizeMode="cover"
          />
        </View>

        <View className="p-5">
          {/* Category Tag */}
          <View className="self-start bg-gold/15 px-2.5 py-1 rounded border border-gold/30 mb-2">
            <Text className="text-gold text-[10px] uppercase tracking-widest font-semibold">
              {product.category}
            </Text>
          </View>

          {/* Title and Price */}
          <Text className="text-ivory font-serif text-2xl font-light">
            {product.name}
          </Text>

          <Text className="text-gold font-serif text-2xl font-medium mt-1">
            {formatNaira(product.priceKobo)}
          </Text>

          {/* Stock Status Pill */}
          <View className="flex-row items-center gap-2 mt-3">
            <View
              className={`w-2 h-2 rounded-full ${
                isOutOfStock
                  ? 'bg-danger'
                  : isLowStock
                  ? 'bg-amber-400'
                  : 'bg-success'
              }`}
            />
            <Text className="text-xs text-muted">
              {isOutOfStock
                ? 'Out of Stock'
                : isLowStock
                ? `Only ${product.stock} left in stock`
                : 'In Stock · Ready to dispatch'}
            </Text>
          </View>

          {/* Description */}
          <View className="mt-6 pt-5 border-t border-gold/15">
            <Text className="text-gold text-[10px] uppercase tracking-[0.25em] font-semibold mb-2">
              About This Watch
            </Text>
            <Text className="text-muted text-xs leading-relaxed">
              {product.description}
            </Text>
          </View>

          {/* Specifications Table */}
          <View className="mt-6 bg-charcoal p-4 rounded-xl border border-gold/20 gap-3">
            <Text className="text-gold text-[10px] uppercase tracking-[0.25em] font-semibold">
              Technical Specifications
            </Text>

            <View className="flex-row justify-between py-1 border-b border-gold/10">
              <Text className="text-muted text-xs">Movement</Text>
              <Text className="text-ivory text-xs font-medium">
                {product.movement || 'Quartz / Automatic'}
              </Text>
            </View>

            <View className="flex-row justify-between py-1 border-b border-gold/10">
              <Text className="text-muted text-xs">Case Size</Text>
              <Text className="text-ivory text-xs font-medium">
                {product.caseSizeMm ? `${product.caseSizeMm} mm` : '40 mm'}
              </Text>
            </View>

            <View className="flex-row justify-between py-1 border-b border-gold/10">
              <Text className="text-muted text-xs">Strap</Text>
              <Text className="text-ivory text-xs font-medium">
                {product.strap || 'Premium Bracelet'}
              </Text>
            </View>

            <View className="flex-row justify-between py-1">
              <Text className="text-muted text-xs">Water Resistance</Text>
              <Text className="text-ivory text-xs font-medium">
                {product.waterResistance || '50m'}
              </Text>
            </View>
          </View>

          {/* Warranty Badge */}
          <View className="mt-4 flex-row items-center gap-2.5 p-3 rounded-lg bg-gold/10 border border-gold/20">
            <ShieldCheck size={18} color="#C5A880" />
            <Text className="text-gold text-xs font-medium flex-1">
              Includes 1-Year Dave Store Warranty & Authenticity Guarantee
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Sticky Bottom Add To Cart Bar */}
      <View className="absolute bottom-0 left-0 right-0 p-4 bg-ink/95 border-t border-gold/20 flex-row items-center gap-3">
        {/* Quantity Stepper */}
        <View className="flex-row items-center bg-charcoal rounded-md border border-gold/30">
          <TouchableOpacity
            onPress={() => setQuantity(Math.max(1, quantity - 1))}
            className="p-3 px-3.5"
            activeOpacity={0.7}
          >
            <Minus size={14} color="#C5A880" />
          </TouchableOpacity>

          <Text className="text-ivory font-bold text-sm px-2 min-w-[24px] text-center">
            {quantity}
          </Text>

          <TouchableOpacity
            onPress={() => setQuantity(Math.min(product.stock, quantity + 1))}
            disabled={quantity >= product.stock}
            className={`p-3 px-3.5 ${quantity >= product.stock ? 'opacity-30' : 'opacity-100'}`}
            activeOpacity={0.7}
          >
            <Plus size={14} color="#C5A880" />
          </TouchableOpacity>
        </View>

        {/* Add to Cart Button */}
        <View className="flex-1">
          <LuxuryButton
            title={added ? 'Added to Cart' : isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
            disabled={isOutOfStock}
            onPress={handleAddToCart}
            variant={added ? 'secondary' : 'primary'}
          />
        </View>
      </View>
    </View>
  );
}
