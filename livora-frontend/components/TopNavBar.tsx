import React, { useCallback } from 'react';
import { Alert, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { logout } from '../lib/auth';
import { getSession } from '../lib/session';
import { useTheme } from '../lib/theme';

export const TOP_NAVBAR_BASE_HEIGHT = 64;

export type TopNavBarProps = {
  showBadge?: boolean;
};

const TopNavBar = ({ showBadge = true }: TopNavBarProps) => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  const goToNotifications = useCallback(() => router.push('/tabs/notifications'), [router]);
  const goToProfile = useCallback(() => router.push('/tabs/profile'), [router]);
  const goToSettings = useCallback(() => router.push('/tabs/settings'), [router]);

  const handleLogout = useCallback(async () => {
    const session = getSession();
    const refreshToken = session?.tokens?.refreshToken;
    if (!refreshToken) {
      Alert.alert('Logout', 'You are not logged in.');
      return;
    }

    try {
      await logout(refreshToken);
      router.replace('/login');
    } catch (e) {
      Alert.alert('Logout failed', e instanceof Error ? e.message : 'Failed to logout');
    }
  }, [router]);

  return (
    <View
      style={[
        styles.topNavbar,
        {
          paddingTop: insets.top + 12,
          height: insets.top + TOP_NAVBAR_BASE_HEIGHT,
          backgroundColor: colors.surface
        }
      ]}
    >
      <View style={styles.headerActions}>
        <TouchableOpacity
          style={[styles.iconBtn, { backgroundColor: colors.surfaceMuted }]}
          onPress={goToNotifications}
        >
          <Ionicons name="notifications-outline" size={22} color={colors.text} />
          {showBadge ? <View style={styles.notifBadge} /> : null}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.iconBtn, { backgroundColor: colors.surfaceMuted }]}
          onPress={goToProfile}
        >
          <Ionicons name="person-circle-outline" size={24} color={colors.text} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.iconBtn, { backgroundColor: colors.surfaceMuted }]}
          onPress={goToSettings}
        >
          <Ionicons name="settings-outline" size={22} color={colors.text} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.iconBtn, { backgroundColor: colors.surfaceMuted }]}
          onPress={() => void handleLogout()}
        >
          <Ionicons name="log-out-outline" size={22} color={colors.text} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  topNavbar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    elevation: 10,
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 12
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  iconBtn: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 12
  },
  notifBadge: {
    position: 'absolute',
    right: 10,
    top: 10,
    width: 8,
    height: 8,
    backgroundColor: 'red',
    borderRadius: 4
  }
});

export default TopNavBar;
