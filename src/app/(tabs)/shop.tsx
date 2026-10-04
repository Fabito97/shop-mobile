import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Search, X } from 'lucide-react-native';
import { Header } from '@/components/common/Header';
import { ProductCard } from '@/components/product/ProductCard';
import { ProductApi, Product } from '@/services/api';

const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'classic', label: 'Classic' },
  { id: 'dress', label: 'Dress' },
  { id: 'sport', label: 'Sport' },
  { id: 'smart', label: 'Smart' },
];

export default function ShopScreen() {
  const params = useLocalSearchParams<{ category?: string }>();
  const [selectedCategory, setSelectedCategory] = useState<string>(
    params.category || 'all'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (params.category) {
      setSelectedCategory(params.category);
    }
  }, [params.category]);

  const fetchProducts = async () => {
    try {
      const res = await ProductApi.list({
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
      });
      if (res.data?.items) {
        setProducts(res.data.items);
      }
    } catch (err) {
      console.warn('Failed to load products:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchProducts();
  }, [selectedCategory]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchProducts();
  };

  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products;
    const q = searchQuery.toLowerCase().trim();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
    );
  }, [products, searchQuery]);

  return (
    <View className="flex-1 bg-ink">
      <Header />

      {/* Search Input Bar */}
      <View className="p-4 pb-2">
        <View className="bg-charcoal flex-row items-center px-3.5 py-2.5 rounded-lg border border-gold/25 gap-2.5">
          <Search size={16} color="#C5A880" />
          <TextInput
            placeholder="Search Rolex, Omega, automatic, diver..."
            placeholderTextColor="#71717A"
            value={searchQuery}
            onChangeText={setSearchQuery}
            className="flex-1 text-ivory text-xs"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <X size={16} color="#71717A" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Category Pills */}
      <View className="py-2 border-b border-gold/15">
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={CATEGORIES}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
          renderItem={({ item }) => {
            const isSelected = selectedCategory === item.id;
            return (
              <TouchableOpacity
                onPress={() => setSelectedCategory(item.id)}
                className={`px-4 py-1.5 rounded-full border ${
                  isSelected
                    ? 'bg-gold border-gold'
                    : 'bg-charcoal border-gold/25'
                }`}
                activeOpacity={0.7}
              >
                <Text
                  className={`text-xs uppercase tracking-wider font-semibold ${
                    isSelected ? 'text-ink' : 'text-gold'
                  }`}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Product Grid */}
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="small" color="#C5A880" />
          <Text className="text-muted text-xs mt-3 uppercase tracking-wider">
            Loading Timepieces...
          </Text>
        </View>
      ) : filteredProducts.length === 0 ? (
        <View className="flex-1 items-center justify-center p-6">
          <Text className="text-ivory font-serif text-lg font-light text-center">
            No watches match your search
          </Text>
          <Text className="text-muted text-xs text-center mt-1">
            Try adjusting your search terms or selecting a different category.
          </Text>
          <TouchableOpacity
            onPress={() => {
              setSearchQuery('');
              setSelectedCategory('all');
            }}
            className="mt-4 bg-charcoal px-5 py-2.5 rounded-md border border-gold/30"
          >
            <Text className="text-gold text-xs uppercase tracking-wider">
              Reset Filters
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={{ padding: 10, paddingBottom: 40 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#C5A880"
            />
          }
          renderItem={({ item }) => (
            <View className="w-1/2">
              <ProductCard product={item} />
            </View>
          )}
        />
      )}
    </View>
  );
}
