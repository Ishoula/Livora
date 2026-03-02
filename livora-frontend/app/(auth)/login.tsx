import React, { useState } from 'react';
import { 
  StyleSheet, View, Text, TextInput, TouchableOpacity, 
  ImageBackground, SafeAreaView, StatusBar, Alert 
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons'; // Assuming Expo for icons
import { login } from '../../lib/auth';
import { ApiError } from '../../lib/api';

const LoginPage = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getLoginErrorMessage = (err: unknown): string => {
    if (err instanceof ApiError) {
      if (err.status === 401 || err.status === 403) return 'Incorrect email or password.';
      if (err.status >= 500) return 'Server error. Please try again shortly.';
      return err.message || 'Unable to login.';
    }

    if (err instanceof Error && err.message) return err.message;
    return 'Unable to login.';
  };

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Missing details', 'Please enter your email and password.');
      return;
    }

    try {
      setIsSubmitting(true);
      await login({ email: email.trim(), password });
      router.replace('/tabs/home');
    } catch (err: unknown) {
      Alert.alert('Login failed', getLoginErrorMessage(err));
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
          {/* Header Section */}
          <View style={styles.header}>
            <View style={styles.logoBox}>
              <Ionicons name="home-outline" size={30} color="#003366" />
            </View>
            <Text style={styles.brandText}>Livora</Text>
            <Text style={styles.tagline}>Find your home with ease</Text>
          </View>

          {/* Form Section */}
          <View style={styles.formContainer}>
            {/* Tab Switcher */}
            <View style={styles.tabSwitcher}>
              <TouchableOpacity style={styles.activeTab}>
                <Text style={styles.activeTabText}>LOGIN</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.inactiveTab}
                onPress={() => router.push('/(auth)/register')}
              >
                <Text style={styles.inactiveTabText}>SIGN UP</Text>
              </TouchableOpacity>
            </View>

            {/* Email Input */}
            <Text style={styles.inputLabel}>Email:</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="at-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput 
                style={styles.input} 
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            {/* Password Input */}
            <Text style={styles.inputLabel}>Password:</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput 
                style={styles.input} 
                placeholder="Enter your password"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#666" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.forgotPass}>
              <Text style={styles.forgotPassText}>Forgot Password?</Text>
            </TouchableOpacity>

            {/* Login Button */}
            <TouchableOpacity style={styles.loginButton} onPress={handleLogin} disabled={isSubmitting}>
              <Text style={styles.loginButtonText}>LOGIN  →</Text>
            </TouchableOpacity>

            <Text style={styles.footerText}>Your trusted free real estate companion.</Text>
          </View>
        </View>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  background: { flex: 1 },
  darkOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  header: { alignItems: 'center', marginBottom: 40 },
  logoBox: { backgroundColor: '#fff', padding: 10, borderRadius: 10, marginBottom: 10 },
  brandText: { fontSize: 32, fontWeight: 'bold', color: '#fff' },
  tagline: { color: '#ddd', fontSize: 16 },
  formContainer: { 
    backgroundColor: 'rgba(255, 255, 255, 0.9)', 
    borderTopLeftRadius: 40, borderTopRightRadius: 40, 
    padding: 30, paddingBottom: 50 
  },
  tabSwitcher: { 
    flexDirection: 'row', backgroundColor: '#e0e0e0', 
    borderRadius: 15, marginBottom: 30 
  },
  activeTab: { flex: 1, backgroundColor: '#001a2d', padding: 15, borderRadius: 15, alignItems: 'center' },
  activeTabText: { color: '#fff', fontWeight: 'bold' },
  inactiveTab: { flex: 1, padding: 15, alignItems: 'center' },
  inactiveTabText: { color: '#666', fontWeight: 'bold' },
  inputLabel: { color: '#333', fontWeight: 'bold', marginBottom: 8 },
  inputWrapper: { 
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#d1d1d1', 
    borderRadius: 15, paddingHorizontal: 15, marginBottom: 20 
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, height: 50, color: '#000' },
  forgotPass: { alignSelf: 'flex-end', marginBottom: 25 },
  forgotPassText: { color: '#001a2d', fontWeight: 'bold', fontSize: 12 },
  loginButton: { 
    backgroundColor: '#001a2d', paddingVertical: 18, 
    borderRadius: 15, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' 
  },
  loginButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  footerText: { textAlign: 'center', color: '#666', marginTop: 20, fontSize: 12 }
});

export default LoginPage;