import { SafeAreaView } from "react-native";
import React, { useState } from "react";
import Navbar from "../../components/Navbar";
import CreatorBlog from "../../components/CreatotBlog";

export default function HomeScreen() {
  const [selectedType, setSelectedType] = useState("hot");

  return (
    <SafeAreaView className="flex-1">
      <Navbar selectedType={selectedType} setSelectedType={setSelectedType} />
      <CreatorBlog selectedType={selectedType} />
    </SafeAreaView>
  );
}
