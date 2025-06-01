// src/screens/SignUpScreen.js
import React, { useState } from 'react';
import { View, Text, Button, Alert, SafeAreaView } from 'react-native';
import InputField from './components/InputField';
import { useNavigation } from '@react-navigation/native';

export default function SignUpScreen() {
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigation = useNavigation();

  const handleSignUp = () => {
    if (!username || !phone || !email || !password) {
      Alert.alert('Error', 'All fields are required');
      return;
    }

    // Simulate successful registration
    Alert.alert('Success', 'Account created successfully');
    navigation.navigate('Home');
  };

  return (
    <SafeAreaView className="flex-1 justify-center items-center bg-green-950">
      <View className="bg-white w-[300px] p-6 rounded-lg ">
      <Text className="text-3xl font-bold text-green-800 mb-6">AgriEstimator</Text>
      <InputField className="w-full bg-gray-200 rounded-lg" label="Username" value={username} onChangeText={setUsername} />
      <InputField className="w-full bg-gray-200 rounded-lg" label="Phone Number" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
      <InputField className="w-full bg-gray-200 rounded-lg" label="Email Address" value={email} onChangeText={setEmail} keyboardType="email-address" />
      <InputField className="w-full bg-gray-200 rounded-lg" label="Password" value={password} onChangeText={setPassword} secureTextEntry />
      <Button title="Sign Up" onPress={handleSignUp} color="#16a34a" className="rounded-lg"/>
      <Text className="mt-4 text-green-700 w-full" onPress={() => navigation.navigate('login')}>
        Already have an account? <Text className="underline text-green-950">Sign Up</Text>
      </Text>
    </View>
    </SafeAreaView>
  );
}