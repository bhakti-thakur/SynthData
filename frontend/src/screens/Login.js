import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

export default function Login({onClose,goToSignUp}) {
  const [secure, setSecure] = useState(true);

  return (
    <LinearGradient
      colors={['#E9C9FF', '#FFD6C9']}
      style={styles.container}
    >
      <View style={styles.card}>

        {/* CLOSE BUTTON */}
        <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
          <Ionicons name="close" size={26} color="#777" />
        </TouchableOpacity>

        {/* TITLE */}
        <Text style={styles.title}>Login</Text>

        {/* GOOGLE BUTTON */}
        <TouchableOpacity style={styles.googleBtn}>
          <Image
            source={{
              uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Google_%22G%22_Logo.svg/512px-Google_%22G%22_Logo.svg.png',
            }}
            style={styles.googleIcon}
          />
          <Text style={styles.googleText}>Continue with Google</Text>
        </TouchableOpacity>

        {/* DIVIDER */}
        <View style={styles.dividerRow}>
          <View style={styles.divider} />
          <Text style={styles.dividerText}>or login with email</Text>
          <View style={styles.divider} />
        </View>

        {/* EMAIL INPUT */}
        <TextInput
          placeholder="Email ID"
          placeholderTextColor="#999"
          style={styles.input}
        />

        <Text style={styles.otpText}>Login via OTP</Text>

        {/* PASSWORD INPUT */}
        <View style={styles.passwordRow}>
          <TextInput
            placeholder="Enter your Password"
            placeholderTextColor="#999"
            secureTextEntry={secure}
            style={styles.passwordInput}
          />
          <TouchableOpacity onPress={() => setSecure(!secure)}>
            <Ionicons
              name={secure ? 'eye-off-outline' : 'eye-outline'}
              size={22}
              color="#777"
            />
          </TouchableOpacity>
        </View>

        {/* FORGOT PASSWORD */}
        <TouchableOpacity>
          <Text style={styles.forgotText}>🔒 Forget Password?</Text>
        </TouchableOpacity>

        {/* LOGIN BUTTON */}
        <TouchableOpacity style={styles.loginBtn}>
          <Text style={styles.loginText}>Login</Text>
        </TouchableOpacity>

        {/* SIGN UP */}
        <Text style={styles.signupText}>
          Don’t have an account? <Text style={styles.signupBold} onPress={goToSignUp}>Sign up</Text>
        </Text>

      </View>
    </LinearGradient>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 24,
    paddingTop: 40,
  },

  closeBtn: {
    position: 'absolute',
    top: 18,
    right: 18,
    zIndex: 10,
  },

  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 24,
  },

  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#DDD',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 22,
  },

  googleIcon: {
    width: 22,
    height: 22,
    marginRight: 12,
  },

  googleText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 20,
  },

  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 22,
  },

  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#CCC',
  },

  dividerText: {
    marginHorizontal: 10,
    fontSize: 14,
    color: '#777',
  },

  input: {
    borderWidth: 1.5,
    borderColor: '#DDD',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    marginBottom: 8,
  },

  otpText: {
    fontSize: 13,
    color: '#777',
    marginBottom: 18,
  },

  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#DDD',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 10,
  },

  passwordInput: {
    flex: 1,
    fontSize: 16,
  },

  forgotText: {
    fontSize: 14,
    color: '#777',
    marginBottom: 24,
  },

  loginBtn: {
    backgroundColor: '#000',
    borderRadius: 30,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 24,
  },

  loginText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },

  signupText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#777',
  },

  signupBold: {
    fontWeight: '700',
    color: '#000',
  },
});
