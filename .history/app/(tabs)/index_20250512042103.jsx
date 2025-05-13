import React, { useState } from "react";
import { SafeAreaView, StyleSheet, View } from "react-native";
import CreatorBlog from "../../components"; // Fixed typo in import
import Navbar from "../../components/Navbar";

export default function HomeScreen() {
  const [selectedType, setSelectedType] = useState("hot");

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Navbar selectedType={selectedType} setSelectedType={setSelectedType} />
        <CreatorBlog selectedType={selectedType} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff", // or your preferred background
  },
  container: {
    flex: 1,
  },
});
