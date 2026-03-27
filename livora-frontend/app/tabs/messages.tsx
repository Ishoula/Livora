import React, { useEffect, useMemo, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  FlatList,
  StatusBar,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Modal,
} from "react-native";

import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { getSession } from "../../lib/session";
import { apiRequestAuth } from "../../lib/apiAuth";
import TopNavBar, { TOP_NAVBAR_BASE_HEIGHT } from "../../components/TopNavBar";

type ApiUser = {
  id: number;
  fullName?: string | null;
};

type ApiMessage = {
  id: number;
  message: string;
  sentAt: string;
  sender?: ApiUser | null;
  receiver?: ApiUser | null;
};

const MessagesPage = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const params = useLocalSearchParams<{ propertyId?: string | string[] }>();

  const [propertyIdText, setPropertyIdText] = useState("");
  const [receiverIdText, setReceiverIdText] = useState("");
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<ApiMessage[]>([]);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusTone, setStatusTone] = useState<'ok' | 'error'>('ok');

  const [replyModalOpen, setReplyModalOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<ApiMessage | null>(null);
  const [replyToUser, setReplyToUser] = useState<ApiUser | null>(null);

  const session = getSession();
  const isLoggedIn = Boolean(session?.tokens?.accessToken);
  const headerTotalHeight = insets.top + TOP_NAVBAR_BASE_HEIGHT;

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

  const replyTargetLabel = useMemo(() => {
    if (!replyToUser?.id) return null;
    return replyToUser.fullName?.trim() ? replyToUser.fullName : `User ${replyToUser.id}`;
  }, [replyToUser]);

  const loadMessages = async () => {
    if (!isLoggedIn || !propertyId) return;
    setLoading(true);
    setError(null);
    setStatusMessage(null);
    try {
      const apiMessages = await apiRequestAuth<ApiMessage[]>({
        path: "/api/messages/property/" + propertyId,
      });
      apiMessages.sort((a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime());
      setMessages(apiMessages);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to load messages";
      setError(msg);
      setStatusTone('error');
      setStatusMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const raw = params?.propertyId;
    const value = Array.isArray(raw) ? raw[0] : raw;
    if (typeof value === "string" && value.trim()) setPropertyIdText(value);
  }, [params?.propertyId]);

  useEffect(() => {
    if (isLoggedIn && propertyId) loadMessages();
  }, [isLoggedIn, propertyId]);

  const sendMessage = async () => {
    if (!isLoggedIn || !propertyId || !draft.trim()) return;
    setSending(true);
    setStatusMessage(null);
    try {
      const body: any = { message: draft.trim() };
      if (receiverId !== undefined) body.receiverId = receiverId;
      await apiRequestAuth({
        method: "POST",
        path: "/api/messages/property/" + propertyId,
        body,
      });
      setDraft("");
      setReplyToUser(null);
      setReceiverIdText("");
      await loadMessages();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to send";
      setStatusTone('error');
      setStatusMessage(msg);
    } finally {
      setSending(false);
    }
  };

  const openReplyPicker = (item: ApiMessage) => {
    setSelectedMessage(item);
    setReplyModalOpen(true);
  };

  const chooseReply = () => {
    if (!selectedMessage) {
      setReplyModalOpen(false);
      return;
    }

    const isMine = selectedMessage.sender?.id === session?.user?.id;
    const target = isMine ? selectedMessage.receiver : selectedMessage.sender;
    if (!target?.id) {
      setReplyModalOpen(false);
      return;
    }

    setReplyToUser(target);
    setReceiverIdText(String(target.id));
    setReplyModalOpen(false);
  };

  return (
    <SafeAreaView style={[styles.container, { paddingTop: headerTotalHeight }]}>
      <StatusBar barStyle="dark-content" />
      <TopNavBar />

      {/* --- Refined Header Section --- */}
      <View style={styles.headerSection}>
        <View>
          <Text style={styles.headerTitle}>Messages</Text>
          <View style={styles.titleUnderline} />
        </View>
        <View style={styles.statusBadge}>
          <View style={[styles.statusDot, { backgroundColor: isLoggedIn ? '#22c55e' : '#94a3b8' }]} />
          <Text style={styles.statusText}>{isLoggedIn ? 'Online' : 'Offline'}</Text>
        </View>
      </View>

      {!isLoggedIn ? (
        <View style={styles.centeredContent}>
          <MaterialCommunityIcons name="message-lock-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>Log in to chat about properties</Text>
          <TouchableOpacity style={styles.loginCta} onPress={() => router.push("/(auth)/login")}>
            <Text style={styles.loginCtaText}>Go to Login</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {statusMessage ? (
            <View
              style={[
                styles.statusBox,
                {
                  borderColor: statusTone === 'ok' ? '#001a2d' : '#e11d48',
                  backgroundColor: '#fff'
                }
              ]}
            >
              <Text style={[styles.statusTextBox, { color: statusTone === 'ok' ? '#001a2d' : '#e11d48' }]}
              >
                {statusMessage}
              </Text>
            </View>
          ) : null}

          {/* --- Context Bar (Property Selection) --- */}
          <View style={styles.contextBar}>
            <View style={styles.inputGroup}>
              <Text style={styles.contextLabel}>PROPERTY CONTEXT</Text>
              <View style={styles.contextRow}>
                <View style={styles.inputWrapper}>
                  <Ionicons name="home-outline" size={14} color="#94a3b8" style={styles.inputIcon} />
                  <TextInput
                    value={propertyIdText}
                    onChangeText={setPropertyIdText}
                    placeholder="ID"
                    keyboardType="number-pad"
                    style={styles.propertyInput}
                  />
                </View>
                <View style={[styles.inputWrapper, { flex: 1.5 }]}>
                  <Ionicons name="person-outline" size={14} color="#94a3b8" style={styles.inputIcon} />
                  <TextInput
                    value={receiverIdText}
                    onChangeText={setReceiverIdText}
                    placeholder="Receiver (Opt)"
                    keyboardType="number-pad"
                    style={styles.propertyInput}
                  />
                </View>
                <TouchableOpacity style={styles.refreshIconBtn} onPress={loadMessages} disabled={loading}>
                  {loading ? <ActivityIndicator size="small" color="#001a2d" /> : <Ionicons name="refresh" size={20} color="#001a2d" />}
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <FlatList
            data={messages}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => {
              const isMine = item.sender?.id === session?.user?.id;
              return (
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => openReplyPicker(item)}
                  style={[styles.bubble, isMine ? styles.bubbleMine : styles.bubbleOther]}
                >
                  {!isMine && <Text style={styles.bubbleTitleOther}>{item.sender?.fullName ?? `User ${item.sender?.id}`}</Text>}
                  <Text style={isMine ? styles.bubbleTextMine : styles.bubbleTextOther}>{item.message}</Text>
                  <Text style={isMine ? styles.bubbleMetaMine : styles.bubbleMetaOther}>
                    {new Date(item.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </TouchableOpacity>
              );
            }}

            ListEmptyComponent={
              !loading ? (
                <View style={styles.centeredContent}>
                  <Ionicons name="chatbubbles-outline" size={48} color="#eee" />
                  <Text style={styles.muted}>Select a property to start chatting</Text>
                </View>
              ) : null
            }
          />

          {/* --- Composer Area --- */}
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={100}>
            <View style={styles.composer}>
              {replyTargetLabel ? (
                <View style={styles.replyBanner}>
                  <View style={styles.replyBannerLeft}>
                    <Ionicons name="return-up-forward-outline" size={14} color="#001a2d" />
                    <Text style={styles.replyBannerText}>Replying to {replyTargetLabel}</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => {
                      setReplyToUser(null);
                      setReceiverIdText("");
                    }}
                  >
                    <Ionicons name="close" size={16} color="#001a2d" />
                  </TouchableOpacity>
                </View>
              ) : null}
              <View style={styles.composerRow}>
                <TextInput
                  value={draft}
                  onChangeText={setDraft}
                  placeholder="Type your message..."
                  style={styles.composerInput}
                  multiline
                />
                <TouchableOpacity
                  style={[styles.sendBtn, !draft.trim() && { opacity: 0.5 }]}
                  onPress={sendMessage}
                  disabled={sending || !draft.trim()}
                >
                  {sending ? <ActivityIndicator color="#fff" /> : <Ionicons name="send" size={18} color="#fff" />}
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>

          <Modal
            visible={replyModalOpen}
            transparent
            animationType="fade"
            onRequestClose={() => setReplyModalOpen(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalCard}>
                <Text style={styles.modalTitle}>Message</Text>
                <Text style={styles.modalBody} numberOfLines={6}>
                  {selectedMessage?.message ?? ''}
                </Text>
                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={[styles.modalBtn, styles.modalBtnNeutral]}
                    onPress={() => setReplyModalOpen(false)}
                    disabled={sending}
                  >
                    <Text style={styles.modalBtnTextNeutral}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalBtn, styles.modalBtnPrimary]}
                    onPress={chooseReply}
                    disabled={sending}
                  >
                    <Text style={styles.modalBtnTextPrimary}>Reply</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },

  // Header
  headerSection: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: { fontSize: 28, fontWeight: '800', color: '#001a2d', letterSpacing: -0.5 },
  titleUnderline: { height: 4, width: 30, backgroundColor: '#001a2d', marginTop: 4, borderRadius: 2 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f1f5f9', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, gap: 6 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontSize: 12, fontWeight: '600', color: '#475569' },

  // Context Bar
  contextBar: { paddingHorizontal: 20, paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  statusBox: {
    marginHorizontal: 20,
    marginTop: 12,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12
  },
  statusTextBox: { fontWeight: '700', textAlign: 'center' },
  inputGroup: { backgroundColor: '#f8fafc', borderRadius: 16, padding: 12, borderWidth: 1, borderColor: '#e2e8f0' },
  contextLabel: { fontSize: 10, fontWeight: '800', color: '#94a3b8', marginBottom: 8, letterSpacing: 1 },
  contextRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  inputWrapper: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 8, borderWidth: 1, borderColor: '#e2e8f0', paddingHorizontal: 8 },
  inputIcon: { marginRight: 4 },
  propertyInput: { flex: 1, paddingVertical: 8, fontSize: 14, color: '#001a2d' },
  refreshIconBtn: { padding: 8, backgroundColor: '#fff', borderRadius: 8, borderWidth: 1, borderColor: '#e2e8f0' },

  // List & Bubbles
  listContent: { paddingHorizontal: 20, paddingBottom: 20, paddingTop: 15 },
  bubble: { borderRadius: 18, padding: 14, marginBottom: 12, maxWidth: '85%', elevation: 1, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, shadowOffset: { width: 0, height: 2 } },
  bubbleMine: { backgroundColor: "#001a2d", alignSelf: "flex-end", borderBottomRightRadius: 4 },
  bubbleOther: { backgroundColor: "#f1f5f9", alignSelf: "flex-start", borderBottomLeftRadius: 4 },
  bubbleTitleMine: { fontWeight: "bold", color: "rgba(255,255,255,0.85)", fontSize: 12, marginBottom: 4 },
  bubbleTitleOther: { fontWeight: "bold", color: "#001a2d", fontSize: 12, marginBottom: 4 },
  bubbleTextMine: { color: "#fff", lineHeight: 20 },
  bubbleTextOther: { color: "#001a2d", lineHeight: 20 },
  bubbleMetaMine: { color: "rgba(255,255,255,0.6)", fontSize: 10, marginTop: 4, textAlign: 'right' },
  bubbleMetaOther: { color: "#94a3b8", fontSize: 10, marginTop: 4 },

  // Composer
  composer: { padding: 15, backgroundColor: "#fff", borderTopWidth: 1, borderTopColor: "#f1f5f9" },
  composerRow: { flexDirection: "row", gap: 10, alignItems: 'center' },
  replyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginBottom: 10
  },
  replyBannerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  replyBannerText: { color: '#001a2d', fontWeight: '700', fontSize: 12 },
  composerInput: { flex: 1, backgroundColor: "#f8fafc", borderRadius: 20, paddingHorizontal: 15, paddingVertical: 10, borderWidth: 1, borderColor: "#e2e8f0", maxHeight: 100 },
  sendBtn: { backgroundColor: "#001a2d", width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', padding: 20 },
  modalCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#e2e8f0' },
  modalTitle: { fontSize: 16, fontWeight: '800', color: '#001a2d' },
  modalBody: { marginTop: 8, color: '#475569', fontWeight: '600', fontSize: 13, lineHeight: 18 },
  modalActions: { marginTop: 14, flexDirection: 'row', gap: 10 },
  modalBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  modalBtnNeutral: { backgroundColor: '#f1f5f9' },
  modalBtnPrimary: { backgroundColor: '#001a2d' },
  modalBtnTextNeutral: { color: '#001a2d', fontWeight: '800' },
  modalBtnTextPrimary: { color: '#fff', fontWeight: '800' },

  // Utilities
  centeredContent: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40, marginTop: 40 },
  emptyText: { color: '#666', fontSize: 16, marginTop: 12, textAlign: 'center' },
  muted: { color: "#94a3b8", fontSize: 14, marginTop: 8 },
  loginCta: { backgroundColor: "#001a2d", paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12, marginTop: 20 },
  loginCtaText: { color: "#fff", fontWeight: "bold" },
});

export default MessagesPage;