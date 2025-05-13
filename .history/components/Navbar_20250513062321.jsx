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

  // Animation value for side menu
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
      } catch (error) {
        setUser(null);
      } finally {
        setLoadingUser(false);
      }
    };
    fetchUser();
  }, [token]);

  // Animate menu open/close
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
      // navigation.navigate("Home");
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
    // navigation.navigate("Home");
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
      </View>

      {/* Side Menu Overlay */}
      {menuOpen && (
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setMenuOpen(false)}
        />
      )}

      {/* Side Menu */}
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
    paddingTop: Platform.OS === "ios" ? 40 : 20,
    paddingBottom: Platform.OS === "ios" ? 14 : 14,
    paddingHorizontal: 24,
    backgroundColor: "#2563eb", // blue-600
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    zIndex: 10,
    shadowColor: "#1e40af",
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 12,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  logo: {
    fontSize: 28,
    fontWeight: "900",
    color: "#fff",
    letterSpacing: 2,
    textAlign: "center",
    flex: 1,
  },
  hamburger: {
    padding: 0,
    position: "absolute",
    right: 24,
    top: Platform.OS === "ios" ? 45 : 25,
  },
  hamburgerText: {
    fontSize: 30,
    color: "#fff",
    fontWeight: "900",
  },
  navItems: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flex: 2,
  },
  navItem: {
    marginHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    paddingHorizontal: 14,
    transitionDuration: "300ms",
  },
  navItemActive: {
    backgroundColor: "#1e40af", // blue-900
    shadowColor: "#1e40af",
    shadowOpacity: 0.8,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 15,
    elevation: 10,
  },
  navText: {
    color: "#dbeafe", // blue-100
    fontSize: 17,
    fontWeight: "600",
  },
  navTextActive: {
    color: "#fbbf24", // yellow-400
    fontWeight: "bold",
  },
  signInButton: {
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
    marginLeft: 18,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 10,
    elevation: 6,
  },
  signInText: {
    color: "#2563eb",
    fontWeight: "bold",
    fontSize: 18,
  },
  userButton: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 18,
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 28,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 10,
    elevation: 7,
  },
  avatar: {
    backgroundColor: "#2563eb",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
    shadowColor: "#2563eb",
    shadowOpacity: 0.9,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 10,
  },
  avatarText: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 20,
  },
  userEmail: {
    color: "#2563eb",
    fontWeight: "700",
    fontSize: 17,
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
    backgroundColor: "#00000099",
    zIndex: 15,
  },
  sideMenu: {
    position: "absolute",
    top: Platform.OS === "ios" ? 90 : 70,
    bottom: 0,
    left: 0,
    width: windowWidth * 0.75,
    backgroundColor: "#fff",
    zIndex: 20,
    shadowColor: "#2563eb",
    shadowOpacity: 0.5,
    shadowOffset: { width: 3, height: 0 },
    shadowRadius: 15,
    elevation: 25,
    borderTopRightRadius: 24,
    borderBottomRightRadius: 24,
  },
  sideMenuHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomColor: "#2563eb",
    borderBottomWidth: 3,
  },
  sideMenuTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: "#2563eb",
  },
  closeButton: {
    fontSize: 32,
    color: "#2563eb",
    fontWeight: "900",
  },
  sideMenuContent: {
    paddingTop: 14,
  },
  sideMenuItem: {
    paddingVertical: 18,
    paddingHorizontal: 28,
    borderRadius: 14,
    marginHorizontal: 14,
    marginVertical: 6,
    transitionDuration: "300ms",
  },
  sideMenuItemActive: {
    backgroundColor: "#2563eb",
  },
  sideMenuText: {
    fontSize: 20,
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
    paddingHorizontal: 28,
    paddingVertical: 24,
    borderTopColor: "#e0e7ff",
    borderTopWidth: 1,
    marginTop: 24,
  },
  avatarLarge: {
    backgroundColor: "#2563eb",
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 20,
    shadowColor: "#2563eb",
    shadowOpacity: 0.9,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 12,
    elevation: 15,
  },
  avatarTextLarge: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 26,
  },
  userEmailSideMenu: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1e293b",
  },
  logoutButtonSideMenu: {
    backgroundColor: "#2563eb",
    marginHorizontal: 28,
    marginTop: 28,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#1e40af",
    shadowOpacity: 0.9,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 15,
    elevation: 20,
  },
  logoutTextSideMenu: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 20,
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
    padding: 32,
    shadowColor: "#2563eb",
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 20,
    elevation: 20,
  },
  modalTitle: {
    fontSize: 28,
    fontWeight: "900",
    marginBottom: 24,
    textAlign: "center",
    color: "#2563eb",
    letterSpacing: 1,
  },
  errorText: {
    color: "#dc2626",
    marginBottom: 20,
    textAlign: "center",
    fontWeight: "700",
  },
  input: {
    borderWidth: 1.5,
    borderColor: "#93c5fd",
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: 18,
    marginBottom: 20,
    backgroundColor: "#f0f5ff",
    color: "#1e40af",
    fontWeight: "600",
    shadowColor: "#2563eb",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 6,
  },
  modalButtons: {
    flexDirection: "row",
    marginTop: 16,
  },
  cancelButton: {
    backgroundColor: "#cbd5e1",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  cancelText: {
    color: "#1e293b",
    fontWeight: "700",
    fontSize: 18,
  },
});
