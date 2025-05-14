import { SafeAreaView } from "react-native";

export default function HomeScreen() {
  const [selectedType, setSelectedType] = useState("hot");

  return (
    <SafeAreaView className="flex-1">
      <Navbar selectedType={selectedType} setSelectedType={setSelectedType} />
      <CreatorBlog selectedType={selectedType} />
    </SafeAreaView>
  );
}
