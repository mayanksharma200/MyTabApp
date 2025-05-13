import React from "react";
import { Provider, useSelector } from "react-redux";
import { store, RootState } from "../store";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import { styled } from "nativewind";

import { useColorScheme } from "@/hooks/useColorScheme";
import AuthLoader from "../components/AuthLoader"; // loads token from SecureStore
import SignIn from "../components/SIgnIn"; // your sign-in screen
import TabsLayout from "./(tabs)/_layout";
function AppContent() {
  const colorScheme = useColorScheme();
  const token = useSelector((state: RootState) => state.auth.token);

  if (!token) {
    // No token, show sign-in screen
    return <SignIn />;
  }

  // Token exists, show main app
  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <TabsLayout />
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  if (!loaded) {
    return null;
  }

  return (
    <Provider store={store}>
      <AuthLoader />
      <AppContent />
    </Provider>
  );
}
