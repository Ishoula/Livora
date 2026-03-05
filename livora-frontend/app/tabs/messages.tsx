import React, { useEffect, useMemo, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  FlatList,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Alert
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getSession } from '../../lib/session';
import { apiRequestAuth } from '../../lib/apiAuth';

type ApiUser = {
  id: number;
  fullName?: string;
};

type ApiMessage = {
  id: number;
  message: string;
  sender: ApiUser;
  receiver: ApiUser;
  sentAt: string;
};

const MessagesPage = () => {
  const router = useRouter();
  const params = useLocalSearchParams<{ propertyId?: string | string[] }>();
  const [propertyIdText, setPropertyIdText] = useState('');
  const [receiverIdText, setReceiverIdText] = useState('');
  const [draft, setDraft] = useState('');

  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<ApiMessage[]>([]);

  const session = getSession();
  const isLoggedIn = Boolean(session?.tokens?.accessToken);

  const propertyId = useMemo(() => {
    const n = Number(propertyIdText);
    return Number.isFinite(n) && n > 0 ? n : null;
  }, [propertyIdText]);

  const receiverId = useMemo(() => {
    const trimmed = receiverIdText.trim();
    if (!trimmed) return undefined;
    const n = Number(trimmed);
    return Number.isFinite(n) && n > 0 ? n : undefined;
  }, [receiverIdText]);

  const loadMessages = async () => {
    if (!isLoggedIn) {
      Alert.alert('Login required', 'Please log in to view messages.');
      return;
    }

    if (!propertyId) {
      Alert.alert('Missing details', 'Enter a valid propertyId to view messages.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const apiMessages = await apiRequestAuth<ApiMessage[]>({
        path: '/api/messages/property/' + propertyId
      });

      apiMessages.sort((a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime());
      setMessages(apiMessages);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const raw = params?.propertyId;
    const value = Array.isArray(raw) ? raw[0] : raw;
    if (typeof value === 'string' && value.trim()) {
      setPropertyIdText(value);
    }
  }, [params?.propertyId]);

  useEffect(() => {
    if (!isLoggedIn) return;
    if (!propertyId) return;
    void loadMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn, propertyId]);

  const sendMessage = async () => {
    if (!isLoggedIn) {
      Alert.alert('Login required', 'Please log in to send messages.');
      return;
    }

    if (!propertyId) {
      Alert.alert('Missing details', 'Enter a valid propertyId before sending.');
      return;
    }

    const message = draft.trim();
    if (!message) {
      Alert.alert('Empty message', 'Type a message first.');
      return;
    }

    setSending(true);

    try {
      const body: any = { message };
      if (receiverId !== undefined) body.receiverId = receiverId;

      await apiRequestAuth({
        method: 'POST',
        path: '/api/messages/property/' + propertyId,
        body
      });

      setDraft('');
      await loadMessages();
    } catch (e) {
      Alert.alert('Message', e instanceof Error ? e.message : 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    setMessages([]);
    setError(null);
  }, [propertyIdText]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <View>
          <Text style={styles.subHeader}>Messages</Text>
          <Text style={styles.welcomeText}>Chat about properties</Text>
        </View>
      </View>

      {!isLoggedIn ? (
        <View style={styles.loggedOutBox}>
          <Text style={styles.muted}>Log in to view and send messages.</Text>
          <TouchableOpacity style={styles.loginCta} onPress={() => router.push('/(auth)/login')}>
            <Text style={styles.loginCtaText}>Go to Login</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.controls}>
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Property ID</Text>
              <TextInput
                value={propertyIdText}
                onChangeText={setPropertyIdText}
                placeholder="e.g. 12"
                keyboardType="number-pad"
                style={styles.input}
              />
            </View>
            <TouchableOpacity style={styles.loadBtn} onPress={loadMessages} disabled={loading}>
              <Ionicons name="refresh" size={18} color="#fff" />
              <Text style={styles.loadBtnText}>{loading ? 'Loading' : 'Load'}</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.helper}>
            Receiver ID is optional (buyers can leave it empty; owners replying may need it).
          </Text>
          <TextInput
            value={receiverIdText}
            onChangeText={setReceiverIdText}
            placeholder="Receiver ID (optional)"
            keyboardType="number-pad"
            style={styles.input}
          />
        </View>
      )}

      {error ? (
        <View style={{ paddingHorizontal: 20, paddingTop: 10 }}>
          <Text style={{ color: 'red' }}>{error}</Text>
        </View>
      ) : null}

      <FlatList
        data={messages}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => {
          const isMine = item.sender?.id === session?.user?.id;
          const senderName = item.sender?.fullName ?? (isMine ? 'You' : 'User ' + item.sender?.id);
          return (
            <View style={[styles.bubble, isMine ? styles.bubbleMine : styles.bubbleOther]}>
              <Text style={isMine ? styles.bubbleTitleMine : styles.bubbleTitleOther}>{senderName}</Text>
              <Text style={isMine ? styles.bubbleTextMine : styles.bubbleTextOther}>{item.message}</Text>
              <Text style={isMine ? styles.bubbleMetaMine : styles.bubbleMetaOther}>{new Date(item.sentAt).toLocaleString()}</Text>
            </View>
          );
        }}
        ListEmptyComponent={
          isLoggedIn && !loading ? (
            <View style={{ paddingHorizontal: 20, paddingTop: 30 }}>
              <Text style={styles.muted}>No messages loaded yet.</Text>
            </View>
          ) : null
        }
      />

      {isLoggedIn ? (
        <View style={styles.composer}>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder="Type a message..."
            style={styles.composerInput}
            multiline
          />
          <TouchableOpacity style={styles.sendBtn} onPress={sendMessage} disabled={sending}>
            <Ionicons name="send" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      ) : null}
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
  loggedOutBox: { paddingHorizontal: 20, paddingTop: 10, gap: 10 },
  muted: { color: '#666' },
  controls: { paddingHorizontal: 20, paddingBottom: 10 },
  row: { flexDirection: 'row', gap: 12, alignItems: 'flex-end' },
  label: { color: '#333', fontWeight: 'bold', marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: '#eee',
    backgroundColor: '#f7f7f7',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12
  },
  helper: { color: '#666', fontSize: 12, marginVertical: 10 },
  loadBtn: {
    backgroundColor: '#001a2d',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  loadBtnText: { color: '#fff', fontWeight: 'bold' },
  listContent: { paddingHorizontal: 20, paddingBottom: 100 },
  bubble: {
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    maxWidth: '90%'
  },
  bubbleMine: { backgroundColor: '#001a2d', alignSelf: 'flex-end', },
  bubbleOther: { backgroundColor: '#fff', alignSelf: 'flex-start' },
  bubbleTitleOther: { fontWeight: 'bold', color: '#001a2d', marginBottom: 4 },
  bubbleTitleMine: { fontWeight: 'bold', color: '#fff', marginBottom: 4 },
  bubbleTextMine: { color: '#fff' },
  bubbleTextOther: { color: '#001a2d' },
  bubbleMetaMine: { color: '#eeeeee', fontSize: 11, marginTop: 8 },
  bubbleMetaOther: { color: '#001a2d', fontSize: 11, marginTop: 8 },
  composer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    gap: 10,
    padding: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee'
  },
  composerInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#eee',
    backgroundColor: '#f7f7f7',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    maxHeight: 100
  },
  sendBtn: {
    backgroundColor: '#001a2d',
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center'
  },
  loginCta: {
    backgroundColor: '#001a2d',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center'
  },
  loginCtaText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});

export default MessagesPage;
