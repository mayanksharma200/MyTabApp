import React, { useEffect, useState, ReactNode } from "react";
import { View, ActivityIndicator } from "react-native";
import axios from "axios";
import type { NavigationProp } from "@react-navigation/native";

interface ProtectedRouteProps {
  children: ReactNode;
  navigation: NavigationProp<any>;
}

export default function ProtectedRoute({
  children,
  navigation,
}: ProtectedRouteProps) {
  // auth state: null = loading, true = authenticated, false = not authenticated
  const [auth, setAuth] = useState<boolean | null>(null);

  useEffect(() => {
    axios
      .get("http://your-api-url/api/auth/check", { withCredentials: true })
      .then((res) => setAuth(res.status === 200))
      .catch(() => setAuth(false));
  }, []);

  if (auth === null) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!auth) {
    // navigation.replace("SignIn");
    return null;
  }

  return <>{children}</>;
}
