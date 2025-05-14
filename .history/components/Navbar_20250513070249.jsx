import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Easing,
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
import { clearToken, setToken } from "../store/authSlice";

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
        const res = await axios.get("http://192.168.1.7:9000/api/auth/me", {
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
        "http://192.168.1.7:9000/api/auth/signin",
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
        <ActivityIndicator size="small" color="#fff" />
      </View>
    );
  }

  return (
    <>
      <View style={styles.navbar}>
        <View style={styles.logoContainer}>
          {/* Simple premium logo: a stylized flame icon */}
          <View style={styles.logoIcon}>
            <View style={styles.flameTop} />
            <View style={styles.flameBottom} />
          </View>
          <Text style={styles.logo}>OffersConsole</Text>
        </View>

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
    </>
  );
}

const styles = StyleSheet.create({
  navbar: {
    paddingTop: Platform.OS === "ios" ? 40 : 15,
    paddingBottom: Platform.OS === "ios" ? 15 : 15,
    paddingHorizontal: 30,
    backgroundColor: "#f59e0b",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    zIndex: 10,
    shadowColor: "#000",
    shadowOpacity: 0.35,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 12,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    justifyContent: "flex-start", // changed from 'center' to 'flex-start'
    paddingLeft: 10, // added some left padding to move it slightly right from edge
  },
  logoIcon: {
    width: 36,
    height: 36,
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  flameTop: {
    position: "absolute",
    top: 0,
    left: 10,
    width: 16,
    height: 24,
    backgroundColor: "#fff",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    transform: [{ rotate: "20deg" }],
    shadowColor: "#fff",
    shadowOpacity: 0.9,
    shadowRadius: 8,
    elevation: 10,
  },
  flameBottom: {
    position: "absolute",
    bottom: 0,
    left: 6,
    width: 24,
    height: 24,
    backgroundColor: "#f59e0b",
    borderRadius: 12,
    shadowColor: "#f59e0b",
    shadowOpacity: 0.9,
    shadowRadius: 10,
    elevation: 12,
  },
  logo: {
    fontSize: 28,
    fontWeight: "900",
    color: "#fff",
    letterSpacing: 2,
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 6,
  },
  hamburger: {
    padding: 0,
    position: "absolute",
    right: 30,
    top: Platform.OS === "ios" ? 45 : 20,
  },
  hamburgerText: {
    fontSize: 4,
    color: "#fff",
    fontWeight: "900",
    textShadowColor: "rgba(0,0,0,0.4)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },
  navItems: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flex: 2,
  },
  navItem: {
    marginHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    paddingHorizontal: 14,
    backgroundColor: "transparent",
    transitionDuration: "300ms",
  },
  navItemActive: {
    backgroundColor: "#fff",
    shadowColor: "#f59e0b",
    shadowOpacity: 0.9,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 14,
    elevation: 10,
  },
  navText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.8,
  },
  navTextActive: {
    color: "#f59e0b",
    fontWeight: "900",
  },
  signInButton: {
    backgroundColor: "#fff",
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 14,
    marginLeft: 20,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 8,
  },
  signInText: {
    color: "#f59e0b",
    fontWeight: "900",
    fontSize: 18,
    letterSpacing: 1,
  },
  userButton: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 20,
    backgroundColor: "#fff",
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 28,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 10,
  },
  avatar: {
    backgroundColor: "#f59e0b",
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
    shadowColor: "#f59e0b",
    shadowOpacity: 0.95,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 12,
    elevation: 14,
  },
  avatarText: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 20,
    letterSpacing: 1,
  },
  userEmail: {
    color: "#f59e0b",
    fontWeight: "800",
    fontSize: 18,
    letterSpacing: 0.5,
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
    backgroundColor: "#fff",
    zIndex: 20,
    shadowColor: "#000",
    shadowOpacity: 0.5,
    shadowOffset: { width: 4, height: 0 },
    shadowRadius: 14,
    elevation: 24,
    borderTopRightRadius: 30,
    borderBottomRightRadius: 30,
  },
  sideMenuHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 28,
    paddingVertical: 22,
    borderBottomColor: "#f59e0b",
    borderBottomWidth: 3,
  },
  sideMenuTitle: {
    fontSize: 26,
    fontWeight: "900",
    color: "#f59e0b",
    letterSpacing: 1.5,
  },
  closeButton: {
    fontSize: 32,
    color: "#f59e0b",
    fontWeight: "900",
  },
  sideMenuContent: {
    paddingTop: 14,
  },
  sideMenuItem: {
    paddingVertical: 20,
    paddingHorizontal: 28,
    borderRadius: 14,
    marginHorizontal: 16,
    marginVertical: 6,
    backgroundColor: "transparent",
  },
  sideMenuItemActive: {
    backgroundColor: "#f59e0b",
    shadowColor: "#f59e0b",
    shadowOpacity: 0.9,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 14,
    elevation: 12,
  },
  sideMenuText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
    letterSpacing: 0.5,
  },
  sideMenuTextActive: {
    color: "#fff",
    fontWeight: "900",
  },
  userInfoSideMenu: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 28,
    paddingVertical: 26,
    borderTopColor: "#eee",
    borderTopWidth: 1,
    marginTop: 28,
  },
  avatarLarge: {
    backgroundColor: "#f59e0b",
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 20,
    shadowColor: "#f59e0b",
    shadowOpacity: 0.95,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 14,
    elevation: 16,
  },
  avatarTextLarge: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 26,
    letterSpacing: 1,
  },
  userEmailSideMenu: {
    fontSize: 20,
    fontWeight: "800",
    color: "#444",
    letterSpacing: 0.5,
  },
  logoutButtonSideMenu: {
    backgroundColor: "#f59e0b",
    marginHorizontal: 28,
    marginTop: 28,
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#f59e0b",
    shadowOpacity: 0.9,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 14,
    elevation: 16,
  },
  logoutTextSideMenu: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 20,
    letterSpacing: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "#000000dd",
    justifyContent: "center",
    paddingHorizontal: 28,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 32,
    shadowColor: "#000",
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 16,
  },
  modalTitle: {
    fontSize: 28,
    fontWeight: "900",
    marginBottom: 24,
    textAlign: "center",
    color: "#f59e0b",
    letterSpacing: 1.5,
  },
  errorText: {
    color: "#dc2626",
    marginBottom: 20,
    textAlign: "center",
    fontWeight: "700",
    fontSize: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: 20,
    marginBottom: 20,
    backgroundColor: "#fafafa",
    shadowColor: "#f59e0b",
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
    backgroundColor: "#ddd",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  cancelText: {
    color: "#333",
    fontWeight: "800",
    fontSize: 18,
    letterSpacing: 0.5,
  },
});
