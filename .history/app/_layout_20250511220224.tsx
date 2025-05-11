import React, { useState, useEffect } from "react";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/useColorScheme";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  // Simulated auth state; replace with your real auth logic or context
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    // Simulate async auth check (replace with real check)
    const checkAuth = async () => {
      // e.g., await fetch user from storage or API
      // For demo, assume authenticated after 1s
      setTimeout(() => setIsAuthenticated(true), 1000);
    };
    checkAuth();
  }, []);

  if (!loaded || isAuthenticated === null) {
    // Show nothing or splash screen while loading fonts or auth state
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        {isAuthenticated ? (
          // Authenticated user sees main tabs
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        ) : (
          // Unauthenticated user sees auth screens (sign-in, sign-up)
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        )}
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}