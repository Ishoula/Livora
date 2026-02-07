import React, { useState } from 'react';
import { 
  StyleSheet, View, Text, TextInput, TouchableOpacity, 
  ImageBackground, SafeAreaView, ScrollView, StatusBar, Alert 
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { register } from '../../lib/auth';

const SignupPage = () => {
  const router = useRouter();
  // Input states based on FR-1 and visual design [cite: 245]
  const [name, setName] = useState(''  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [accountType, setAccountType] = useState('Agent'); // Roles from Section 2.3 
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSignup = async () => {
    if (!name.trim() || !email.trim() || !password) {
      Alert.alert('Missing details', 'Please enter your name, email, and password.');
      return;
    }

    const role = accountType === 'Tenant' ? 'buyer' : 'agent';

    try {
      setIsSubmitting(true);
      await register({
        fullName: name.trim(),
        email: email.trim(),
        phone: phone.trim() ? phone.trim() : undefined,
        password,
        role
      });
      router.replace('/');
    } catch (err: any) {
      Alert.alert('Sign up failed', err?.message ?? 'Unable to create account.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ImageBackground 
        source={require('../../assets/images/bg.png')}  
        style={styles.background}
      >
        <View style={styles.darkOverlay}>
          <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
              
              {/* Header Branding */}
              <View style={styles.header}>
                <View style={styles.logoBox}>
                  <Ionicons name="home" size={32} color="#001a2d" />
                </View>
                <Text style={styles.brandText}>Livora</Text>
              </View>

              {/* White Form Container */}
              <View style={styles.formContainer}>
                
                {/* The Integrated Toggle Button Design */}
                <View style={styles.toggleWrapper}>
                  <TouchableOpacity 
                    style={styles.inactiveTab}
                    onPress={() => router.push('/(auth)/login')}
                  >
                    <Text style={styles.inactiveTabText}>LOGIN</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.activeTab}>
                    <Text style={styles.activeTabText}>SIGN UP</Text>
                  </TouchableOpacity>
                </View>

                {/* Registration Fields [cite: 245] */}
                <TextInput 
                  style={styles.input} 
                  placeholder="Names" 
                  placeholderTextColor="#888"
                  value={name}
                  onChangeText={setName}
                />
                <TextInput 
                  style={styles.input} 
                  placeholder="Email" 
                  placeholderTextColor="#888"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
                <TextInput 
                  style={styles.input} 
                  placeholder="Phone (optional)" 
                  placeholderTextColor="#888"
                  keyboardType="phone-pad"
                  value={phone}
                  onChangeText={setPhone}
                />
                <View style={styles.passwordWrapper}>
                  <TextInput 
                    style={styles.passwordInput} 
                    placeholder="Password" 
                    placeholderTextColor="#888"
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={setPassword}
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                    <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#666" />
                  </TouchableOpacity>
                </View>

                {/* Account Type Selection (User Classes)  */}
                <Text style={styles.sectionLabel}>Account type</Text>
                <View style={styles.roleRow}>
                  <TouchableOpacity 
                    style={[styles.roleBox, accountType === 'Agent' && styles.activeRoleBox]}
                    onPress={() => setAccountType('Agent')}
                  >
                    <MaterialCommunityIcons name="home-city" size={28} color={accountType === 'Agent' ? "#001a2d" : "#666"} />
                    <Text style={[styles.roleText, accountType === 'Agent' && styles.activeRoleText]}>Agent / Landlord</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={[styles.roleBox, accountType === 'Tenant' && styles.activeRoleBox]}
                    onPress={() => setAccountType('Tenant')}
                  >
                    <Ionicons name="person" size={28} color={accountType === 'Tenant' ? "#001a2d" : "#666"} />
                    <Text style={[styles.roleText, accountType === 'Tenant' && styles.activeRoleText]}>Tenant</Text>
                  </TouchableOpacity>
                </View>

                {/* Legal Disclaimers [cite: 252] */}
                <Text style={styles.legalText}>
                  By clicking "Sign Up", you agree to our <Text style={styles.boldText}>Terms of Service</Text> and <Text style={styles.boldText}>Privacy Policy</Text> regarding your account and data.
                </Text>

                {/* Primary Signup Button */}
                <TouchableOpacity style={styles.signupButton} onPress={handleSignup} disabled={isSubmitting}>
                  <Text style={styles.signupButtonText}>SIGN UP</Text>
                </TouchableOpacity>
              </View>

            </ScrollView>
          </SafeAreaView>
        </View>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  background: { flex: 1 },
  darkOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
  safeArea: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: 'flex-end' },
  header: { alignItems: 'center', marginBottom: 25 },
  logoBox: { backgroundColor: '#fff', padding: 12, borderRadius: 100, marginBottom: 8 },
  brandText: { fontSize: 34, fontWeight: 'bold', color: '#fff' },
  formContainer: { 
    backgroundColor: '#FFFFFF', 
    borderTopLeftRadius: 40, borderTopRightRadius: 40, 
    padding: 25, paddingBottom: 40 
  },
  toggleWrapper: { 
    flexDirection: 'row', 
    backgroundColor: '#F0F0F0', 
    borderRadius: 20, 
    padding: 5, 
    marginBottom: 25 
  },
  activeTab: { flex: 1, backgroundColor: '#001a2d', paddingVertical: 12, borderRadius: 18, alignItems: 'center' },
  activeTabText: { color: '#fff', fontWeight: 'bold' },
  inactiveTab: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  inactiveTabText: { color: '#888', fontWeight: 'bold' },
  input: { backgroundColor: '#E8E8E8', borderRadius: 15, padding: 16, marginBottom: 12, fontSize: 16, color: '#000' },
  passwordWrapper: { 
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#E8E8E8', 
    borderRadius: 15, paddingHorizontal: 16, marginBottom: 12 
  },
  passwordInput: { flex: 1, height: 55, color: '#000' },
  sectionLabel: { fontSize: 14, fontWeight: 'bold', color: '#333', marginBottom: 10, marginLeft: 5 },
  roleRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  roleBox: { 
    flex: 1, borderWidth: 1.5, borderColor: '#EEE', borderRadius: 15, 
    padding: 15, alignItems: 'center', backgroundColor: '#FAFAFA' 
  },
  activeRoleBox: { borderColor: '#001a2d', backgroundColor: '#F0F4F8' },
  roleText: { fontSize: 12, color: '#666', marginTop: 6, textAlign: 'center' },
  activeRoleText: { color: '#001a2d', fontWeight: 'bold' },
  legalText: { textAlign: 'center', fontSize: 11, color: '#999', marginBottom: 25, lineHeight: 16 },
  boldText: { color: '#333', fontWeight: 'bold' },
  signupButton: { backgroundColor: '#001a2d', paddingVertical: 18, borderRadius: 15, alignItems: 'center' },
  signupButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});

export default SignupPage;