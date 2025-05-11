import React, { useState } from "react";
import { SafeAreaView, StyleSheet } from "react-native";
import CreatorBlog from "../../components/CreatotBlog";
import Navbar from "../../components/Navbar";
import { useNavigation } from "@react-navigation/native";

export default function HomeScreen() {
  const [selectedType, setSelectedType] = useState("hot");
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      <Navbar
        selectedType={selectedType}
        setSelectedType={setSelectedType}
        navigation={navigation}
      />
      <CreatorBlog selectedType={selectedType} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
