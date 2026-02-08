import React, { useEffect, useState } from 'react';
import { 
  StyleSheet, View, Text, TextInput, TouchableOpacity, 
  FlatList, Image, SafeAreaView, StatusBar 
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { apiRequest } from '../../lib/api';

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

interface PropertyCardProps {
  item: Property;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ item }) => (
  <TouchableOpacity style={styles.card}>
    <Image source={{ uri: item.imageUrl }} style={styles.cardImage} />
    <View style={styles.typeTag}>
      <Text style={styles.typeTagText}>{item.type}</Text>
    </View>
    <TouchableOpacity style={styles.favoriteIcon}>
      <Ionicons name="heart-outline" size={24} color="#001a2d" />
    </TouchableOpacity>
    
    <View style={styles.cardDetails}>
      <Text style={styles.cardPrice}>${item.price.toLocaleString()}</Text>
      <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
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

const HomePage = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(null);

      try {
        const apiProperties = await apiRequest<ApiProperty[]>({
          path: '/api/properties'
        });

        if (cancelled) return;
        setProperties(apiProperties.map(mapApiPropertyToUi));
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : 'Failed to load properties');
      } finally {
        if (cancelled) return;
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header Section */}
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Hello, User</Text>
          <Text style={styles.subHeader}>Find your dream home</Text>
        </View>
        <TouchableOpacity style={styles.notificationBtn}>
          <Ionicons name="notifications-outline" size={24} color="#001a2d" />
          <View style={styles.notifBadge} />
        </TouchableOpacity>
      </View>

      {/* Search & Filter (FR-9, FR-10) */}
      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#999" />
          <TextInput 
            placeholder="Search by keywords..." 
            style={styles.searchInput}
          />
        </View>
        <TouchableOpacity style={styles.filterBtn}>
          <Ionicons name="options-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Property List (FR-8) */}
      <FlatList
        data={properties}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => <PropertyCard item={item} />}
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
      />

      {/* Navigation (Logical structure) */}
      <View style={styles.bottomNav}>
         <Ionicons name="home" size={26} color="#001a2d" />
         <Ionicons name="heart-outline" size={26} color="#888" />
         <Ionicons name="chatbubble-outline" size={26} color="#888" />
         <Ionicons name="person-outline" size={26} color="#888" />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { 
    flexDirection: 'row', justifyContent: 'space-between', 
    alignItems: 'center', padding: 20 
  },
  welcomeText: { fontSize: 14, color: '#666' },
  subHeader: { fontSize: 22, fontWeight: 'bold', color: '#001a2d' },
  notificationBtn: { backgroundColor: '#f0f0f0', padding: 10, borderRadius: 12 },
  notifBadge: { 
    position: 'absolute', right: 10, top: 10, width: 8, height: 8, 
    backgroundColor: 'red', borderRadius: 4 
  },
  searchSection: { 
    flexDirection: 'row', paddingHorizontal: 20, marginBottom: 20, gap: 12 
  },
  searchBar: { 
    flex: 1, flexDirection: 'row', alignItems: 'center', 
    backgroundColor: '#f5f5f5', borderRadius: 12, paddingHorizontal: 15 
  },
  searchInput: { flex: 1, height: 50, marginLeft: 10 },
  filterBtn: { 
    backgroundColor: '#001a2d', padding: 12, borderRadius: 12, justifyContent: 'center' 
  },
  listContent: { paddingHorizontal: 20, paddingBottom: 100 },
  card: { 
    backgroundColor: '#fff', borderRadius: 20, marginBottom: 20, 
    elevation: 4, shadowColor: '#000', shadowOpacity: 0.1, 
    shadowRadius: 10, shadowOffset: { width: 0, height: 5 } 
  },
  cardImage: { width: '100%', height: 220, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  typeTag: { 
    position: 'absolute', top: 15, left: 15, backgroundColor: '#001a2d', 
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 
  },
  typeTagText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  favoriteIcon: { 
    position: 'absolute', top: 15, right: 15, backgroundColor: '#fff', 
    padding: 8, borderRadius: 100 
  },
  cardDetails: { padding: 15 },
  cardPrice: { fontSize: 20, fontWeight: 'bold', color: '#001a2d' },
  cardTitle: { fontSize: 16, color: '#333', marginVertical: 4 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  locationText: { color: '#666', fontSize: 13 },
  amenitiesRow: { flexDirection: 'row', gap: 20, marginTop: 12 },
  amenity: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  amenityText: { color: '#444', fontSize: 13 },
  bottomNav: { 
    position: 'absolute', bottom: 0, width: '100%', height: 70, 
    backgroundColor: '#fff', flexDirection: 'row', justifyContent: 'space-around', 
    alignItems: 'center', borderTopWidth: 1, borderTopColor: '#eee' 
  }
});

export default HomePage;