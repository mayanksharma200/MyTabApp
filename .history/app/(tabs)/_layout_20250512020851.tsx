import React from "react";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => {
        let iconName: keyof typeof Ionicons.glyphMap;

        if (route.name === "index") {
          iconName = "home";
        } else if (route.name === "shopEarn") {
          iconName = "cash";
        } else if (route.name === "explore") {
          iconName = "search";
        } else if (route.name === "profile") {
          iconName = "person";
        } else {
          iconName = "alert"; // fallback icon
        }

        return {
          tabBarIcon: ({ color, size }) => (
            <Ionicons name={iconName} size={size} color={color} />
          ),
          tabBarActiveTintColor: "#f59e0b",
          tabBarInactiveTintColor: "gray",
          headerShown: false,
        };
      }}
    />
  );
}
