import React, { createContext, useState, useEffect, ReactNode } from "react";
import * as SecureStore from "expo-secure-store";

// Define the shape of the context value
interface AuthContextType {
  token: string | null;
  setToken: (token: string | null) => void;
}

// Create the context with default values
export const AuthContext = createContext<AuthContextType>({
  token: null,
  setToken: () => {},
});

// Define props type for AuthProvider
interface AuthProviderProps {
  children: ReactNode;
}

// AuthProvider component that provides token state and setter
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const loadToken = async () => {
      try {
        const savedToken = await SecureStore.getItemAsync("userToken");
        setToken(savedToken);
      } catch (error) {
        console.error("Failed to load token from SecureStore", error);
      }
    };
    loadToken();
  }, []);

  return (
    <AuthContext.Provider value={{ token, setToken }}>
      {children}
    </AuthContext.Provider>
  );
};
