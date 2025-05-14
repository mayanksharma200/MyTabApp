import React, { useState } from "react";
import { SafeAreaView, StyleSheet } from "react-native";
import CreatorBlog from "../../components/CreatotBlog";
import Navbar from "../../components/Navbar";

export default function HomeScreen() {
  const [selectedType, setSelectedType] = useState("hot");

  return (
    <SafeAreaView style={styles.container}>
      <Navbar selectedType={selectedType} setSelectedType={setSelectedType} />
      <CreatorBlog selectedType={selectedType} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
