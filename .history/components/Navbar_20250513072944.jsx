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
  Animated,
  Easing,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { setToken, clearToken } from "../store/authSlice";
import { styled } from "nativewind";

const windowWidth = Dimensions.get("window").width;

const StyledView = styled(Animated.View);
const StyledTouchableOpacity = styled(
  Animated.createAnimatedComponent(require("react-native").TouchableOpacity)
);
const StyledText = styled(require("react-native").Text);
const StyledTextInput = styled(require("react-native").TextInput);
const StyledScrollView = styled(require("react-native").ScrollView);
const StyledModalView = styled(require("react-native").View);

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
      <StyledView className="bg-brandOrange flex-row items-center justify-center h-16 shadow-lg shadow-black/40 z-10">
        <ActivityIndicator size="small" color="#fff" />
      </StyledView>
    );
  }

  return (
    <>
      <StyledView className="bg-brandOrange flex-row items-center justify-start px-8 pt-10 pb-4 rounded-b-3xl shadow-lg shadow-black/40 relative z-10">
        <StyledView className="flex-row items-center flex-1 pl-2">
          {/* Logo */}
          <StyledView className="relative w-9 h-9 mr-3">
            <StyledView className="absolute top-0 left-2 w-4 h-6 bg-white rounded-t-xl rotate-12 shadow-white shadow-lg" />
            <StyledView className="absolute bottom-0 left-1.5 w-6 h-6 bg-brandOrange rounded-full shadow-brandOrange shadow-lg" />
          </StyledView>
          <StyledText className="text-white font-extrabold text-2xl tracking-widest drop-shadow-lg">
            OffersConsole
          </StyledText>
        </StyledView>

        {windowWidth < 600 ? (
          <StyledTouchableOpacity
            onPress={() => setMenuOpen(true)}
            className="absolute right-8 top-12"
            accessibilityLabel="Open menu"
          >
            <StyledText className="text-white font-extrabold text-4xl drop-shadow-lg">
              ☰
            </StyledText>
          </StyledTouchableOpacity>
        ) : (
          <StyledView className="flex-row items-center justify-center flex-2">
            {navItems.map((item) => (
              <StyledTouchableOpacity
                key={item.type}
                onPress={() => setSelectedType(item.type)}
                className={`mx-4 py-2 px-4 rounded-xl ${
                  selectedType === item.type
                    ? "bg-white shadow-lg shadow-yellow-400"
                    : ""
                }`}
              >
                <StyledText
                  className={`text-lg font-semibold ${
                    selectedType === item.type
                      ? "text-brandOrange font-extrabold"
                      : "text-white"
                  }`}
                >
                  {item.name}
                </StyledText>
              </StyledTouchableOpacity>
            ))}

            {user ? (
              <StyledTouchableOpacity
                onPress={() => setMenuOpen(true)}
                className="flex-row items-center ml-5 bg-white px-5 py-2 rounded-full shadow-md shadow-black/25"
              >
                <StyledView className="bg-brandOrange w-10 h-10 rounded-full justify-center items-center mr-3 shadow-lg shadow-brandOrange/90">
                  <StyledText className="text-white font-extrabold text-lg">
                    {user.email.charAt(0).toUpperCase()}
                  </StyledText>
                </StyledView>
                <StyledText className="text-brandOrange font-bold text-lg">
                  {user.email}
                </StyledText>
              </StyledTouchableOpacity>
            ) : (
              <StyledTouchableOpacity
                onPress={() => setSignInVisible(true)}
                className="bg-white px-6 py-3 rounded-xl ml-5 shadow-md shadow-black/25"
              >
                <StyledText className="text-brandOrange font-extrabold text-lg">
                  Sign In
                </StyledText>
              </StyledTouchableOpacity>
            )}
          </StyledView>
        )}
      </StyledView>

      {/* Side Menu Overlay */}
      {menuOpen && (
        <StyledTouchableOpacity
          className="absolute top-[90px] left-0 right-0 bottom-0 bg-black bg-opacity-60 z-20"
          activeOpacity={1}
          onPress={() => setMenuOpen(false)}
        />
      )}

      {/* Side Menu */}
      <StyledView
        style={{ transform: [{ translateX: slideAnim }] }}
        className="absolute top-[90px] bottom-0 left-0 w-3/4 bg-white z-30 shadow-lg shadow-black/50 rounded-tr-3xl rounded-br-3xl"
      >
        <StyledView className="flex-row justify-between items-center px-7 py-6 border-b-4 border-brandOrange">
          <StyledText className="text-3xl font-extrabold text-brandOrange tracking-widest">
            Menu
          </StyledText>
          <StyledTouchableOpacity onPress={() => setMenuOpen(false)}>
            <StyledText className="text-4xl font-extrabold text-brandOrange">
              ✕
            </StyledText>
          </StyledTouchableOpacity>
        </StyledView>

        <StyledScrollView className="pt-4">
          {navItems.map((item) => (
            <StyledTouchableOpacity
              key={item.type}
              onPress={() => {
                setSelectedType(item.type);
                setMenuOpen(false);
              }}
              className={`py-5 px-7 mx-4 my-2 rounded-xl ${
                selectedType === item.type ? "bg-brandOrange shadow-lg" : ""
              }`}
            >
              <StyledText
                className={`text-xl font-semibold ${
                  selectedType === item.type ? "text-white" : "text-gray-800"
                }`}
              >
                {item.name}
              </StyledText>
            </StyledTouchableOpacity>
          ))}

          {user ? (
            <>
              <StyledView className="flex-row items-center px-7 py-7 border-t border-gray-200 mt-7">
                <StyledView className="bg-brandOrange w-14 h-14 rounded-full justify-center items-center mr-5 shadow-lg shadow-brandOrange/90">
                  <StyledText className="text-white font-extrabold text-2xl">
                    {user.email.charAt(0).toUpperCase()}
                  </StyledText>
                </StyledView>
                <StyledText className="text-lg font-bold text-gray-700">
                  {user.email}
                </StyledText>
              </StyledView>
              <StyledTouchableOpacity
                onPress={handleLogout}
                className="bg-brandOrange mx-7 mt-7 py-5 rounded-2xl items-center shadow-lg shadow-brandOrange/90"
              >
                <StyledText className="text-white font-extrabold text-xl tracking-wide">
                  Logout
                </StyledText>
              </StyledTouchableOpacity>
            </>
          ) : (
            <StyledTouchableOpacity
              onPress={() => {
                setSignInVisible(true);
                setMenuOpen(false);
              }}
              className="py-5 px-7 mx-4 my-2 rounded-xl"
            >
              <StyledText className="text-xl font-semibold text-gray-800">
                Sign In
              </StyledText>
            </StyledTouchableOpacity>
          )}
        </StyledScrollView>
      </StyledView>

      <Modal
        visible={signInVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSignInVisible(false)}
      >
        <StyledView className="flex-1 bg-black bg-opacity-80 justify-center px-7">
          <StyledView className="bg-white rounded-3xl p-8 shadow-lg shadow-black/40">
            <StyledText className="text-3xl font-extrabold text-center text-brandOrange mb-6 tracking-widest">
              Sign In
            </StyledText>

            {error ? (
              <StyledText className="text-red-600 mb-5 text-center font-semibold">
                {error}
              </StyledText>
            ) : null}

            <StyledTextInput
              className="border border-gray-300 rounded-2xl px-5 py-4 text-lg mb-5 bg-gray-50 shadow-sm shadow-brandOrange/20"
              placeholder="Email"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
              editable={!loading}
            />
            <StyledTextInput
              className="border border-gray-300 rounded-2xl px-5 py-4 text-lg mb-5 bg-gray-50 shadow-sm shadow-brandOrange/20"
              placeholder="Password"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              editable={!loading}
            />

            <StyledView className="flex-row mt-4 space-x-4">
              <StyledTouchableOpacity
                onPress={handleSignIn}
                className="flex-1 bg-white py-4 rounded-2xl shadow-md shadow-black/25 justify-center items-center"
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#f59e0b" />
                ) : (
                  <StyledText className="text-brandOrange font-extrabold text-lg">
                    Submit
                  </StyledText>
                )}
              </StyledTouchableOpacity>
              <StyledTouchableOpacity
                onPress={() => setSignInVisible(false)}
                className="flex-1 bg-gray-300 py-4 rounded-2xl justify-center items-center"
                disabled={loading}
              >
                <StyledText className="text-gray-700 font-semibold text-lg">
                  Cancel
                </StyledText>
              </StyledTouchableOpacity>
            </StyledView>
          </StyledView>
        </StyledView>
      </Modal>
    </>
  );
}
