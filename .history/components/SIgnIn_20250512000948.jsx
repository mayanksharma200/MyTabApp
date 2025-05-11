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

export default function UserSignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  const handleSubmit = async () => {
    setError("");
    setLoading(true);
    try {
      const response = await axios.post("http://192.168.1.5:9000/api/auth/signin", {
        email,
        password,
      });

      const token = response.data.token;
      if (!token) {
        setError("No token received from server.");
        setLoading(false);
        return;
      }

      await SecureStore.setItemAsync("userToken", token);
      Alert.alert("Success", "Signed in successfully!");
      navigation.navigate("Home");
    } catch (err) {
      setError(err.response?.data?.message || "Network error");
      setPassword("");
    } finally {
      setLoading(false);
    }
  };