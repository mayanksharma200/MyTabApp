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

export default function Navbar() {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const token = useSelector((state) => state.auth.token);

  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedType, setSelectedType] = useState("hot");
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
    paddingTop: Platform.OS === "ios" ? 50 : 20,
    paddingHorizontal: 20,
    backgroundColor: "#f59e0b",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    position: "relative",
    zIndex: 10,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    elevation: 6,
  },
  logo: {
    fontSize: 24,
    fontWeight: "900",
    color: "#fff",
    letterSpacing: 1.2,
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
    borderRadius: 6,
    paddingHorizontal: 8,
  },
  navItemActive: {
    backgroundColor: "#fff",
    shadowColor: "#f59e0b",
    shadowOpacity: 0.7,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 5,
  },
  navText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "600",
  },
  navTextActive: {
    color: "#f59e0b",
    fontWeight: "bold",
  },
  signInButton: {
    backgroundColor: "#fff",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 8,
    marginLeft: 14,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 4,
  },
  signInText: {
    color: "#f59e0b",
    fontWeight: "bold",
    fontSize: 17,
  },
  userButton: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 14,
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 4,
  },
  avatar: {
    backgroundColor: "#f59e0b",
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
    shadowColor: "#f59e0b",
    shadowOpacity: 0.8,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 5,
  },
  avatarText: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 18,
  },
  userEmail: {
    color: "#f59e0b",
    fontWeight: "700",
    fontSize: 16,
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
    backgroundColor: "#00000088",
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
    shadowOpacity: 0.4,
    shadowOffset: { width: 3, height: 0 },
    shadowRadius: 10,
    elevation: 20,
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
  },
  sideMenuHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomColor: "#f59e0b",
    borderBottomWidth: 2,
  },
  sideMenuTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: "#f59e0b",
  },
  closeButton: {
    fontSize: 28,
    color: "#f59e0b",
    fontWeight: "900",
  },
  sideMenuContent: {
    paddingTop: 10,
  },
  sideMenuItem: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 10,
    marginHorizontal: 12,
    marginVertical: 4,
  },
  sideMenuItemActive: {
    backgroundColor: "#f59e0b",
  },
  sideMenuText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  sideMenuTextActive: {
    color: "#fff",
    fontWeight: "bold",
  },
  userInfoSideMenu: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderTopColor: "#eee",
    borderTopWidth: 1,
    marginTop: 20,
  },
  avatarLarge: {
    backgroundColor: "#f59e0b",
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
    shadowColor: "#f59e0b",
    shadowOpacity: 0.9,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 8,
    elevation: 8,
  },
  avatarTextLarge: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 22,
  },
  userEmailSideMenu: {
    fontSize: 18,
    fontWeight: "700",
    color: "#444",
  },
  logoutButtonSideMenu: {
    backgroundColor: "#f59e0b",
    marginHorizontal: 24,
    marginTop: 20,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#f59e0b",
    shadowOpacity: 0.8,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 10,
  },
  logoutTextSideMenu: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "#000000cc",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 28,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 12,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 20,
    textAlign: "center",
    color: "#f59e0b",
  },
  errorText: {
    color: "#dc2626",
    marginBottom: 16,
    textAlign: "center",
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 18,
    marginBottom: 16,
    backgroundColor: "#fafafa",
    shadowColor: "#f59e0b",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
  },
  modalButtons: {
    flexDirection: "row",
    marginTop: 12,
  },
  cancelButton: {
    backgroundColor: "#ddd",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  cancelText: {
    color: "#333",
    fontWeight: "700",
    fontSize: 16,
  },
});
