import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { initializeAuth } from '../services/api';
import { Colors } from '../constants/Colors';

// Global state
let isUserAuthenticated = false;
let authListeners: Array<(value: boolean) => void> = [];

export const getIsAuthenticated = () => isUserAuthenticated;

export const setIsAuthenticated = (value: boolean) => {
  isUserAuthenticated = value;
  // Thông báo cho RootLayout cập nhật lại giao diện
  authListeners.forEach(listener => listener(value));
};

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);
  const [authenticated, setAuthenticated] = useState(isUserAuthenticated);

  useEffect(() => {
    // Đăng ký listener để theo dõi thay đổi Auth
    const listener = (value: boolean) => setAuthenticated(value);
    authListeners.push(listener);

    const bootstrapAuth = async () => {
      try {
        const hasToken = await initializeAuth();
        isUserAuthenticated = hasToken;
        setAuthenticated(hasToken);
      } finally {
        setIsReady(true);
      }
    };

    bootstrapAuth();

    return () => {
      authListeners = authListeners.filter(l => l !== listener);
    };
  }, []);

  if (!isReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary.main} />
      </View>
    );
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.neutral.background,
  },
});