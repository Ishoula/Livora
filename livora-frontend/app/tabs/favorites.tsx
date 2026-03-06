import React, { useCallback, useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  Image,
  StatusBar,
  TouchableOpacity,
  Alert,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { getSession } from '../../lib/session';
import { apiRequestAuth } from '../../lib/apiAuth';
import TopNavBar, { TOP_NAVBAR_BASE_HEIGHT } from '../../components/TopNavBar';

// --- Types & Interfaces ---

interface Property {
  id: number;
  title: string;
  location: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  imageUrl: string;
  type: 'Rent' | 'Sale';
}

type ApiPropertyImage = {
  id: number;
  imageUrl: string;
};

type ApiProperty = {
  id: number;
  title: string;
  price: number | string;
  location: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  image_url: string | null;
  propertyType: string | null;
  images?: ApiPropertyImage[];
};

type ApiFavorite = {
  id: number;
  property: ApiProperty;
};

// --- Mappers ---

const toPropertyType = (value: unknown): Property['type'] => {
  if (value === 'Rent') return 'Rent';
  return 'Sale';
};

const mapApiPropertyToUi = (p: ApiProperty): Property => {
  const firstImageUrl = p.images?.[0]?.imageUrl;
  return {
    id: p.id,
    title: p.title,
    location: p.location ?? '',
    price: typeof p.price === 'string' ? Number(p.price) : p.price,
    bedrooms: p.bedrooms ?? 0,
    bathrooms: p.bathrooms ?? 0,
    imageUrl: firstImageUrl ?? p.image_url ?? '',
    type: toPropertyType(p.propertyType)
  };
};

// --- Components ---

const FavoritePropertyCard: React.FC<{
  item: Property;
  onRemoveFavorite: (id: number) => void;
}> = ({ item, onRemoveFavorite }) => (
  <TouchableOpacity activeOpacity={0.9} style={styles.card}>
    <Image source={{ uri: item.imageUrl }} style={styles.cardImage} />
    <View style={styles.typeTag}>
      <Text style={styles.typeTagText}>{item.type.toUpperCase()}</Text>
    </View>
    <TouchableOpacity 
      style={styles.favoriteIcon} 
      onPress={() => onRemoveFavorite(item.id)}
    >
      <Ionicons name="heart" size={22} color="#e11d48" />
    </TouchableOpacity>

    <View style={styles.cardDetails}>
      <Text style={styles.cardPrice}>${item.price.toLocaleString()}</Text>
      <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
      
      <View style={styles.locationRow}>
        <Ionicons name="location-sharp" size={14} color="#666" />
        <Text style={styles.locationText}>{item.location}</Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.amenitiesRow}>
        <View style={styles.amenity}>
          <Ionicons name="bed-outline" size={16} color="#001a2d" />
          <Text style={styles.amenityText}>{item.bedrooms} Bed</Text>
        </View>
        <View style={styles.amenity}>
          <MaterialCommunityIcons name="shower-head" size={16} color="#001a2d" />
          <Text style={styles.amenityText}>{item.bathrooms} Bath</Text>
        </View>
      </View>
    </View>
  </TouchableOpacity>
);

// --- Main Page ---

const FavoritesPage = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [favorites, setFavorites] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const headerTotalHeight = insets.top + TOP_NAVBAR_BASE_HEIGHT;

  const loadFavorites = useCallback(async () => {
    const session = getSession();
    if (!session?.tokens?.accessToken) {
      setFavorites([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const apiFavorites = await apiRequestAuth<ApiFavorite[]>({
        path: '/api/favorites'
      });
      setFavorites(apiFavorites.map((f) => mapApiPropertyToUi(f.property)));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load favorites');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadFavorites();
  }, [loadFavorites]);

  useFocusEffect(
    useCallback(() => {
      void loadFavorites();
    }, [loadFavorites])
  );

  const removeFavorite = async (propertyId: number) => {
    const session = getSession();
    if (!session?.tokens?.accessToken) {
      Alert.alert('Login required', 'Please log in to manage favorites.');
      return;
    }

    const prev = favorites;
    setFavorites((cur) => cur.filter((p) => p.id !== propertyId));

    try {
      await apiRequestAuth({
        method: 'DELETE',
        path: `/api/favorites/${propertyId}`
      });
    } catch (e) {
      setFavorites(prev);
      Alert.alert('Error', e instanceof Error ? e.message : 'Failed to update favorites');
    }
  };

  const isLoggedIn = !!getSession()?.tokens?.accessToken;

  return (
    <SafeAreaView style={[styles.container, { paddingTop: headerTotalHeight }]}>
      <StatusBar barStyle="dark-content" />
      <TopNavBar />

      {/* Styled Header Section */}
      <View style={styles.headerSection}>
        <View>
          <Text style={styles.headerTitle}>My Favorites</Text>
          <View style={styles.titleUnderline} />
        </View>
        {isLoggedIn && favorites.length > 0 && (
          <Text style={styles.countBadge}>
            {favorites.length} {favorites.length === 1 ? 'Home' : 'Homes'}
          </Text>
        )}
      </View>

      {!isLoggedIn ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="lock-closed-outline" size={48} color="#ccc" style={{ marginBottom: 16 }} />
          <Text style={styles.emptyText}>Log in to view your favorite properties.</Text>
          <TouchableOpacity 
            style={styles.loginCta} 
            onPress={() => router.push('/(auth)/login')}
          >
            <Text style={styles.loginCtaText}>Go to Login</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <FavoritePropertyCard item={item} onRemoveFavorite={removeFavorite} />
          )}
          ListHeaderComponent={
            loading ? (
              <ActivityIndicator color="#001a2d" style={{ marginVertical: 20 }} />
            ) : error ? (
              <Text style={styles.errorText}>{error}</Text>
            ) : null
          }
          ListEmptyComponent={
            !loading ? (
              <View style={styles.emptyContainer}>
                <MaterialCommunityIcons name="heart-outline" size={48} color="#ccc" />
                <Text style={styles.emptyText}>You haven't saved any homes yet.</Text>
              </View>
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
};

// --- Styles ---

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  headerSection: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#001a2d',
    letterSpacing: -0.5,
  },
  titleUnderline: {
    height: 4,
    width: 35,
    backgroundColor: '#001a2d',
    marginTop: 4,
    borderRadius: 2,
  },
  countBadge: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
    marginBottom: 4,
  },
  listContent: { paddingHorizontal: 20, paddingBottom: 40 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  cardImage: { 
    width: '100%', 
    height: 200, 
    borderTopLeftRadius: 24, 
    borderTopRightRadius: 24 
  },
  typeTag: {
    position: 'absolute',
    top: 15,
    left: 15,
    backgroundColor: 'rgba(0, 26, 45, 0.9)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  typeTagText: { color: '#fff', fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  favoriteIcon: {
    position: 'absolute',
    top: 15,
    right: 15,
    backgroundColor: '#fff',
    padding: 8,
    borderRadius: 20,
  },
  cardDetails: { padding: 16 },
  cardPrice: { fontSize: 22, fontWeight: '800', color: '#001a2d' },
  cardTitle: { fontSize: 16, color: '#444', marginTop: 4, fontWeight: '500' },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  locationText: { color: '#777', fontSize: 13 },
  divider: { height: 1, backgroundColor: '#f0f0f0', marginVertical: 12 },
  amenitiesRow: { flexDirection: 'row', gap: 16 },
  amenity: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  amenityText: { color: '#444', fontSize: 13, fontWeight: '500' },
  emptyContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    paddingHorizontal: 40,
    marginTop: 60 
  },
  emptyText: { textAlign: 'center', color: '#888', fontSize: 16, lineHeight: 24 },
  loginCta: {
    backgroundColor: '#001a2d',
    paddingHorizontal: 30,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 20,
  },
  loginCtaText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  errorText: { color: '#e11d48', textAlign: 'center', marginTop: 10 },
});

export default FavoritesPage;