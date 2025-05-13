import React, { useState } from "react";
import { SafeAreaView, StyleSheet, View, Dimensions, Platform } from "react-native";
import Navbar from "../../components/Navbar";
import CreatorBlog from "../../components/CreatotBlog";

export default function HomeScreen() {
  const [selectedType, setSelectedType] = useState("hot");
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <SafeAreaView style={styles.safeArea}>
      <Navbar
        selectedType={selectedType}
        setSelectedType={setSelectedType}
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
      />
      <CreatorBlog selectedType={selectedType} />
      {menuOpen && (
        <View style={styles.dropdownOverlay}>
          {/* Render dropdown menu here */}
          {/* You can pass navItems and handlers as props */}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  dropdownOverlay: {
    position: "absolute",
    top: Platform.OS === "ios" ? 80 : 70, // below navbar
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
});
