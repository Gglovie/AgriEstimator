// src/components/InputField.js
import React, { useState } from 'react';
import { TextInput, View, TouchableOpacity, Text } from 'react-native';

export default function InputField({ label, secureTextEntry, ...props }) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  return (
    <View className="mb-4">
      <Text className="text-green-700 font-bold mb-1">{label}</Text>
      <TextInput
        className="border border-green-500 rounded-lg px-4 py-2 text-green-900"
        secureTextEntry={secureTextEntry && !isPasswordVisible}
        {...props}
      />
      {secureTextEntry && (
        <TouchableOpacity
          onPress={() => setIsPasswordVisible(!isPasswordVisible)}
          className="absolute right-4 top-10"
        >
          <Text className="text-green-600">
            {isPasswordVisible ? 'Hide' : 'Show'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}