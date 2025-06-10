// app/_layout.tsx
import { Stack } from "expo-router";
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { PersistGate } from 'redux-persist/integration/react';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import authReducer from './features/authSlice';
import './global.css';

// Persist config
const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
};

// Create persisted reducer
const persistedReducer = persistReducer(persistConfig, authReducer);

// Configure store
const store = configureStore({
  reducer: {
    auth: persistedReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

const persistor = persistStore(store);

export default function RootLayout() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <Stack
          initialRouteName="login"
          screenOptions={{ headerShown: false }}
        >
          <Stack.Screen name="login" />
          <Stack.Screen name="register" />
          <Stack.Screen name="home" />  
          <Stack.Screen name="MarketTrends" />
        </Stack>
      </PersistGate>
    </Provider>
  );
}

// TypeScript types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;