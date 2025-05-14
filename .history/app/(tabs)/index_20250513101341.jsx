import { SafeAreaView } from "react-native";
import React, { useState } from "react";
import Navbar from "../../components/Navbar";
import Navbar from "../../components/Navbar";

export default function HomeScreen() {
  const [selectedType, setSelectedType] = useState("hot");

  return (
    <SafeAreaView className="flex-1">
      <Navbar selectedType={selectedType} setSelectedType={setSelectedType} />
      <CreatorBlog selectedType={selectedType} />
    </SafeAreaView>
  );
}
