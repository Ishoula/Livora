import React from 'react';
import { 
  StyleSheet, View, Text, TouchableOpacity, 
  SafeAreaView, ImageBackground, StatusBar 
} from 'react-native';
import { useRouter } from 'expo-router';

const WelcomePage = () => {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ImageBackground 
        // Using a professional real estate image
        source={{ uri: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c' }} 
        style={styles.backgroundImage}
      >
        {/* Blue-tinted overlay for brand consistency and readability */}
        <View style={styles.overlay}>
          <SafeAreaView style={styles.content}>
            
            <View style={styles.topSection}>
              <View style={styles.logoCircle}>
                <Text style={styles.logoText}>L</Text>
              </View>
              <Text style={styles.brandName}>LIVORA</Text>
              <Text style={styles.tagline}>Your Gateway to Modern Living</Text>
            </View>

            <View style={styles.bottomSection}>
              {/* UC-2: Login */}
              <TouchableOpacity 
                style={styles.loginButton}
                onPress={() => router.push('/(auth)/login')}
              >
                <Text style={styles.loginButtonText}>Sign In</Text>
              </TouchableOpacity>

              {/* UC-1: Register */}
              <TouchableOpacity 
                style={styles.registerButton}
                onPress={() => router.push('/(auth)/register')}
              >
                <Text style={styles.registerButtonText}>Create Account</Text>
              </TouchableOpacity>

              {/* Guest Entry (FR-8) */}
              <TouchableOpacity 
                style={styles.guestButton}
                onPress={() => console.log('Guest access - would navigate to main app')}
              >
                <Text style={styles.guestText}>Continue as Guest</Text>
              </TouchableOpacity>
            </View>

          </SafeAreaView>
        </View>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  backgroundImage: { flex: 1, resizeMode: 'cover' },
  overlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0, 51, 102, 0.6)', // 60% opacity Brand Blue
    paddingHorizontal: 30 
  },
  content: { flex: 1, justifyContent: 'space-between' },
  topSection: { flex: 2, justifyContent: 'center', alignItems: 'center' },
  logoCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  logoText: { color: '#003366', fontSize: 35, fontWeight: 'bold' },
  brandName: { 
    fontSize: 36, fontWeight: 'bold', color: '#FFFFFF', letterSpacing: 3 
  },
  tagline: { fontSize: 16, color: '#E0E0E0', marginTop: 10 },
  bottomSection: { flex: 1, paddingBottom: 40, justifyContent: 'flex-end' },
  loginButton: {
    backgroundColor: '#FFFFFF', // White button for primary action against blue overlay
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 15,
  },
  loginButtonText: { color: '#003366', fontSize: 18, fontWeight: 'bold' },
  registerButton: {
    backgroundColor: 'transparent',
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    marginBottom: 20,
  },
  registerButtonText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
  guestButton: { alignItems: 'center' },
  guestText: { 
    color: '#FFFFFF', fontSize: 14, textDecorationLine: 'underline' 
  },
});

export default WelcomePage;