// app/login.tsx
import React, { useState } from "react";
import { useNavigation } from '@react-navigation/native';
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { router } from "expo-router";
import { login } from './utils';
import { useDispatch, useSelector } from 'react-redux';
import { setUserId, clearUserId } from './features/authSlice';
// import type { RootState } from '../_layout';

const COLORS = {
  primary: "#217a3b",
  secondary: "#43a047",
  accent: "#FFD700",
  bg: "#f6fff7",
  card: "#ffffff",
  border: "#b2dfdb",
  text: "#1b3c1a",
  muted: "#a5a5a5",
};

export default function SignInScreen() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
   const navigation = useNavigation();

  const dispatch = useDispatch();
  const userId = useSelector((state) => state.auth.userId);

  const handleSignIn = async() => {
    if (!identifier || !password) {
      Alert.alert("Error", "Please enter your credentials");
      return;
    }

    const res = await login({email:identifier, password:password})

    // console.log(res)

    if (res.status === 200 && res.data.status_code === 200 ){
      dispatch(setUserId(res.data.id))
      Alert.alert('Success', 'Account created successfully');
      setTimeout(() => {
        navigation.navigate('home');
        
      }, 2000);
      return;
    }

    Alert.alert('An error occured');
    // Simulate successful registration
    
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bg, justifyContent: "center", alignItems: "center", padding: 24 }}>
      {/* Logo Section */}
      <View style={{ marginBottom: 32, alignItems: "center" }}>
        <View style={{
          backgroundColor: COLORS.primary,
          borderRadius: 100,
          padding: 18,
          marginBottom: 12,
          shadowColor: COLORS.primary,
          shadowOpacity: 0.15,
          shadowRadius: 10,
        }}>
          <Text style={{ fontSize: 36, color: COLORS.accent, fontWeight: "bold" }}>🌱</Text>
        </View>
        <Text style={{ fontSize: 28, fontWeight: "bold", color: COLORS.primary, letterSpacing: 1 }}>
          Welcome Back!
        </Text>
        <Text style={{ color: COLORS.text, fontSize: 15, marginTop: 4 }}>
          Sign in to continue to AgriEstimator
        </Text>
      </View>

      <View style={{
        backgroundColor: COLORS.card,
        borderRadius: 16,
        padding: 24,
        width: "100%",
        shadowColor: COLORS.primary,
        shadowOpacity: 0.08,
        shadowRadius: 8,
        borderWidth: 1,
        borderColor: COLORS.border,
        marginBottom: 18,
      }}>
        <TextInput
          placeholder="Email or Phone Number"
          value={identifier}
          onChangeText={setIdentifier}
          keyboardType="email-address"
          style={{
            backgroundColor: COLORS.bg,
            borderRadius: 8,
            marginBottom: 16,
            padding: 12,
            borderWidth: 1,
            borderColor: COLORS.border,
            color: COLORS.text,
          }}
          placeholderTextColor={COLORS.muted}
        />
        <TextInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={{
            backgroundColor: COLORS.bg,
            borderRadius: 8,
            marginBottom: 18,
            padding: 12,
            borderWidth: 1,
            borderColor: COLORS.border,
            color: COLORS.text,
          }}
          placeholderTextColor={COLORS.muted}
        />
        <TouchableOpacity
          onPress={handleSignIn}
          style={{
            backgroundColor: COLORS.primary,
            padding: 14,
            borderRadius: 8,
            alignItems: "center",
            marginBottom: 6,
            shadowColor: COLORS.primary,
            shadowOpacity: 0.12,
            shadowRadius: 6,
          }}
        >
          <Text style={{ color: COLORS.accent, fontWeight: "bold", fontSize: 16 }}>Login</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push("/register")}>
          <Text style={{ color: COLORS.secondary, marginTop: 10, textAlign: "center" }}>
            Don't have an account? <Text style={{ color: COLORS.accent, fontWeight: "bold" }}>Register</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}