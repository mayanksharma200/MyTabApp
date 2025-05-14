import "../global.cs"; // Import Tailwind CSS styles

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

import { useColorScheme } from "@/hooks/useColorScheme";
import AuthLoader from "../components/AuthLoader";
import SignIn from "../components/SignIn"; // also fix casing here
import TabsLayout from "./(tabs)/_layout";

function AppContent() {
  const colorScheme = useColorScheme();
  const token = useSelector((state: RootState) => state.auth.token);

  if (!token) {
    return <SignIn />;
  }

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
