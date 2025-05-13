import { useNavigation } from "@react-navigation/native";
import axios from "axios";
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
import { useSelector, useDispatch } from "react-redux";
import { setToken, clearToken } from "../store/authSlice"; // Adjust path

const windowWidth = Dimensions.get("window").width;

export default function Navbar() {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const token = useSelector((state) => state.auth.token);

  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedType, setSelectedType] = useState("hot");a
  const [signInVisible, setSignInVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingUser, setLoadingUser] = useState(false);
  const [user, setUser] = useState(null); // local user state

  // Load token from SecureStore on mount and dispatch to Redux if not set
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

  // Fetch user info when token changes, store locally
  useEffect(() => {
    if (!token) {
      setUser(null);
      return;
    }
    const fetchUser = async () => {
      setLoadingUser(true);
      try {
        const res = await axios.get("http://192.168.1.5:9000/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.status === 200 && res.data?.email) {
          setUser(res.data);
        } else {
          setUser(null);
        }
      } catch (error) {
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
        "http://192.168.1.5:9000/api/auth/signin",
        {
          email,
          password,
        }
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
    <View style={styles.navbar}>
      <Text style={styles.logo}>OffersConsole</Text>

      {windowWidth < 600 ? (
        <TouchableOpacity
          onPress={() => setMenuOpen(!menuOpen)}
          style={styles.hamburger}
          accessibilityLabel="Toggle menu"
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
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              editable={!loading}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                onPress={handleSignIn}
                style={[styles.signInButton, { flex: 1, marginRight: 8 }]}
                disabled={loading}
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
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  navbar: {
    paddingTop: Platform.OS === "ios" ? 50 : 20,
    paddingHorizontal: 16,
    backgroundColor: "#f59e0b",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    position: "relative",
    zIndex: 10,
  },
  logo: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
  },
  hamburger: {
    padding: 8,
  },
  hamburgerText: {
    fontSize: 28,
    color: "#fff",
  },
  navItems: {
    flexDirection: "row",
    alignItems: "center",
  },
  navItem: {
    marginHorizontal: 10,
    paddingVertical: 8,
  },
  navItemActive: {
    borderBottomWidth: 2,
    borderBottomColor: "#fff",
  },
  navText: {
    color: "#fff",
    fontSize: 16,
  },
  navTextActive: {
    fontWeight: "bold",
  },
  signInButton: {
    backgroundColor: "#fff",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
    marginLeft: 10,
  },
  signInText: {
    color: "#f59e0b",
    fontWeight: "bold",
    fontSize: 16,
  },
  dropdown: {
    position: "absolute",
    top: Platform.OS === "ios" ? 90 : 70,
    right: 16,
    backgroundColor: "#f59e0b",
    borderRadius: 8,
    paddingVertical: 10,
    width: 180,
    maxHeight: 250,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
    zIndex: 20,
  },
  dropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  dropdownItemActive: {
    backgroundColor: "#fff",
  },
  dropdownText: {
    color: "#fff",
    fontSize: 16,
  },
  dropdownTextActive: {
    color: "#f59e0b",
    fontWeight: "bold",
  },
  userButton: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 10,
  },
  avatar: {
    backgroundColor: "#fff",
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  avatarText: {
    color: "#f59e0b",
    fontWeight: "bold",
    fontSize: 16,
  },
  userEmail: {
    color: "#fff",
    fontWeight: "600",
  },
  userInfo: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomColor: "#fff",
    borderBottomWidth: 1,
  },
  userEmailDropdown: {
    color: "#fff",
    fontWeight: "600",
  },
  logoutButton: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 8,
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: "center",
  },
  logoutText: {
    color: "#f59e0b",
    fontWeight: "bold",
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "#00000099",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 24,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 16,
    textAlign: "center",
  },
  errorText: {
    color: "#dc2626",
    marginBottom: 12,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 12,
  },
  modalButtons: {
    flexDirection: "row",
    marginTop: 8,
  },
  cancelButton: {
    backgroundColor: "#ddd",
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: "center",
  },
  cancelText: {
    color: "#333",
    fontWeight: "600",
  },
});
