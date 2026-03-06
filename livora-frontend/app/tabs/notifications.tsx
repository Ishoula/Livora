import React, { useCallback, useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";

import { apiRequestAuth } from "../../lib/apiAuth";
import { getSession } from "../../lib/session";
import TopNavBar, { TOP_NAVBAR_BASE_HEIGHT } from "../../components/TopNavBar";

// --- Types ---
type ApiNotification = {
  id: number;
  message: string;
  propertyId: number | null;
  messageId: number | null;
  isRead: boolean;
  createdAt: string;
};

// --- Helpers ---
const formatDateTime = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const NotificationsPage = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<ApiNotification[]>([]);

  const session = getSession();
  const isLoggedIn = Boolean(session?.tokens?.accessToken);
  const headerTotalHeight = insets.top + TOP_NAVBAR_BASE_HEIGHT;

  const unreadCount = useMemo(
    () => notifications.reduce((count, n) => (n.isRead ? count : count + 1), 0),
    [notifications],
  );

  const loadNotifications = useCallback(async () => {
    if (!isLoggedIn) {
      setNotifications([]);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await apiRequestAuth<ApiNotification[]>({
        path: "/api/notifications",
      });
      setNotifications(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  }, [isLoggedIn]);

  const markRead = useCallback(
    async (id: number) => {
      if (!isLoggedIn) return;

      const prev = notifications;
      setNotifications((items) =>
        items.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
      );

      try {
        await apiRequestAuth({
          method: "PUT",
          path: `/api/notifications/${id}/read`,
        });
      } catch (e) {
        setNotifications(prev);
        Alert.alert(
          "Error",
          e instanceof Error ? e.message : "Failed to mark as read",
        );
      }
    },
    [isLoggedIn, notifications],
  );

  const openNotification = useCallback(
    async (n: ApiNotification) => {
      if (!isLoggedIn) return;

      if (!n.isRead) {
        await markRead(n.id);
      }

      if (n.propertyId) {
        router.push({
          pathname: "/tabs/messages",
          params: { propertyId: String(n.propertyId) },
        });
        return;
      }

      Alert.alert("Notification", n.message);
    },
    [isLoggedIn, markRead, router],
  );

  const deleteItem = useCallback(
    async (id: number) => {
      if (!isLoggedIn) return;

      const prev = notifications;
      setNotifications((items) => items.filter((n) => n.id !== id));

      try {
        await apiRequestAuth({
          method: "DELETE",
          path: `/api/notifications/${id}`,
        });
      } catch (e) {
        setNotifications(prev);
        Alert.alert(
          "Error",
          e instanceof Error ? e.message : "Failed to delete",
        );
      }
    },
    [isLoggedIn, notifications],
  );

  useFocusEffect(
    useCallback(() => {
      void loadNotifications();
    }, [loadNotifications]),
  );

  return (
    <SafeAreaView style={[styles.container, { paddingTop: headerTotalHeight }]}>
      <StatusBar barStyle="dark-content" />
      <TopNavBar />

      {/* --- Unified Header --- */}
      <View style={styles.headerSection}>
        <View>
          <Text style={styles.headerTitle}>Notifications</Text>
          <View style={styles.titleUnderline} />
        </View>
        <TouchableOpacity
          style={styles.refreshIconBtn}
          onPress={() => void loadNotifications()}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#001a2d" />
          ) : (
            <Ionicons name="refresh" size={20} color="#001a2d" />
          )}
        </TouchableOpacity>
      </View>

      {!isLoggedIn ? (
        <View style={styles.centeredContent}>
          <MaterialCommunityIcons
            name="bell-off-outline"
            size={64}
            color="#ccc"
          />
          <Text style={styles.emptyText}>Log in to view notifications.</Text>
          <TouchableOpacity
            style={styles.loginCta}
            onPress={() => router.push("/(auth)/login")}
          >
            <Text style={styles.loginCtaText}>Go to Login</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            unreadCount > 0 ? (
              <View style={styles.unreadBanner}>
                <Text style={styles.unreadBannerText}>
                  You have {unreadCount} unread alerts
                </Text>
              </View>
            ) : null
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => void openNotification(item)}
              style={[
                styles.notificationCard,
                !item.isRead && styles.cardUnread,
              ]}
            >
              <View style={styles.cardHeader}>
                <View style={styles.iconContainer}>
                  <View
                    style={[
                      styles.iconCircle,
                      { backgroundColor: item.isRead ? "#f1f5f9" : "#001a2d" },
                    ]}
                  >
                    <Ionicons
                      name={
                        item.propertyId
                          ? "chatbubble-ellipses"
                          : "notifications"
                      }
                      size={16}
                      color={item.isRead ? "#94a3b8" : "#fff"}
                    />
                  </View>
                  {!item.isRead && <View style={styles.unreadDot} />}
                </View>
                <Text style={styles.timeText}>
                  {formatDateTime(item.createdAt)}
                </Text>
              </View>

              <Text
                style={[
                  styles.messageText,
                  !item.isRead && styles.messageUnread,
                ]}
              >
                {item.message}
              </Text>

              <View style={styles.cardFooter}>
                <TouchableOpacity
                  style={styles.footerAction}
                  onPress={() => void deleteItem(item.id)}
                >
                  <Ionicons name="trash-outline" size={14} color="#e11d48" />
                  <Text style={styles.deleteText}>Remove</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            !loading ? (
              <View style={styles.centeredContent}>
                <Ionicons name="notifications-outline" size={64} color="#eee" />
                <Text style={styles.emptyText}>No notifications yet.</Text>
              </View>
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
};

// --- Modern Real Estate Styles ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },

  // Header Section
  headerSection: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#001a2d",
    letterSpacing: -0.5,
  },
  titleUnderline: {
    height: 4,
    width: 30,
    backgroundColor: "#001a2d",
    letterSpacing: -0.5,
  },
  refreshIconBtn: {
    padding: 10,
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },

  // Banner
  unreadBanner: {
    backgroundColor: "rgba(225, 29, 72, 0.05)",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(225, 29, 72, 0.1)",
  },
  unreadBannerText: {
    color: "#e11d48",
    fontSize: 13,
    fontWeight: "700",
    textAlign: "center",
  },

  // Notification Cards
  listContent: { paddingHorizontal: 20, paddingBottom: 40 },
  notificationCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#f1f5f9",
    shadowColor: "#000",
    shadowOpacity: 0.02,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  cardUnread: {
    borderColor: "#e2e8f0",
    backgroundColor: "#f8fafc",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  iconContainer: { flexDirection: "row", alignItems: "center" },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#e11d48",
    position: "absolute",
    top: -2,
    right: -2,
    borderWidth: 2,
    borderColor: "#fff",
  },
  timeText: { fontSize: 11, color: "#94a3b8", fontWeight: "600" },
  messageText: {
    fontSize: 14,
    color: "#475569",
    lineHeight: 20,
  },
  messageUnread: {
    color: "#001a2d",
    fontWeight: "600",
  },

  // Card Footer
  cardFooter: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  footerAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  deleteText: {
    fontSize: 12,
    color: "#e11d48",
    fontWeight: "600",
  },

  // Utilities & Empty States
  centeredContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 80,
    paddingHorizontal: 40,
  },
  emptyText: {
    color: "#94a3b8",
    fontSize: 16,
    marginTop: 16,
    fontWeight: "500",
    textAlign: "center",
  },
  loginCta: {
    backgroundColor: "#001a2d",
    paddingHorizontal: 30,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 20,
  },
  loginCtaText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});

export default NotificationsPage;
