import React, { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';

import { apiRequestAuth } from '../../lib/apiAuth';
import { getSession } from '../../lib/session';

type ApiNotification = {
  id: number;
  message: string;
  propertyId: number | null;
  messageId: number | null;
  isRead: boolean;
  createdAt: string;
};

const formatDateTime = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
};

const NotificationsPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<ApiNotification[]>([]);

  const session = getSession();
  const isLoggedIn = Boolean(session?.tokens?.accessToken);

  const unreadCount = useMemo(
    () => notifications.reduce((count, n) => (n.isRead ? count : count + 1), 0),
    [notifications]
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
        path: '/api/notifications'
      });
      setNotifications(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, [isLoggedIn]);

  const markRead = useCallback(async (id: number) => {
    if (!isLoggedIn) return;

    const prev = notifications;
    setNotifications((items) => items.map((n) => (n.id === id ? { ...n, isRead: true } : n)));

    try {
      await apiRequestAuth({
        method: 'PUT',
        path: `/api/notifications/${id}/read`
      });
    } catch (e) {
      setNotifications(prev);
      Alert.alert('Error', e instanceof Error ? e.message : 'Failed to mark as read');
    }
  }, [isLoggedIn, notifications]);

  const openNotification = useCallback(async (n: ApiNotification) => {
    if (!isLoggedIn) return;

    if (!n.isRead) {
      await markRead(n.id);
    }

    if (n.propertyId) {
      router.push({ pathname: '/tabs/messages', params: { propertyId: String(n.propertyId) } });
      return;
    }

    Alert.alert('Notification', n.message);
  }, [isLoggedIn, markRead, router]);

  const deleteItem = useCallback(async (id: number) => {
    if (!isLoggedIn) return;

    const prev = notifications;
    setNotifications((items) => items.filter((n) => n.id !== id));

    try {
      await apiRequestAuth({
        method: 'DELETE',
        path: `/api/notifications/${id}`
      });
    } catch (e) {
      setNotifications(prev);
      Alert.alert('Error', e instanceof Error ? e.message : 'Failed to delete notification');
    }
  }, [isLoggedIn, notifications]);

  useFocusEffect(
    useCallback(() => {
      void loadNotifications();
    }, [loadNotifications])
  );

  if (!isLoggedIn) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.header}>
          <Text style={styles.title}>Notifications</Text>
        </View>
        <View style={styles.center}>
          <Text style={styles.muted}>Log in to view notifications.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Notifications</Text>
          <Text style={styles.subtitle}>{unreadCount ? `${unreadCount} unread` : 'All caught up'}</Text>
        </View>

        <TouchableOpacity style={styles.refreshBtn} onPress={() => void loadNotifications()} disabled={loading}>
          <Ionicons name="refresh" size={20} color="#001a2d" />
        </TouchableOpacity>
      </View>

      {loading || error ? (
        <View style={styles.statusArea}>
          {loading ? <Text style={styles.muted}>Loading...</Text> : null}
          {error ? <Text style={styles.error}>{error}</Text> : null}
        </View>
      ) : null}

      <FlatList
        data={notifications}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={notifications.length ? styles.listContent : styles.emptyContent}
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => void openNotification(item)}
            style={[styles.card, item.isRead ? styles.cardRead : styles.cardUnread]}
          >
            <View style={styles.cardTopRow}>
              <Ionicons
                name={item.isRead ? 'notifications-outline' : 'notifications'}
                size={18}
                color={item.isRead ? '#666' : '#001a2d'}
              />
              <Text style={styles.time}>{formatDateTime(item.createdAt)}</Text>
            </View>

            <Text style={styles.message}>{item.message}</Text>

            <View style={styles.actionsRow}>
              <TouchableOpacity
                style={[styles.actionBtn, item.isRead ? styles.actionBtnDisabled : null]}
                onPress={() => void markRead(item.id)}
                disabled={item.isRead}
              >
                <Ionicons name="checkmark-done" size={16} color={item.isRead ? '#999' : '#001a2d'} />
                <Text style={[styles.actionText, item.isRead ? styles.actionTextDisabled : null]}>Read</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionBtn} onPress={() => void deleteItem(item.id)}>
                <Ionicons name="trash-outline" size={16} color="#b91c1c" />
                <Text style={[styles.actionText, { color: '#b91c1c' }]}>Delete</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={styles.muted}>No notifications yet.</Text>
          </View>
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
  title: { fontSize: 20, fontWeight: 'bold', color: '#001a2d' },
  subtitle: { marginTop: 4, fontSize: 12, color: '#666' },
  refreshBtn: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 12
  },
  statusArea: { paddingHorizontal: 20, paddingBottom: 8 },
  muted: { color: '#666' },
  error: { color: '#b91c1c' },
  listContent: { paddingHorizontal: 20, paddingBottom: 20 },
  emptyContent: { flexGrow: 1, paddingHorizontal: 20, paddingBottom: 20 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  card: {
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1
  },
  cardUnread: { backgroundColor: '#f8fafc', borderColor: '#cbd5e1' },
  cardRead: { backgroundColor: '#fff', borderColor: '#e5e7eb' },
  cardTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  time: { fontSize: 11, color: '#666' },
  message: { marginTop: 10, fontSize: 14, color: '#001a2d' },
  actionsRow: { flexDirection: 'row', gap: 12, marginTop: 12 },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#f3f4f6',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10
  },
  actionBtnDisabled: { opacity: 0.6 },
  actionText: { fontSize: 12, color: '#001a2d' },
  actionTextDisabled: { color: '#999' }
});

export default NotificationsPage;
