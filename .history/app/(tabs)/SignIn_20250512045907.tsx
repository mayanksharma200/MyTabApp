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
import { setToken } from "../../store/authSlice"; // Adjust path as needed

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
    if (!email.includes("@")) {
      setError("Please enter a valid email.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      // Sign in to get token
      const response = await axios.post(
        "http://192.168.1.5:9000/api/auth/signin",
        { email, password }
      );

      const token = response.data.token;
      if (!token) {
        setError("No token received from server.");
        setLoading(false);
        return;
      }

      // Verify token by calling /me endpoint
      const meRes = await axios.get("http://192.168.1.5:9000/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (meRes.status !== 200 || !meRes.data?.email) {
        setError("Failed to verify user after login.");
        setLoading(false);
        return;
      }

      // Save token securely
      await SecureStore.setItemAsync("userToken", token);

      // Dispatch token to Redux store
      dispatch(setToken(token));

      Alert.alert("Success", "Signed in successfully!");
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Network or server error occurred."
      );
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
        <Text style={styles.title}>Sign In</Text>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="your@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            value={email}
            onChangeText={setEmail}
            editable={!loading}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="••••••••"
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCompleteType="password"
              value={password}
              onChangeText={setPassword}
              editable={!loading}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              disabled={loading}
              style={styles.showPasswordButton}
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
    backgroundColor: "#f9fafb",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  form: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 24,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 24,
    color: "#1f2937",
    textAlign: "center",
  },
  errorText: {
    color: "#dc2626",
    marginBottom: 16,
    textAlign: "center",
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: "#374151",
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: "#111827",
    backgroundColor: "#fff",
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  showPasswordButton: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  showPasswordText: {
    color: "#f59e0b",
    fontWeight: "600",
  },
  submitButton: {
    backgroundColor: "#f59e0b",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  disabledButton: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});
