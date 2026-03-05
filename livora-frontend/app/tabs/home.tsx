import React, { useEffect, useMemo, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  SafeAreaView,
  StatusBar,
  Alert,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";

import { apiRequest } from "../../lib/api";
import { logout } from "../../lib/auth";
import { getSession } from "../../lib/session";
import { apiRequestAuth } from "../../lib/apiAuth";

// Constants for layout
const STATUS_BAR_HEIGHT = StatusBar.currentHeight ?? 0;

interface Property {
  id: number;
  title: string;
  location: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  imageUrl: string;
  type: "Rent" | "Sale";
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
  property: {
    id: number;
  };
};

const toPropertyType = (value: unknown): Property["type"] => {
  if (value === "Rent") return "Rent";
  if (value === "Sale") return "Sale";
  return "Sale";
};

const mapApiPropertyToUi = (p: ApiProperty): Property => {
  const firstImageUrl = p.images?.[0]?.imageUrl;

  return {
    id: p.id,
    title: p.title,
    location: p.location ?? "",
    price: typeof p.price === "string" ? Number(p.price) : p.price,
    bedrooms: p.bedrooms ?? 0,
    bathrooms: p.bathrooms ?? 0,
    imageUrl: firstImageUrl ?? p.image_url ?? "",
    type: toPropertyType(p.propertyType),
  };
};

interface PropertyCardProps {
  item: Property;
  isFavorite: boolean;
  onToggleFavorite: (propertyId: number, isFavorite: boolean) => void;
  onMessage: (propertyId: number) => void;
}

const PropertyCard: React.FC<PropertyCardProps> = ({
  item,
  isFavorite,
  onToggleFavorite,
  onMessage,
}) => (
  <TouchableOpacity style={styles.card}>
    <Image source={{ uri: item.imageUrl }} style={styles.cardImage} />
    <View style={styles.typeTag}>
      <Text style={styles.typeTagText}>{item.type}</Text>
    </View>
    <TouchableOpacity
      style={styles.favoriteIcon}
      onPress={() => onToggleFavorite(item.id, isFavorite)}
    >
      <Ionicons
        name={isFavorite ? "heart" : "heart-outline"}
        size={24}
        color={isFavorite ? "#e11d48" : "#001a2d"}
      />
    </TouchableOpacity>
    <TouchableOpacity
      style={styles.messageIcon}
      onPress={() => onMessage(item.id)}
    >
      <Ionicons name="chatbubble-ellipses-outline" size={22} color="#001a2d" />
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

const HomePage = () => {
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fullName, setFullName] = useState<string>("");
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set());

  const goToMessages = (propertyId: number) => {
    router.push({
      pathname: "/tabs/messages",
      params: { propertyId: String(propertyId) },
    });
  };

  const goToNotifications = () => router.push("/tabs/notifications");
  const goToProfile = () => router.push("/tabs/profile");
  const goToSettings = () => router.push("/tabs/settings");

  const handleLogout = async () => {
    const session = getSession();
    const refreshToken = session?.tokens?.refreshToken;
    if (!refreshToken) {
      Alert.alert("Logout", "You are not logged in.");
      return;
    }

    try {
      await logout(refreshToken);
      router.replace("/login");
    } catch (e) {
      Alert.alert(
        "Logout failed",
        e instanceof Error ? e.message : "Failed to logout"
      );
    }
  };

  const sortedProperties = useMemo(() => {
    const decorated = properties.map((p, index) => ({ p, index }));
    decorated.sort((a, b) => {
      const aFav = favoriteIds.has(a.p.id) ? 1 : 0;
      const bFav = favoriteIds.has(b.p.id) ? 1 : 0;
      if (aFav !== bFav) return bFav - aFav;
      return a.index - b.index;
    });
    return decorated.map((x) => x.p);
  }, [properties, favoriteIds]);

  const setFavoriteId = (propertyId: number, nextIsFavorite: boolean) => {
    setFavoriteIds((prev) => {
      const next = new Set(prev);
      if (nextIsFavorite) next.add(propertyId);
      else next.delete(propertyId);
      return next;
    });
  };

  const toggleFavorite = async (propertyId: number, isFavorite: boolean) => {
    const session = getSession();
    if (!session?.tokens?.accessToken) {
      Alert.alert("Login required", "Please log in to manage favorites.");
      return;
    }

    const nextIsFavorite = !isFavorite;
    setFavoriteId(propertyId, nextIsFavorite);

    try {
      if (nextIsFavorite) {
        await apiRequestAuth({
          method: "POST",
          path: "/api/favorites/" + propertyId,
        });
      } else {
        await apiRequestAuth({
          method: "DELETE",
          path: "/api/favorites/" + propertyId,
        });
      }
    } catch (e) {
      setFavoriteId(propertyId, isFavorite);
      Alert.alert(
        "Favorites",
        e instanceof Error ? e.message : "Failed to update favorites"
      );
    }
  };

  const refreshFavorites = async () => {
    const session = getSession();
    if (!session?.tokens?.accessToken) {
      setFavoriteIds(new Set());
      return;
    }

    try {
      const favorites = await apiRequestAuth<ApiFavorite[]>({
        path: "/api/favorites",
      });
      setFavoriteIds(new Set(favorites.map((f) => f.property.id)));
    } catch {
      // ignore refresh errors
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      void refreshFavorites();
    }, [])
  );

  useEffect(() => {
    let cancelled = false;
    const session = getSession();
    setFullName(session?.user.fullName ?? "");

    (async () => {
      setLoading(true);
      setError(null);

      try {
        const [apiProperties, favorites] = await Promise.all([
          apiRequest<ApiProperty[]>({ path: "/api/properties" }),
          (async () => {
            if (!session?.tokens?.accessToken) return [] as ApiFavorite[];
            return apiRequestAuth<ApiFavorite[]>({ path: "/api/favorites" });
          })(),
        ]);

        if (cancelled) return;
        setProperties(apiProperties.map(mapApiPropertyToUi));
        setFavoriteIds(new Set(favorites.map((f) => f.property.id)));
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "Failed to load properties");
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

      {/* Top Navbar Section: Aligned to Right */}
      <View style={styles.topNavbar}>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.iconBtn} onPress={goToNotifications}>
            <Ionicons name="notifications-outline" size={22} color="#001a2d" />
            <View style={styles.notifBadge} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} onPress={goToProfile}>
            <Ionicons name="person-circle-outline" size={24} color="#001a2d" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} onPress={goToSettings}>
            <Ionicons name="settings-outline" size={22} color="#001a2d" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={22} color="#001a2d" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Welcome Message Section: Sits below Navbar */}
      <View style={styles.welcomeBox}>
        <Text style={styles.welcomeMessageText}>
          Holla{fullName ? `, ${fullName}` : " Vibe Settler 😎"}
        </Text>
        <Text style={styles.welcomeSubText}>Find your dream home</Text>
      </View>

      {/* Search & Filter */}
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

      {/* Property List */}
      <FlatList
        data={sortedProperties}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <PropertyCard
            item={item}
            isFavorite={favoriteIds.has(item.id)}
            onToggleFavorite={toggleFavorite}
            onMessage={goToMessages}
          />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          loading || error ? (
            <View style={{ paddingBottom: 10 }}>
              {loading ? <Text style={{ color: "#666" }}>Loading...</Text> : null}
              {error ? <Text style={{ color: "red" }}>{error}</Text> : null}
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 8,
  },
  topNavbar: {
    flexDirection: "row",
    justifyContent: "flex-end", // Align icons to the right
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconBtn: {
    backgroundColor: "#f0f0f0",
    padding: 10,
    borderRadius: 12,
  },
  notifBadge: {
    position: "absolute",
    right: 10,
    top: 10,
    width: 8,
    height: 8,
    backgroundColor: "red",
    borderRadius: 4,
  },
  welcomeBox: {
    backgroundColor: "#e0ebfc",
    boxShadow: "0 4px 6px #001a2d",
    padding: 20,
    borderRadius: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    gap: 4,
  },
  welcomeMessageText: {
    fontSize: 16,
    color: "#001a2d",
    fontWeight: "500",
  },
  welcomeSubText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#001a2d",
  },
  searchSection: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    paddingHorizontal: 15,
  },
  searchInput: {
    flex: 1,
    height: 50,
    marginLeft: 10,
  },
  filterBtn: {
    backgroundColor: "#001a2d",
    padding: 12,
    borderRadius: 12,
    justifyContent: "center",
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    marginBottom: 20,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
  },
  cardImage: {
    width: "100%",
    height: 220,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  typeTag: {
    position: "absolute",
    top: 15,
    left: 15,
    backgroundColor: "#001a2d",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  typeTagText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  favoriteIcon: {
    position: "absolute",
    top: 15,
    right: 15,
    backgroundColor: "#fff",
    padding: 8,
    borderRadius: 100,
  },
  messageIcon: {
    position: "absolute",
    top: 15,
    right: 58,
    backgroundColor: "#fff",
    padding: 8,
    borderRadius: 100,
  },
  cardDetails: {
    padding: 15,
  },
  cardPrice: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#001a2d",
  },
  cardTitle: {
    fontSize: 16,
    color: "#333",
    marginVertical: 4,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  locationText: {
    color: "#666",
    fontSize: 13,
  },
  amenitiesRow: {
    flexDirection: "row",
    gap: 20,
    marginTop: 12,
  },
  amenity: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  amenityText: {
    color: "#444",
    fontSize: 13,
  }
});

export default HomePage;