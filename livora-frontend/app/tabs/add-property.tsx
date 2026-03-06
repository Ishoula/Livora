import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import TopNavBar, { TOP_NAVBAR_BASE_HEIGHT } from '../../components/TopNavBar';
import { apiRequestAuth } from '../../lib/apiAuth';
import { getSession } from '../../lib/session';

type StatusTone = 'ok' | 'error';

type CreatePropertyBody = {
  title: string;
  description?: string | null;
  price: number;
  propertyType?: string | null;
  location?: string | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  image_url?: string | null;
};

const AddPropertyPage = () => {
  const insets = useSafeAreaInsets();
  const headerTotalHeight = insets.top + TOP_NAVBAR_BASE_HEIGHT;

  const session = getSession();
  const role = session?.user?.role;
  const canCreate = role === 'seller' || role === 'agent';

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [location, setLocation] = useState('');
  const [bedrooms, setBedrooms] = useState('');
  const [bathrooms, setBathrooms] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const [busy, setBusy] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusTone, setStatusTone] = useState<StatusTone>('ok');

  const missingAuthMessage = useMemo(() => {
    if (!session?.tokens?.accessToken) return 'Please log in first.';
    if (!canCreate) return 'You do not have permission to add properties.';
    return null;
  }, [session?.tokens?.accessToken, canCreate]);

  const submit = async () => {
    setStatusMessage(null);

    if (missingAuthMessage) {
      setStatusTone('error');
      setStatusMessage(missingAuthMessage);
      return;
    }

    const cleanTitle = title.trim();
    if (!cleanTitle) {
      setStatusTone('error');
      setStatusMessage('Title is required.');
      return;
    }

    const parsedPrice = Number(price);
    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      setStatusTone('error');
      setStatusMessage('Price must be a valid number.');
      return;
    }

    const parsedBedrooms = bedrooms.trim() ? Number(bedrooms) : null;
    if (bedrooms.trim() && (!Number.isFinite(parsedBedrooms) || parsedBedrooms! < 0)) {
      setStatusTone('error');
      setStatusMessage('Bedrooms must be a valid number.');
      return;
    }

    const parsedBathrooms = bathrooms.trim() ? Number(bathrooms) : null;
    if (bathrooms.trim() && (!Number.isFinite(parsedBathrooms) || parsedBathrooms! < 0)) {
      setStatusTone('error');
      setStatusMessage('Bathrooms must be a valid number.');
      return;
    }

    const body: CreatePropertyBody = {
      title: cleanTitle,
      description: description.trim() ? description.trim() : null,
      price: parsedPrice,
      propertyType: propertyType.trim() ? propertyType.trim() : null,
      location: location.trim() ? location.trim() : null,
      bedrooms: parsedBedrooms,
      bathrooms: parsedBathrooms,
      image_url: imageUrl.trim() ? imageUrl.trim() : null
    };

    setBusy(true);
    try {
      await apiRequestAuth({ method: 'POST', path: '/api/properties', body });
      setStatusTone('ok');
      setStatusMessage('Property created successfully.');

      setTitle('');
      setDescription('');
      setPrice('');
      setPropertyType('');
      setLocation('');
      setBedrooms('');
      setBathrooms('');
      setImageUrl('');
    } catch (e) {
      setStatusTone('error');
      setStatusMessage(e instanceof Error ? e.message : 'Failed to create property');
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { paddingTop: headerTotalHeight }]}>
      <StatusBar barStyle="dark-content" />
      <TopNavBar />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={headerTotalHeight}
      >
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.title}>Add Property</Text>
            <View style={styles.titleUnderline} />
          </View>

          {missingAuthMessage ? (
            <View
              style={[
                styles.statusBox,
                { borderColor: '#e11d48', backgroundColor: '#fff' }
              ]}
            >
              <Text style={[styles.statusText, { color: '#e11d48' }]}>{missingAuthMessage}</Text>
            </View>
          ) : null}

          <View style={styles.formCard}>
            <Field label="Title" value={title} onChangeText={setTitle} placeholder="e.g. Modern 2-bedroom apartment" />
            <Field
              label="Description"
              value={description}
              onChangeText={setDescription}
              placeholder="Optional description"
              multiline
            />
            <Field label="Price" value={price} onChangeText={setPrice} placeholder="e.g. 120000" keyboardType="numeric" />
            <Field label="Property type" value={propertyType} onChangeText={setPropertyType} placeholder="e.g. Sale / Rent" />
            <Field label="Location" value={location} onChangeText={setLocation} placeholder="e.g. Nairobi" />
            <Field label="Bedrooms" value={bedrooms} onChangeText={setBedrooms} placeholder="e.g. 2" keyboardType="numeric" />
            <Field label="Bathrooms" value={bathrooms} onChangeText={setBathrooms} placeholder="e.g. 1" keyboardType="numeric" />
            <Field label="Image URL" value={imageUrl} onChangeText={setImageUrl} placeholder="Optional" />

            <TouchableOpacity style={styles.primaryBtn} onPress={() => void submit()} disabled={busy}>
              {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>Create Property</Text>}
            </TouchableOpacity>

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
                <Text style={[styles.statusText, { color: statusTone === 'ok' ? '#001a2d' : '#e11d48' }]}
                >
                  {statusMessage}
                </Text>
              </View>
            ) : null}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const Field = ({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  multiline
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad';
  multiline?: boolean;
}) => {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, multiline ? styles.inputMultiline : null]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#94a3b8"
        keyboardType={keyboardType}
        multiline={multiline}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, backgroundColor: '#fff' },
  content: { paddingHorizontal: 20, paddingBottom: 40 },
  header: { paddingTop: 24, paddingBottom: 12 },
  title: { fontSize: 28, fontWeight: '800', color: '#001a2d', letterSpacing: -0.5 },
  titleUnderline: { height: 4, width: 40, backgroundColor: '#001a2d', marginTop: 4, borderRadius: 2 },
  formCard: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    borderRadius: 20,
    padding: 16,
    backgroundColor: '#fff'
  },
  fieldWrap: { marginBottom: 12 },
  label: { fontSize: 12, fontWeight: '800', color: '#64748b', marginBottom: 8, letterSpacing: 0.8 },
  input: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
    backgroundColor: '#f8fafc'
  },
  inputMultiline: { minHeight: 90, textAlignVertical: 'top' },
  primaryBtn: {
    marginTop: 8,
    backgroundColor: '#001a2d',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center'
  },
  primaryBtnText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  statusBox: {
    marginTop: 12,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12
  },
  statusText: { fontWeight: '700', textAlign: 'center' }
});

export default AddPropertyPage;
