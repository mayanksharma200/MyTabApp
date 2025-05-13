import React, { useState } from "react";
import {
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Platform,
} from "react-native";
import Navbar from "../../components/Navbar";
import CreatorBlog from "../../components/CreatorBlog"; // Fixed typo in import

const navItems = [
  { name: "Hot Deals", type: "hot" },
  { name: "Gaming", type: "gaming" },
  { name: "Tech", type: "tech" },
  { name: "Accessories", type: "accessories" },
];

export default function HomeScreen() {
  const [selectedType, setSelectedType] = useState("hot");
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSelectType = (type) => {
    setSelectedType(type);
    setMenuOpen(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Navbar
          selectedType={selectedType}
          setSelectedType={setSelectedType}
          menuOpen={menuOpen}
          setMenuOpen={setMenuOpen}
        />

        <CreatorBlog selectedType={selectedType} />

        {menuOpen && (
          <View style={styles.dropdownOverlay}>
            <ScrollView>
              {navItems.map((item) => (
                <TouchableOpacity
                  key={item.type}
                  onPress={() => handleSelectType(item.type)}
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
            </ScrollView>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    position: "relative", // Important for absolute dropdown positioning
  },
  dropdownOverlay: {
    position: "absolute",
    top: Platform.OS === "ios" ? 80 : 70, // Adjust to navbar height
    right: 16,
    width: 200,
    backgroundColor: "#b45309",
    borderRadius: 12,
    paddingVertical: 14,
    maxHeight: 280,
    shadowColor: "#000",
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 20,
    zIndex: 9999,
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
});
