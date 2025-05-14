import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import { LinearGradient } from "expo-linear-gradient";
import * as SecureStore from "expo-secure-store";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { clearToken, setToken } from "../store/authSlice"; // Adjust path

const windowWidth = Dimensions.get("window").width;

export default function Navbar({ selectedType, setSelectedType }) {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const token = useSelector((state) => state.auth.token);

  const [menuOpen, setMenuOpen] = useState(false);
  const [signInVisible, setSignInVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingUser, setLoadingUser] = useState(false);
  const [user, setUser] = useState(null); // local user state

  useEffect(() => {
    const loadToken = async () => {
      if (!token) {
        const storedToken = await SecureStore.getItemAsync("userToken");
        if (storedToken) {
          dispatch(setToken(storedToken));
        }
      }
    };
    loadToken();
  }, [dispatch, token]);

  useEffect(() => {
    if (!token) {
      setUser(null);
      return;
    }
    const fetchUser = async () => {
      setLoadingUser(true);
      try {
        const res = await axios.get("http://192.168.1.7:9000/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.status === 200 && res.data?.email) {
          setUser(res.data);
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      } finally {
        setLoadingUser(false);
      }
    };
    fetchUser();
  }, [token]);

  const handleSignIn = async () => {
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
      const response = await axios.post(
        "http://192.168.1.7:9000/api/auth/signin",
        { email, password }
      );

      const receivedToken = response.data.token;
      if (!receivedToken) {
        setError("No token received from server.");
        setLoading(false);
        return;
      }

      await SecureStore.setItemAsync("userToken", receivedToken);
      dispatch(setToken(receivedToken));
      setSignInVisible(false);
      setEmail("");
      setPassword("");
      Alert.alert("Success", "Signed in successfully!");
      navigation.navigate("index");
    } catch (err) {
      const message =
        err.response?.data?.message || "Network or server error occurred.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await SecureStore.deleteItemAsync("userToken");
    dispatch(clearToken());
    setUser(null);
    Alert.alert("Logged out", "You have been logged out.");
    navigation.navigate("index");
  };

  const navItems = [
    { name: "Hot Deals", type: "hot" },
    { name: "Gaming", type: "gaming" },
    { name: "Tech", type: "tech" },
    { name: "Accessories", type: "accessories" },
  ];

  if (loadingUser) {
    return (
      <View style={[styles.navbar, styles.centered]}>
        <ActivityIndicator size="small" color="#fff" />
      </View>
    );
  }

  return (
    <LinearGradient
      colors={["#f59e0b", "#b45309"]}
      start={[0, 0]}
      end={[1, 1]}
      style={styles.navbar}
    >
      <Text style={styles.logo}>OffersConsole</Text>

      {windowWidth < 600 ? (
        <TouchableOpacity
          onPress={() => setMenuOpen(!menuOpen)}
          style={styles.hamburger}
          accessibilityLabel="Toggle menu"
          activeOpacity={0.7}
        >
          <Text style={styles.hamburgerText}>{menuOpen ? "✕" : "☰"}</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.navItems}>
          {navItems.map((item) => (
            <TouchableOpacity
              key={item.type}
              onPress={() => setSelectedType(item.type)}
              style={[
                styles.navItem,
                selectedType === item.type && styles.navItemActive,
              ]}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.navText,
                  selectedType === item.type && styles.navTextActive,
                ]}
              >
                {item.name}
              </Text>
            </TouchableOpacity>
          ))}

          {user ? (
            <TouchableOpacity
              onPress={() => setMenuOpen(!menuOpen)}
              style={styles.userButton}
              activeOpacity={0.8}
            >
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {user.email.charAt(0).toUpperCase()}
                </Text>
              </View>
              <Text style={styles.userEmail}>{user.email}</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => setSignInVisible(true)}
              style={styles.signInButton}
              activeOpacity={0.8}
            >
              <Text style={styles.signInText}>Sign In</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {menuOpen && windowWidth < 600 && (
        <View style={styles.dropdown}>
          <ScrollView>
            {navItems.map((item) => (
              <TouchableOpacity
                key={item.type}
                onPress={() => {
                  setSelectedType(item.type);
                  setMenuOpen(false);
                }}
                style={[
                  styles.dropdownItem,
                  selectedType === item.type && styles.dropdownItemActive,
                ]}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.dropdownText,
                    selectedType === item.type && styles.dropdownTextActive,
                  ]}
                >
                  {item.name}
                </Text>
              </TouchableOpacity>
            ))}
            {user ? (
              <>
                <View style={styles.userInfo}>
                  <Text style={styles.userEmailDropdown}>{user.email}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    handleLogout();
                    setMenuOpen(false);
                  }}
                  style={styles.logoutButton}
                  activeOpacity={0.8}
                >
                  <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity
                onPress={() => {
                  setSignInVisible(true);
                  setMenuOpen(false);
                }}
                style={styles.dropdownItem}
                activeOpacity={0.7}
              >
                <Text style={styles.dropdownText}>Sign In</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>
      )}

      <Modal
        visible={signInVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSignInVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Sign In</Text>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <TextInput
              style={styles.input}
              placeholder="Email"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
              editable={!loading}
              placeholderTextColor="#999"
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              editable={!loading}
              placeholderTextColor="#999"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                onPress={handleSignIn}
                style={[styles.signInButton, { flex: 1, marginRight: 8 }]}
                disabled={loading}
                activeOpacity={0.8}
              >
                {loading ? (
                  <ActivityIndicator color="#f59e0b" />
                ) : (
                  <Text style={styles.signInText}>Submit</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setSignInVisible(false)}
                style={[styles.cancelButton, { flex: 1 }]}
                disabled={loading}
                activeOpacity={0.8}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  navbar: {
    paddingTop: Platform.OS === "ios" ? 50 : 20,
    paddingHorizontal: 20,
    backgroundColor: "#f59e0b",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    position: "relative",
    zIndex: 10,
    shadowColor: "#b45309",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 12,
  },
  logo: {
    fontSize: 26,
    fontWeight: "900",
    color: "#fff",
    letterSpacing: 1.2,
    fontFamily: Platform.OS === "ios" ? "AvenirNext-DemiBold" : "Roboto",
  },
  hamburger: {
    padding: 10,
  },
  hamburgerText: {
    fontSize: 30,
    color: "#fff",
    fontWeight: "900",
  },
  navItems: {
    flexDirection: "row",
    alignItems: "center",
  },
  navItem: {
    marginHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 30,
    paddingHorizontal: 18,
    backgroundColor: "transparent",
    transitionDuration: "300ms",
  },
  navItemActive: {
    backgroundColor: "#fff",
    shadowColor: "#b45309",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  navText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "600",
  },
  navTextActive: {
    color: "#b45309",
    fontWeight: "900",
  },
  signInButton: {
    backgroundColor: "#fff",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 30,
    marginLeft: 20,
    shadowColor: "#b45309",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  signInText: {
    color: "#b45309",
    fontWeight: "900",
    fontSize: 17,
  },
  dropdown: {
    position: "absolute",
    top: Platform.OS === "ios" ? 90 : 70,
    right: 16,
    backgroundColor: "#b45309",
    borderRadius: 12,
    paddingVertical: 14,
    width: 200,
    maxHeight: 280,
    shadowColor: "#000",
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 15,
    zIndex: 20,
  },
  dropdownItem: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  dropdownItemActive: {
    backgroundColor: "#fff",
  },
  dropdownText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "600",
  },
  dropdownTextActive: {
    color: "#b45309",
    fontWeight: "900",
  },
  userButton: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 20,
    backgroundColor: "#fff",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 30,
    shadowColor: "#b45309",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  avatar: {
    backgroundColor: "#b45309",
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarText: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 18,
  },
  userEmail: {
    color: "#b45309",
    fontWeight: "900",
    fontSize: 16,
  },
  userInfo: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomColor: "#fff",
    borderBottomWidth: 1,
  },
  userEmailDropdown: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  logoutButton: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginTop: 12,
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: "center",
    shadowColor: "#b45309",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  logoutText: {
    color: "#b45309",
    fontWeight: "900",
    fontSize: 17,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "#000000cc",
    justifyContent: "center",
    paddingHorizontal: 28,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 28,
    shadowColor: "#b45309",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "900",
    marginBottom: 20,
    textAlign: "center",
    color: "#b45309",
  },
  errorText: {
    color: "#dc2626",
    marginBottom: 16,
    textAlign: "center",
    fontWeight: "700",
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 18,
    marginBottom: 16,
    color: "#333",
  },
  modalButtons: {
    flexDirection: "row",
    marginTop: 12,
  },
  signInButton: {
    backgroundColor: "#b45309",
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  signInText: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 18,
  },
  cancelButton: {
    backgroundColor: "#ddd",
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelText: {
    color: "#555",
    fontWeight: "700",
    fontSize: 18,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
