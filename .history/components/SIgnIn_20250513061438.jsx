import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { useNavigation } from "@react-navigation/native";
import { useDispatch } from "react-redux";
import { setToken } from "../store/authSlice";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const handleSubmit = async () => {
    setError("");
    setLoading(true);
    try {
      const response = await axios.post(
        "http://192.168.1.5:9000/api/auth/signin",
        {
          email,
          password,
        }
      );

      const token = response.data.token;
      if (!token) {
        setError("No token received from server.");
        setLoading(false);
        return;
      }

      await SecureStore.setItemAsync("userToken", token);
      dispatch(setToken(token));

      Alert.alert("Success", "Signed in successfully!");
      // navigation.navigate("Home");
    } catch (err) {
      setError(err.response?.data?.message || "Network error");
      setPassword("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.select({ ios: "padding", android: undefined })}
      style={styles.container}
    >
      <View style={styles.form}>
        <Text style={styles.title}>Welcome Back</Text>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email Address</Text>
          <TextInput
            style={styles.input}
            placeholder="you@example.com"
            placeholderTextColor="#a0aec0"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCompleteType="email"
            value={email}
            onChangeText={setEmail}
            editable={!loading}
            selectionColor="#3b82f6"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="••••••••"
              placeholderTextColor="#a0aec0"
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCompleteType="password"
              value={password}
              onChangeText={setPassword}
              editable={!loading}
              selectionColor="#3b82f6"
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              disabled={loading}
              style={styles.showPasswordButton}
              activeOpacity={0.7}
            >
              <Text style={styles.showPasswordText}>
                {showPassword ? "Hide" : "Show"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.disabledButton]}
          onPress={handleSubmit}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Sign In</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#e6f0ff", // very light blue background
    justifyContent: "center",
    paddingHorizontal: 28,
  },
  form: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    paddingVertical: 36,
    paddingHorizontal: 32,
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 15,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 32,
    color: "#1e40af", // dark blue
    textAlign: "center",
    letterSpacing: 1,
  },
  errorText: {
    color: "#ef4444", // red-500
    marginBottom: 20,
    textAlign: "center",
    fontWeight: "600",
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 15,
    color: "#2563eb", // blue-600
    marginBottom: 8,
    fontWeight: "600",
  },
  input: {
    borderWidth: 1.5,
    borderColor: "#93c5fd", // blue-300
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 17,
    color: "#1e3a8a", // blue-900
    backgroundColor: "#f0f9ff", // very light blue
    fontWeight: "500",
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  showPasswordButton: {
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  showPasswordText: {
    color: "#2563eb", // blue-600
    fontWeight: "700",
    fontSize: 15,
  },
  submitButton: {
    backgroundColor: "#2563eb", // blue-600
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    shadowColor: "#1e40af",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  disabledButton: {
    opacity: 0.65,
  },
  submitButtonText: {
    color: "#ffffff",
    fontWeight: "800",
    fontSize: 18,
    letterSpacing: 0.8,
  },
});
