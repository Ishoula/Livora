import React, { useCallback, useMemo, useState } from 'react';
import { Modal, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import TopNavBar, { TOP_NAVBAR_BASE_HEIGHT } from '../../components/TopNavBar';
import { apiRequestAuth } from '../../lib/apiAuth';
import { clearSession, getSession } from '../../lib/session';
import { useTheme, type ThemeMode } from '../../lib/theme';
import { useRouter } from 'expo-router';

const SettingsPage = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const headerTotalHeight = insets.top + TOP_NAVBAR_BASE_HEIGHT;
  const { colors, mode, setMode } = useTheme();
  const [busy, setBusy] = useState<null | 'reset_favorites' | 'reset_messages' | 'delete_account'>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusTone, setStatusTone] = useState<'ok' | 'error'>('ok');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTitle, setConfirmTitle] = useState('');
  const [confirmMessage, setConfirmMessage] = useState('');
  const [confirmCta, setConfirmCta] = useState('Confirm');
  const [confirmTone, setConfirmTone] = useState<'neutral' | 'danger'>('neutral');
  const [confirmAction, setConfirmAction] = useState<null | (() => Promise<void>)>(null);

  const isLoggedIn = Boolean(getSession()?.tokens?.accessToken);

  const themeOptions = useMemo(
    () =>
      [
        { label: 'System', value: 'system' as ThemeMode },
        { label: 'Light', value: 'light' as ThemeMode },
        { label: 'Dark', value: 'dark' as ThemeMode }
      ],
    []
  );

  const openConfirm = useCallback(
    (options: {
      title: string;
      message: string;
      cta: string;
      tone: 'neutral' | 'danger';
      action: () => Promise<void>;
    }) => {
      setConfirmTitle(options.title);
      setConfirmMessage(options.message);
      setConfirmCta(options.cta);
      setConfirmTone(options.tone);
      setConfirmAction(() => options.action);
      setConfirmOpen(true);
    },
    []
  );

  const handleResetFavorites = useCallback(() => {
    setStatusMessage(null);

    if (!isLoggedIn) {
      setStatusTone('error');
      setStatusMessage('Please log in first.');
      return;
    }

    openConfirm({
      title: 'Reset favorites',
      message: 'This will remove all your saved favorites. Continue?',
      cta: 'Reset',
      tone: 'danger',
      action: async () => {
        setBusy('reset_favorites');
        try {
          await apiRequestAuth({ method: 'DELETE', path: '/api/favorites' });
          setStatusTone('ok');
          setStatusMessage('All favorites removed.');
        } catch (e) {
          setStatusTone('error');
          setStatusMessage(e instanceof Error ? e.message : 'Failed to reset favorites');
        } finally {
          setBusy(null);
        }
      }
    });
  }, [isLoggedIn, openConfirm]);

  const handleResetMessages = useCallback(() => {
    setStatusMessage(null);

    if (!isLoggedIn) {
      setStatusTone('error');
      setStatusMessage('Please log in first.');
      return;
    }

    openConfirm({
      title: 'Reset messages',
      message: 'This will delete all your messages. Continue?',
      cta: 'Reset',
      tone: 'danger',
      action: async () => {
        setBusy('reset_messages');
        try {
          await apiRequestAuth({ method: 'DELETE', path: '/api/messages' });
          setStatusTone('ok');
          setStatusMessage('All messages removed.');
        } catch (e) {
          setStatusTone('error');
          setStatusMessage(e instanceof Error ? e.message : 'Failed to reset messages');
        } finally {
          setBusy(null);
        }
      }
    });
  }, [isLoggedIn, openConfirm]);

  const handleDeleteAccount = useCallback(() => {
    setStatusMessage(null);

    if (!isLoggedIn) {
      setStatusTone('error');
      setStatusMessage('Please log in first.');
      return;
    }

    openConfirm({
      title: 'Delete account',
      message:
        'This will permanently delete your account and all your data. This cannot be undone. Continue?',
      cta: 'Delete',
      tone: 'danger',
      action: async () => {
        setBusy('delete_account');
        try {
          await apiRequestAuth({ method: 'DELETE', path: '/api/users/me' });
          clearSession();
          router.replace('/login');
        } catch (e) {
          setStatusTone('error');
          setStatusMessage(e instanceof Error ? e.message : 'Failed to delete account');
        } finally {
          setBusy(null);
        }
      }
    });
  }, [isLoggedIn, openConfirm, router]);

  const closeConfirm = useCallback(() => {
    if (busy) return;
    setConfirmOpen(false);
    setConfirmAction(null);
  }, [busy]);

  const runConfirm = useCallback(() => {
    if (!confirmAction) {
      setConfirmOpen(false);
      return;
    }

    setConfirmOpen(false);
    void confirmAction();
    setConfirmAction(null);
  }, [confirmAction]);

  return (
    <SafeAreaView
      style={[styles.container, { paddingTop: headerTotalHeight, backgroundColor: colors.background }]}
    >
      <StatusBar barStyle={colors.background === '#fff' ? 'dark-content' : 'light-content'} />
      <TopNavBar />
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Settings</Text>
      </View>

      <View style={styles.content}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Theme</Text>
        <View style={styles.rowWrap}>
          {themeOptions.map((opt) => {
            const selected = mode === opt.value;
            return (
              <TouchableOpacity
                key={opt.value}
                style={[
                  styles.chip,
                  { backgroundColor: selected ? colors.primary : colors.surfaceMuted }
                ]}
                onPress={() => setMode(opt.value)}
              >
                <Text style={[styles.chipText, { color: selected ? '#fff' : colors.text }]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 24 }]}>Account</Text>

        <TouchableOpacity
          style={[styles.dangerBtn, { backgroundColor: colors.surfaceMuted }]}
          onPress={handleResetFavorites}
          disabled={busy !== null}
        >
          <Text style={[styles.dangerBtnText, { color: colors.text }]}>Reset favorites</Text>
          <Text style={[styles.dangerSub, { color: colors.textMuted }]}>Deletes all saved favorites</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.dangerBtn, { backgroundColor: colors.surfaceMuted }]}
          onPress={handleResetMessages}
          disabled={busy !== null}
        >
          <Text style={[styles.dangerBtnText, { color: colors.text }]}>Reset messages</Text>
          <Text style={[styles.dangerSub, { color: colors.textMuted }]}>Deletes all messages</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.dangerBtn, { backgroundColor: colors.danger }]}
          onPress={handleDeleteAccount}
          disabled={busy !== null}
        >
          <Text style={[styles.dangerBtnText, { color: '#fff' }]}>Delete account</Text>
          <Text style={[styles.dangerSub, { color: '#fee2e2' }]}>Permanent and cannot be undone</Text>
        </TouchableOpacity>

        {!isLoggedIn ? (
          <Text style={[styles.muted, { color: colors.textMuted, marginTop: 12 }]}>
            Log in to manage account settings.
          </Text>
        ) : null}

        {busy ? <Text style={[styles.muted, { color: colors.textMuted, marginTop: 12 }]}>Working...</Text> : null}

        {statusMessage ? (
          <View
            style={[
              styles.statusBox,
              {
                borderColor: statusTone === 'ok' ? colors.primary : colors.danger,
                backgroundColor: colors.surface
              }
            ]}
          >
            <Text style={[styles.statusText, { color: statusTone === 'ok' ? colors.text : colors.danger }]}
            >
              {statusMessage}
            </Text>
          </View>
        ) : null}
      </View>

      <Modal visible={confirmOpen} transparent animationType="fade" onRequestClose={closeConfirm}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.surface }]}
            >
            <Text style={[styles.modalTitle, { color: colors.text }]}>{confirmTitle}</Text>
            <Text style={[styles.modalMessage, { color: colors.textMuted }]}>{confirmMessage}</Text>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: colors.surfaceMuted }]}
                onPress={closeConfirm}
                disabled={busy !== null}
              >
                <Text style={[styles.modalBtnText, { color: colors.text }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalBtn,
                  { backgroundColor: confirmTone === 'danger' ? colors.danger : colors.primary }
                ]}
                onPress={runConfirm}
                disabled={busy !== null}
              >
                <Text style={[styles.modalBtnText, { color: '#fff' }]}>{confirmCta}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { padding: 20 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#001a2d' },
  content: { flex: 1, paddingHorizontal: 20, paddingTop: 6 },
  muted: { color: '#666' },
  sectionTitle: { fontSize: 14, fontWeight: '700', marginBottom: 10 },
  rowWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 999 },
  chipText: { fontWeight: '700' },
  dangerBtn: { borderRadius: 14, paddingVertical: 14, paddingHorizontal: 14, marginTop: 12 },
  dangerBtnText: { fontSize: 16, fontWeight: '800' },
  dangerSub: { marginTop: 6, fontSize: 12, fontWeight: '600' },
  statusBox: {
    marginTop: 12,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12
  },
  statusText: { fontWeight: '600' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: 20
  },
  modalCard: { borderRadius: 16, padding: 16 },
  modalTitle: { fontSize: 18, fontWeight: '800' },
  modalMessage: { marginTop: 8, fontSize: 13, fontWeight: '600' },
  modalActions: { marginTop: 16, flexDirection: 'row', gap: 10 },
  modalBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  modalBtnText: { fontWeight: '800' }
});

export default SettingsPage;
