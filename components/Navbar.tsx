import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import axios from "axios";
import type { NavigationProp } from "@react-navigation/native";

interface User {
  email: string;
  rewardPoints: number;
}

interface NavbarProps {
  user: User | null;
  selectedType: string;
  setSelectedType: (type: string) => void;
  navigation: NavigationProp<any>;
}

export default function Navbar({
  user,
  selectedType,
  setSelectedType,
  navigation,
}: NavbarProps) {
  const [open, setOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState("24:00:00");

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0);

      const diff = midnight.getTime() - now.getTime();
      const hours = String(Math.floor(diff / (1000 * 60 * 60))).padStart(
        2,
        "0"
      );
      const mins = String(
        Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      ).padStart(2, "0");
      const secs = String(Math.floor((diff % (1000 * 60)) / 1000)).padStart(
        2,
        "0"
      );

      setTimeLeft(`${hours}:${mins}:${secs}`);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const navItems = [
    { name: "Hot Deals", type: "hot" },
    { name: "Gaming", type: "gaming" },
    { name: "Tech", type: "tech" },
    { name: "Accessories", type: "accessories" },
  ];

  const handleLogout = () => {
    axios
      .post(
        "http://your-api-url/api/auth/signout",
        {},
        { withCredentials: true }
      )
      .then(() => {
        // navigation.replace("SignIn");
      });
  };

  return (
    <View style={styles.navbar}>
      <Text style={styles.logo}>
        Offers<Text style={{ color: "#444" }}>Console</Text>
      </Text>

      <View style={styles.timerContainer}>
        <Text style={styles.timerLabel}>ENDS IN:</Text>
        <Text style={styles.timer}>{timeLeft}</Text>
      </View>

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
      </View>

      {user ? (
        <View style={styles.userMenu}>
          <TouchableOpacity
            onPress={() => setOpen(!open)}
            style={styles.userButton}
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user.email.charAt(0).toUpperCase()}
              </Text>
            </View>
            <Text style={styles.userEmail}>{user.email}</Text>
          </TouchableOpacity>

          {open && (
            <View style={styles.dropdown}>
              <Text style={styles.userEmailDropdown}>{user.email}</Text>
              <Text style={styles.rewards}>Rewards: {user.rewardPoints}</Text>
              <TouchableOpacity
                onPress={handleLogout}
                style={styles.logoutButton}
              >
                <Text style={styles.logoutText}>Logout</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      ) : (
        <TouchableOpacity
          onPress={() => navigation.navigate("SignIn")}
          style={styles.signInButton}
        >
          <Text style={styles.signInText}>Sign In</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  navbar: {
    paddingTop: Platform.OS === "ios" ? 50 : 20,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  logo: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#f59e0b", // yellow-500
  },
  timerContainer: {
    backgroundColor: "#fef3c7", // yellow-50
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  timerLabel: {
    color: "#b45309", // yellow-600
    fontWeight: "bold",
    marginRight: 4,
  },
  timer: {
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
    color: "#b91c1c", // red-600
    fontWeight: "bold",
  },
  navItems: {
    flexDirection: "row",
    flex: 1,
    justifyContent: "center",
  },
  navItem: {
    marginHorizontal: 8,
    paddingVertical: 8,
  },
  navItemActive: {
    borderBottomWidth: 2,
    borderBottomColor: "#dc2626", // red-600
  },
  navText: {
    fontSize: 16,
    color: "#374151", // gray-700
  },
  navTextActive: {
    color: "#dc2626", // red-600
    fontWeight: "bold",
  },
  userMenu: {
    position: "relative",
  },
  userButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    backgroundColor: "#ea580c", // orange-600
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  avatarText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
  },
  userEmail: {
    fontWeight: "500",
    color: "#374151", // gray-700
  },
  dropdown: {
    position: "absolute",
    top: 48,
    right: 0,
    width: 180,
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    zIndex: 1000,
  },
  userEmailDropdown: {
    fontWeight: "600",
    marginBottom: 8,
  },
  rewards: {
    color: "#b45309", // yellow-600
    fontWeight: "bold",
    marginBottom: 12,
  },
  logoutButton: {
    backgroundColor: "#ea580c", // orange-600
    paddingVertical: 8,
    borderRadius: 6,
  },
  logoutText: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
  },
  signInButton: {
    backgroundColor: "#dc2626", // red-600
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  signInText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
