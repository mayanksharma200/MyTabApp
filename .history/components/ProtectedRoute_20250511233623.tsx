import axios from "axios";
import * as SecureStore from "expo-secure-store";
import React, { ReactNode, useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";

interface ProtectedRouteProps {
  children: ReactNode;
  navigation: any;
}

export default function ProtectedRoute({
  children,
  navigation,
}: ProtectedRouteProps) {
  const [auth, setAuth] = useState<boolean | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = await SecureStore.getItemAsync("userToken");
      setToken(storedToken);
      if (!storedToken) {
        setAuth(false);
        return;
      }
      try {
        const res = await axios.get("http://192.168.1.5:9000/auth/check", {
          headers: { Authorization: `Bearer ${storedToken}` },
        });
        setAuth(res.status === 200);
      } catch {
        setAuth(false);
      }
    };
    checkAuth();
  }, []);

  if (auth === null) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!auth) {
    navigation.replace("SignIn");
    return null;
  }

  return <>{children}</>;
}
