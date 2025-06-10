// src/screens/SignUpScreen.js
import React, { useState } from 'react';
import { View, Text, Button, SafeAreaView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { register } from './utils';
// import { id } from 'paths-js/ops';

import { useDispatch, useSelector } from 'react-redux';
import { setUserId, clearUserId } from './features/authSlice';

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

export default function SignUpScreen() {
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigation = useNavigation();

  const dispatch = useDispatch();
  const userId = useSelector((state) => state.auth.userId);

  const handleSignUp = async() => {
    if (!username || !phone || !email || !password) {
      Alert.alert('Error', 'All fields are required');
      return;
    }

    const res = await register({username: username, phone:phone, email:email, password:password})

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
    <SafeAreaView className="flex-1 justify-center items-center bg-green-950">
      <View className="bg-white w-full p-6 rounded-lg ">
      {/* <Text className="text-3xl font-bold text-green-800 mb-6">AgriEstimator</Text> */}
      <Text>{userId}</Text>
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
          <Text style={{ fontSize: 36, color: COLORS.accent, fontWeight: "bold" }}>🌾</Text>
        </View>
        <Text style={{ fontSize: 28, fontWeight: "bold", color: COLORS.primary, letterSpacing: 1 }}>
          Create Account
        </Text>
        <Text style={{ color: COLORS.text, fontSize: 15, marginTop: 4 }}>
          Join AgriEstimator and grow your farm!
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
          placeholder="Username"
          value={username}
          onChangeText={setUsername}
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
          placeholder="Phone Number"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
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
          placeholder="Email Address"
          value={email}
          onChangeText={setEmail}
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
          onPress={handleSignUp}
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
          <Text style={{ color: COLORS.accent, fontWeight: "bold", fontSize: 16 }}>Sign Up</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('login')}>
          <Text style={{ color: COLORS.secondary, marginTop: 10, textAlign: "center" }}>
            Already have an account? <Text style={{ color: COLORS.accent, fontWeight: "bold" }}>Login</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </View>
    </SafeAreaView>
  );
}