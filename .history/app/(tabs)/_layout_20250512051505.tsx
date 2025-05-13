import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import HomeScreen from "./index";
import ShopEarnScreen from "./shopEarn";
import ExploreScreen from "./explore";
// import SignIn from "./SignIn";

const Tab = createBottomTabNavigator();

export default function TabsLayout() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => {
        let iconName: keyof typeof Ionicons.glyphMap;

        if (route.name === "Home") iconName = "home";
        else if (route.name === "ShopEarn") iconName = "cash";
        else if (route.name === "Explore") iconName = "search";
        // else if (route.name === "Profile") iconName = "person";
        // else if (route.name === "SignIn") iconName = "log-in";
        else iconName = "alert";

        return {
          tabBarIcon: ({ color, size }) => (
            <Ionicons name={iconName} size={size} color={color} />
          ),
          tabBarActiveTintColor: "#f59e0b",
          tabBarInactiveTintColor: "gray",
          headerShown: false,
        };
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="ShopEarn" component={ShopEarnScreen} />
      <Tab.Screen name="Explore" component={ExploreScreen} />
      {/* <Tab.Screen name="Profile" component={ProfileScreen} /> */}
      {/* <Tab.Screen name="SignIn" component={SignIn} /> */}
    </Tab.Navigator>
  );
}
