import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";

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

export default function Index() {
  const navigation = useNavigation();
  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image
          source={require("../assets/images/land.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>AgriEstimator</Text>
        <Text style={styles.subtitle}>
          Farming Made Simple. Pricing Made Fair.
        </Text>
      </View>
      <View style={styles.buttonGroup}>
        <TouchableOpacity
          style={styles.loginBtn}
          onPress={() => navigation.navigate("login")}
        >
          <Text style={styles.loginText}>Login</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.registerBtn}
          onPress={() => navigation.navigate("register")}
        >
          <Text style={styles.registerText}>Register</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.footer}>Empowering Farmers • 2025</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 48,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 18,
    borderRadius: 100,
    borderWidth: 3,
    borderColor: COLORS.accent,
    backgroundColor: COLORS.card,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: COLORS.primary,
    letterSpacing: 2,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.secondary,
    fontWeight: "600",
    marginBottom: 8,
    textAlign: "center",
  },
  buttonGroup: {
    width: "100%",
    marginBottom: 32,
  },
  loginBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 14,
    marginBottom: 16,
    alignItems: "center",
    shadowColor: COLORS.primary,
    shadowOpacity: 0.10,
    shadowRadius: 6,
    elevation: 2,
  },
  loginText: {
    color: COLORS.accent,
    fontWeight: "bold",
    fontSize: 18,
    letterSpacing: 1,
  },
  registerBtn: {
    backgroundColor: COLORS.accent,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    shadowColor: COLORS.accent,
    shadowOpacity: 0.10,
    shadowRadius: 6,
    elevation: 2,
  },
  registerText: {
    color: COLORS.primary,
    fontWeight: "bold",
    fontSize: 18,
    letterSpacing: 1,
  },
  footer: {
    position: "absolute",
    bottom: 24,
    left: 0,
    right: 0,
    textAlign: "center",
    color: COLORS.muted,
    fontSize: 14,
    letterSpacing: 1,
  },
});
