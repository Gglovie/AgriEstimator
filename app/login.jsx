// src/screens/SignInScreen.js
import React, { useState } from "react";
import { View, Text, Button, Alert, SafeAreaView } from "react-native";
import InputField from "./components/InputField";
import { useNavigation } from "@react-navigation/native";

export default function SignInScreen() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const navigation = useNavigation();

  const handleSignIn = () => {
    if (!identifier || !password) {
      Alert.alert("Error", "Please enter your credentials");
      return;
    }

    // Simulate successful login
    Alert.alert("Success", "Logged in successfully");
    navigation.navigate("Home");
  };

  return (
    <SafeAreaView className="bg-green-950 min-h-screen flex-1 justify-center items-center">
      <View className="bg-white w-[300px] p-8 rounded-lg">
        <Text className="text-3xl font-bold text-green-800 mb-6">
          AgriEstimator
        </Text>
        <InputField
          label="Email or Phone Number"
          value={identifier}
          onChangeText={setIdentifier}
          keyboardType="email-address"
          className="w-full bg-gray-200  rounded-lg"
        />
        <InputField
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          className="w-full bg-gray-200  rounded-lg"
        />
        <Button title="Sign In" onPress={handleSignIn} color="#16a34a"  className="rounded-lg"/>
        <Text
          className="mt-4 text-green-700"
          onPress={() => navigation.navigate("register")}
        >
          Don't have an account? <Text className="underline text-green-950">Sign Up</Text>
        </Text>
      </View>
    </SafeAreaView>
  );
}
