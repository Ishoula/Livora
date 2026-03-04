import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  Image,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { getSession } from '../../lib/session';
import { apiRequestAuth } from '../../lib/apiAuth';

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

const toPropertyType = (value: unknown): Property['type'] => {
  if (value === 'Rent') return 'Rent';
  if (value === 'Sale') return 'Sale';
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

interface FavoritePropertyCardProps {
  item: Property;
  onRemoveFavorite: (propertyId: number) => void;
}

const FavoritePropertyCard: React.FC<FavoritePropertyCardProps> = ({ item, onRemoveFavorite }) => (
  <TouchableOpacity style={styles.card}>
    <Image source={{ uri: item.imageUrl }} style={styles.cardImage} />
    <View style={styles.typeTag}>
      <Text style={styles.typeTagText}>{item.type}</Text>
    </View>
    <TouchableOpacity style={styles.favoriteIcon} onPress={() => onRemoveFavorite(item.id)}>
      <Ionicons name="heart" size={24} color="#e11d48" />
    </TouchableOpacity>

    <View style={styles.cardDetails}>
      <Text style={styles.cardPrice}>${item.price.toLocaleString()}</Text>
      <Text style={styles.cardTitle} numberOfLines={1}>
        {item.title}
      </Text>
      <View style={styles.locationRow}>
        <Ionicons name="location-sharp" size={14} color="#666" />
        <Text style={styles.locationText}>{item.location}</Text>
      </View>

      <View style={styles.amenitiesRow}>
        <View style={styles.amenity}>
          <Ionicons name="bed-outline" size={16} color="#001a2d" />
          <Text style={styles.amenityText}>{item.bedrooms} Bed</Text>
        </View>
        <View style={styles.amenity}>
          <MaterialCommunityIcons name="shower" size={16} color="#001a2d" />
          <Text style={styles.amenityText}>{item.bathrooms} Bath</Text>
        </View>
      </View>
    </View>
  </TouchableOpacity>
);

const FavoritesPage = () => {
  const router = useRouter();
  const [favorites, setFavorites] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadFavorites = async () => {
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
  };

  useEffect(() => {
    void loadFavorites();
  }, []);

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
        path: '/api/favorites/' + propertyId
      });
    } catch (e) {
      setFavorites(prev);
      Alert.alert('Favorites', e instanceof Error ? e.message : 'Failed to update favorites');
    }
  };

  const session = getSession();
  const isLoggedIn = Boolean(session?.tokens?.accessToken);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <View>
          <Text style={styles.subHeader}>Favorites</Text>
          <Text style={styles.welcomeText}>Your saved homes</Text>
        </View>
      </View>

      {!isLoggedIn ? (
        <View style={{ paddingHorizontal: 20, paddingTop: 20 }}>
          <Text style={{ color: '#666', marginBottom: 10 }}>Log in to view your favorites.</Text>
          <TouchableOpacity style={styles.loginCta} onPress={() => router.push('/(auth)/login')}>
            <Text style={styles.loginCtaText}>Go to Login</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      <FlatList
        data={favorites}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => <FavoritePropertyCard item={item} onRemoveFavorite={removeFavorite} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          loading || error ? (
            <View style={{ paddingHorizontal: 20, paddingBottom: 10 }}>
              {loading ? <Text style={{ color: '#666' }}>Loading...</Text> : null}
              {error ? <Text style={{ color: 'red' }}>{error}</Text> : null}
            </View>
          ) : null
        }
        ListEmptyComponent={
          !loading && isLoggedIn ? (
            <View style={{ paddingHorizontal: 20, paddingTop: 30 }}>
              <Text style={{ color: '#666' }}>No favorites yet.</Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20
  },
  welcomeText: { fontSize: 14, color: '#666' },
  subHeader: { fontSize: 22, fontWeight: 'bold', color: '#001a2d' },
  notificationBtn: { backgroundColor: '#f0f0f0', padding: 10, borderRadius: 12 },
  listContent: { paddingHorizontal: 20, paddingBottom: 30 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 }
  },
  cardImage: { width: '100%', height: 220, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  typeTag: {
    position: 'absolute',
    top: 15,
    left: 15,
    backgroundColor: '#001a2d',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8
  },
  typeTagText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  favoriteIcon: {
    position: 'absolute',
    top: 15,
    right: 15,
    backgroundColor: '#fff',
    padding: 8,
    borderRadius: 100
  },
  cardDetails: { padding: 15 },
  cardPrice: { fontSize: 20, fontWeight: 'bold', color: '#001a2d' },
  cardTitle: { fontSize: 16, color: '#333', marginVertical: 4 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  locationText: { color: '#666', fontSize: 13 },
  amenitiesRow: { flexDirection: 'row', gap: 20, marginTop: 12 },
  amenity: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  amenityText: { color: '#444', fontSize: 13 },
  loginCta: {
    backgroundColor: '#001a2d',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center'
  },
  loginCtaText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});

export default FavoritesPage;
