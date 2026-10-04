import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Plus } from 'lucide-react-native';
import { Product } from '@/services/api';
import { formatNaira } from '@/utils/money';
import { useCartStore } from '@/store/cart';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const router = useRouter();
  const addToCart = useCartStore((s) => s.add);

  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 3;

  const handleAdd = () => {
    if (isOutOfStock) return;
    addToCart({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      brand: product.brand,
      image: product.imageUrl,
      priceKobo: product.priceKobo,
      stock: product.stock,
    });
  };

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => router.push(`/product/${product.slug}` as any)}
      className="bg-charcoal rounded-lg border border-gold/15 overflow-hidden flex-1 m-1.5"
    >
      <View className="relative bg-ink aspect-square items-center justify-center overflow-hidden">
        <Image
          source={{ uri: product.imageUrl }}
          className="w-full h-full"
          resizeMode="cover"
        />
        <View className="absolute top-2 left-2 bg-ink/80 px-2 py-0.5 rounded border border-gold/20">
          <Text className="text-[9px] uppercase tracking-wider text-gold font-medium">
            {product.category}
          </Text>
        </View>
      </View>

      <View className="p-3">
        <Text className="text-[10px] uppercase tracking-wider text-muted font-medium">
          {product.brand}
        </Text>
        <Text
          numberOfLines={1}
          className="text-ivory font-serif text-sm font-normal mt-0.5"
        >
          {product.name}
        </Text>

        <View className="mt-2 flex-row items-center justify-between">
          <Text className="text-gold font-medium text-xs">
            {formatNaira(product.priceKobo)}
          </Text>

          <TouchableOpacity
            onPress={handleAdd}
            disabled={isOutOfStock}
            className={`p-1.5 rounded-full ${
              isOutOfStock
                ? 'bg-zinc-800 opacity-40'
                : 'bg-gold/15 border border-gold/40'
            }`}
          >
            <Plus size={14} color={isOutOfStock ? '#71717A' : '#C5A880'} />
          </TouchableOpacity>
        </View>

        <View className="mt-2 flex-row items-center gap-1.5">
          <View
            className={`w-1.5 h-1.5 rounded-full ${
              isOutOfStock
                ? 'bg-danger'
                : isLowStock
                ? 'bg-amber-400'
                : 'bg-success'
            }`}
          />
          <Text className="text-[9px] text-muted">
            {isOutOfStock
              ? 'Out of Stock'
              : isLowStock
              ? `Only ${product.stock} left`
              : 'In Stock'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
