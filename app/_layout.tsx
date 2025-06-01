import { Stack } from "expo-router";
import './global.css';

export default function RootLayout() {
  return(
    <Stack>
      <Stack.Screen name="index" />
      <Stack.Screen name="index1" />
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="MarketTrends" />
    </Stack>

  );
}
