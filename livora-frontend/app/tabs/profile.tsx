import React, { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  ScrollView
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';

import { apiRequestAuth } from '../../lib/apiAuth';
import { getSession } from '../../lib/session';
import TopNavBar, { TOP_NAVBAR_BASE_HEIGHT } from '../../components/TopNavBar';

type ApiProfile = {
  email?: string;
  fullName?: string;
  phone?: string | null;
  role?: string;
};

const ProfilePage = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const session = getSession();
  const isLoggedIn = Boolean(session?.tokens?.accessToken);
  const headerTotalHeight = insets.top + TOP_NAVBAR_BASE_HEIGHT;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<ApiProfile | null>(null);

  const displayName = useMemo(() => {
    return profile?.fullName ?? session?.user?.fullName ?? 'User';
  }, [profile?.fullName, session?.user?.fullName]);

  const displayEmail = profile?.email ?? session?.user?.email ?? 'Not set';

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

  return (
    <SafeAreaView style={[styles.container, { paddingTop: headerTotalHeight }]}>
      <StatusBar barStyle="dark-content" />
      <TopNavBar />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* --- Unified Header --- */}
        <View style={styles.headerSection}>
          <View>
            <Text style={styles.headerTitle}>Profile</Text>
            <View style={styles.titleUnderline} />
          </View>
          {isLoggedIn && (
            <TouchableOpacity 
              style={styles.refreshIconBtn} 
              onPress={() => void loadProfile()} 
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#001a2d" />
              ) : (
                <Ionicons name="refresh" size={20} color="#001a2d" />
              )}
            </TouchableOpacity>
          )}
        </View>

        {!isLoggedIn ? (
          <View style={styles.centeredContent}>
            <MaterialCommunityIcons name="account-circle-outline" size={80} color="#eee" />
            <Text style={styles.emptyText}>Log in to manage your account and view your property history.</Text>
            <TouchableOpacity 
              style={styles.loginCta} 
              onPress={() => router.replace('/login')}
            >
              <Text style={styles.loginCtaText}>Go to Login</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.profileBody}>
            {/* --- Avatar & Bio Section --- */}
            <View style={styles.avatarContainer}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarInitial}>
                  {displayName.charAt(0).toUpperCase()}
                </Text>
                <View style={styles.editBadge}>
                  <Ionicons name="camera" size={12} color="#fff" />
                </View>
              </View>
              <Text style={styles.nameText}>{displayName}</Text>
              <Text style={styles.emailText}>{displayEmail}</Text>
            </View>

            {/* --- Information Sections --- */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>ACCOUNT DETAILS</Text>
              <View style={styles.infoCard}>
                <InfoRow 
                  icon="shield-check-outline" 
                  label="Role" 
                  value={profile?.role ?? session?.user?.role ?? 'Member'} 
                />
                <View style={styles.divider} />
                <InfoRow 
                  icon="phone-outline" 
                  label="Phone" 
                  value={profile?.phone ?? session?.user?.phone ?? 'Not set'} 
                />
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionLabel}>PREFERENCES</Text>
              <View style={styles.infoCard}>
                <TouchableOpacity style={styles.menuItem}>
                  <View style={styles.menuInner}>
                    <Ionicons name="notifications-outline" size={20} color="#001a2d" />
                    <Text style={styles.menuText}>Push Notifications</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#94a3b8" />
                </TouchableOpacity>
                <View style={styles.divider} />
                <TouchableOpacity style={styles.menuItem} onPress={() => Alert.alert("Logout", "Are you sure?")}>
                  <View style={styles.menuInner}>
                    <Ionicons name="log-out-outline" size={20} color="#001a2d" />
                    <Text style={[styles.menuText, { color: '#001a2d' }]}>Sign Out</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

// --- Sub-component for clean rows ---
const InfoRow = ({ icon, label, value }: { icon: any, label: string, value: string }) => (
  <View style={styles.infoRow}>
    <View style={styles.infoLeft}>
      <MaterialCommunityIcons name={icon} size={20} color="#94a3b8" />
      <Text style={styles.infoLabel}>{label}</Text>
    </View>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  
  // Header Section
  headerSection: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: { fontSize: 28, fontWeight: '800', color: '#001a2d', letterSpacing: -0.5 },
  titleUnderline: { height: 4, width: 30, backgroundColor: '#001a2d', marginTop: 4, borderRadius: 2 },
  refreshIconBtn: { padding: 10, backgroundColor: '#f8fafc', borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0' },

  // Avatar Section
  profileBody: { paddingHorizontal: 20 },
  avatarContainer: { alignItems: 'center', marginVertical: 30 },
  avatarCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#001a2d',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 10 },
    elevation: 5,
  },
  avatarInitial: { color: '#fff', fontSize: 36, fontWeight: '800' },
  editBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: '#001a2d',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  nameText: { fontSize: 22, fontWeight: '800', color: '#001a2d', marginTop: 15 },
  emailText: { fontSize: 14, color: '#94a3b8', marginTop: 4, fontWeight: '500' },

  // List Styling
  section: { marginBottom: 25 },
  sectionLabel: { fontSize: 11, fontWeight: '800', color: '#94a3b8', marginBottom: 12, letterSpacing: 1 },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOpacity: 0.02,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 16, alignItems: 'center' },
  infoLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  infoLabel: { fontSize: 14, color: '#64748b', fontWeight: '500' },
  infoValue: { fontSize: 14, color: '#001a2d', fontWeight: '700' },
  divider: { height: 1, backgroundColor: '#f1f5f9' },

  // Menu Items
  menuItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 16, alignItems: 'center' },
  menuInner: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  menuText: { fontSize: 15, color: '#001a2d', fontWeight: '600' },

  // Empty State / Login
  centeredContent: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 80, paddingHorizontal: 40 },
  emptyText: { color: '#94a3b8', fontSize: 15, marginTop: 16, textAlign: 'center', lineHeight: 22, fontWeight: '500' },
  loginCta: { backgroundColor: "#001a2d", paddingHorizontal: 30, paddingVertical: 14, borderRadius: 12, marginTop: 20 },
  loginCtaText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});

export default ProfilePage;