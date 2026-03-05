import React, { useCallback, useMemo, useState } from 'react';
import {
  Alert,
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
import { logout } from '../../lib/auth';
import { getSession } from '../../lib/session';

type ApiProfile = {
  email?: string;
  fullName?: string;
  phone?: string | null;
  role?: string;
};

const ProfilePage = () => {
  const router = useRouter();

  const session = getSession();
  const isLoggedIn = Boolean(session?.tokens?.accessToken);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<ApiProfile | null>(null);

  const displayName = useMemo(() => {
    return profile?.fullName ?? session?.user?.fullName ?? '';
  }, [profile?.fullName, session?.user?.fullName]);

  const loadProfile = useCallback(async () => {
    if (!isLoggedIn) {
      setProfile(null);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await apiRequestAuth<ApiProfile>({
        path: '/api/users/profile'
      });
      setProfile(data ?? null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, [isLoggedIn]);

  useFocusEffect(
    useCallback(() => {
      void loadProfile();
    }, [loadProfile])
  );

  const handleLogout = useCallback(async () => {
    const refreshToken = session?.tokens?.refreshToken;
    if (!refreshToken) {
      Alert.alert('Logout', 'Missing refresh token.');
      return;
    }

    try {
      await logout(refreshToken);
      router.replace('/login');
    } catch (e) {
      Alert.alert('Logout failed', e instanceof Error ? e.message : 'Failed to logout');
    }
  }, [router, session?.tokens?.refreshToken]);

  if (!isLoggedIn) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
        </View>
        <View style={styles.center}>
          <Text style={styles.muted}>Log in to view your profile.</Text>
          <TouchableOpacity style={styles.primaryBtn} onPress={() => router.replace('/login')}>
            <Text style={styles.primaryBtnText}>Go to Login</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
        <TouchableOpacity style={styles.refreshBtn} onPress={() => void loadProfile()} disabled={loading}>
          <Ionicons name="refresh" size={20} color="#001a2d" />
        </TouchableOpacity>
      </View>

      {loading || error ? (
        <View style={styles.statusArea}>
          {loading ? <Text style={styles.muted}>Loading...</Text> : null}
          {error ? <Text style={styles.error}>{error}</Text> : null}
        </View>
      ) : null}

      <View style={styles.card}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={28} color="#fff" />
        </View>

        <Text style={styles.name}>{displayName || 'User'}</Text>
        <Text style={styles.sub}>{profile?.email ?? ''}</Text>

        <View style={styles.row}>
          <Text style={styles.label}>Role</Text>
          <Text style={styles.value}>{profile?.role ?? session?.user?.role ?? ''}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Phone</Text>
          <Text style={styles.value}>{profile?.phone ?? session?.user?.phone ?? ''}</Text>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.dangerBtn} onPress={() => void handleLogout()}>
          <Ionicons name="log-out-outline" size={18} color="#fff" />
          <Text style={styles.dangerBtnText}>Logout</Text>
        </TouchableOpacity>
      </View>
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
  refreshBtn: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 12
  },
  statusArea: { paddingHorizontal: 20, paddingBottom: 8 },
  muted: { color: '#666' },
  error: { color: '#b91c1c' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20, gap: 12 },
  primaryBtn: {
    backgroundColor: '#001a2d',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 12
  },
  primaryBtnText: { color: '#fff', fontWeight: 'bold' },
  card: {
    marginHorizontal: 20,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 16
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#001a2d',
    alignItems: 'center',
    justifyContent: 'center'
  },
  name: { marginTop: 12, fontSize: 18, fontWeight: 'bold', color: '#001a2d' },
  sub: { marginTop: 4, color: '#666' },
  row: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  label: { color: '#666' },
  value: { color: '#001a2d', fontWeight: '600' },
  actions: { padding: 20 },
  dangerBtn: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#b91c1c',
    paddingVertical: 14,
    borderRadius: 12
  },
  dangerBtnText: { color: '#fff', fontWeight: 'bold' }
});

export default ProfilePage;
