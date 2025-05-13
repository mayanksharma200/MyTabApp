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
  Animated,
  Easing,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { setToken, clearToken } from "../store/authSlice";

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
  const [user, setUser] = useState(null);

  const slideAnim = React.useRef(new Animated.Value(-windowWidth)).current;

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
        const res = await axios.get("http://192.168.1.5:9000/api/auth/me", {
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

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: menuOpen ? 0 : -windowWidth,
      duration: 300,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [menuOpen, slideAnim]);

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
    setMenuOpen(false);
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
        <ActivityIndicator size="small" color="#2563eb" />
      </View>
    );
  }

  return (
    <>
      <View style={styles.navbar}>
        <Text style={styles.logo}>OffersConsole</Text>

        {windowWidth < 600 ? (
          <TouchableOpacity
            onPress={() => setMenuOpen(true)}
            style={styles.hamburger}
            accessibilityLabel="Open menu"
          >
            <Text style={styles.hamburgerText}>☰</Text>
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
                activeOpacity={0.8}
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
                onPress={() => setMenuOpen(true)}
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
      </View>

      {menuOpen && (
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setMenuOpen(false)}
        />
      )}

      <Animated.View
        style={[
          styles.sideMenu,
          {
            transform: [{ translateX: slideAnim }],
          },
        ]}
      >
        <View style={styles.sideMenuHeader}>
          <Text style={styles.sideMenuTitle}>Menu</Text>
          <TouchableOpacity onPress={() => setMenuOpen(false)}>
            <Text style={styles.closeButton}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.sideMenuContent}>
          {navItems.map((item) => (
            <TouchableOpacity
              key={item.type}
              onPress={() => {
                setSelectedType(item.type);
                setMenuOpen(false);
              }}
              style={[
                styles.sideMenuItem,
                selectedType === item.type && styles.sideMenuItemActive,
              ]}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.sideMenuText,
                  selectedType === item.type && styles.sideMenuTextActive,
                ]}
              >
                {item.name}
              </Text>
            </TouchableOpacity>
          ))}

          {user ? (
            <>
              <View style={styles.userInfoSideMenu}>
                <View style={styles.avatarLarge}>
                  <Text style={styles.avatarTextLarge}>
                    {user.email.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <Text style={styles.userEmailSideMenu}>{user.email}</Text>
              </View>
              <TouchableOpacity
                onPress={handleLogout}
                style={styles.logoutButtonSideMenu}
                activeOpacity={0.8}
              >
                <Text style={styles.logoutTextSideMenu}>Logout</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
              onPress={() => {
                setSignInVisible(true);
                setMenuOpen(false);
              }}
              style={styles.sideMenuItem}
              activeOpacity={0.8}
            >
              <Text style={styles.sideMenuText}>Sign In</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </Animated.View>

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
              placeholderTextColor="#94a3b8"
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              editable={!loading}
              placeholderTextColor="#94a3b8"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                onPress={handleSignIn}
                style={[styles.signInButton, { flex: 1, marginRight: 8 }]}
                disabled={loading}
                activeOpacity={0.8}
              >
                {loading ? (
                  <ActivityIndicator color="#2563eb" />
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
    </>
  );
}

const styles = StyleSheet.create({
  navbar: {
    paddingTop: Platform.OS === "ios" ? 44 : 24,
    paddingBottom: Platform.OS === "ios" ? 16 : 16,
    paddingHorizontal: 28,
    backgroundColor: "#1e40af", // blue-900
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    zIndex: 10,
    shadowColor: "#1e3a8a",
    shadowOpacity: 0.5,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 20,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  logo: {
    fontSize: 30,
    fontWeight: "900",
    color: "#e0e7ff", // blue-100
    letterSpacing: 2,
    textAlign: "center",
    flex: 1,
  },
  hamburger: {
    padding: 0,
    position: "absolute",
    right: 28,
    top: Platform.OS === "ios" ? 50 : 30,
  },
  hamburgerText: {
    fontSize: 32,
    color: "#e0e7ff",
    fontWeight: "900",
  },
  navItems: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flex: 2,
  },
  navItem: {
    marginHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    paddingHorizontal: 18,
    transitionDuration: "300ms",
  },
  navItemActive: {
    backgroundColor: "#2563eb", // blue-600
    shadowColor: "#2563eb",
    shadowOpacity: 0.9,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 20,
    elevation: 15,
  },
  navText: {
    color: "#c7d2fe", // blue-200
    fontSize: 18,
    fontWeight: "600",
  },
  navTextActive: {
    color: "#fbbf24", // yellow-400
    fontWeight: "bold",
  },
  signInButton: {
    backgroundColor: "#e0e7ff", // blue-100
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 20,
    marginLeft: 22,
    shadowColor: "#2563eb",
    shadowOpacity: 0.5,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 20,
    elevation: 15,
  },
  signInText: {
    color: "#1e40af", // blue-900
    fontWeight: "bold",
    fontSize: 18,
  },
  userButton: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 22,
    backgroundColor: "#e0e7ff",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 32,
    shadowColor: "#2563eb",
    shadowOpacity: 0.6,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 20,
    elevation: 18,
  },
  avatar: {
    backgroundColor: "#2563eb",
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
    shadowColor: "#2563eb",
    shadowOpacity: 0.9,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 18,
    elevation: 20,
  },
  avatarText: {
    color: "#e0e7ff",
    fontWeight: "900",
    fontSize: 22,
  },
  userEmail: {
    color: "#2563eb",
    fontWeight: "700",
    fontSize: 18,
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  overlay: {
    position: "absolute",
    top: Platform.OS === "ios" ? 90 : 70,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#000000cc",
    zIndex: 15,
  },
  sideMenu: {
    position: "absolute",
    top: Platform.OS === "ios" ? 90 : 70,
    bottom: 0,
    left: 0,
    width: windowWidth * 0.75,
    backgroundColor: "#f0f5ff", // light blue background
    zIndex: 20,
    shadowColor: "#2563eb",
    shadowOpacity: 0.7,
    shadowOffset: { width: 3, height: 0 },
    shadowRadius: 20,
    elevation: 30,
    borderTopRightRadius: 28,
    borderBottomRightRadius: 28,
  },
  sideMenuHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 28,
    paddingVertical: 24,
    borderBottomColor: "#2563eb",
    borderBottomWidth: 3,
  },
  sideMenuTitle: {
    fontSize: 26,
    fontWeight: "900",
    color: "#2563eb",
  },
  closeButton: {
    fontSize: 36,
    color: "#2563eb",
    fontWeight: "900",
  },
  sideMenuContent: {
    paddingTop: 18,
  },
  sideMenuItem: {
    paddingVertical: 20,
    paddingHorizontal: 32,
    borderRadius: 20,
    marginHorizontal: 18,
    marginVertical: 8,
    transitionDuration: "300ms",
  },
  sideMenuItemActive: {
    backgroundColor: "#2563eb",
  },
  sideMenuText: {
    fontSize: 22,
    fontWeight: "600",
    color: "#1e293b", // slate-900
  },
  sideMenuTextActive: {
    color: "#fff",
    fontWeight: "bold",
  },
  userInfoSideMenu: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 32,
    paddingVertical: 28,
    borderTopColor: "#c7d2fe",
    borderTopWidth: 1,
    marginTop: 28,
  },
  avatarLarge: {
    backgroundColor: "#2563eb",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 24,
    shadowColor: "#2563eb",
    shadowOpacity: 0.95,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 24,
    elevation: 25,
  },
  avatarTextLarge: {
    color: "#e0e7ff",
    fontWeight: "900",
    fontSize: 28,
  },
  userEmailSideMenu: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1e293b",
  },
  logoutButtonSideMenu: {
    backgroundColor: "#2563eb",
    marginHorizontal: 32,
    marginTop: 32,
    paddingVertical: 18,
    borderRadius: 24,
    alignItems: "center",
    shadowColor: "#1e40af",
    shadowOpacity: 0.95,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 24,
    elevation: 25,
  },
  logoutTextSideMenu: {
    color: "#e0e7ff",
    fontWeight: "900",
    fontSize: 22,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "#000000dd",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  modalContent: {
    backgroundColor: "#f0f5ff",
    borderRadius: 24,
    padding: 36,
    shadowColor: "#2563eb",
    shadowOpacity: 0.6,
    shadowOffset: { width: 0, height: 12 },
    shadowRadius: 28,
    elevation: 30,
  },
  modalTitle: {
    fontSize: 30,
    fontWeight: "900",
    marginBottom: 28,
    textAlign: "center",
    color: "#2563eb",
    letterSpacing: 1.2,
  },
  errorText: {
    color: "#dc2626",
    marginBottom: 24,
    textAlign: "center",
    fontWeight: "700",
    fontSize: 16,
  },
  input: {
    borderWidth: 2,
    borderColor: "#93c5fd",
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingVertical: 18,
    fontSize: 20,
    marginBottom: 24,
    backgroundColor: "#e0e7ff",
    color: "#1e40af",
    fontWeight: "700",
    shadowColor: "#2563eb",
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 16,
    elevation: 12,
  },
  modalButtons: {
    flexDirection: "row",
    marginTop: 20,
  },
  cancelButton: {
    backgroundColor: "#cbd5e1",
    paddingVertical: 18,
    borderRadius: 24,
    alignItems: "center",
  },
  cancelText: {
    color: "#1e293b",
    fontWeight: "700",
    fontSize: 18,
  },
});
