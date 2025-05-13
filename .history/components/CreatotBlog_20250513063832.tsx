import axios from "axios";
import { Buffer } from "buffer";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const BATCH_SIZE = 6;
const windowWidth = Dimensions.get("window").width;

interface Offer {
  _id: string;
  title: string;
  description: string;
  url: string;
  tag?: string;
  imageDataUrl?: string | null;
  type?: string;
  image?: {
    data: { data: number[] };
    contentType: string;
  };
}

interface CreatorBlogProps {
  selectedType: string;
}

function bufferToBase64(bufferData: number[]) {
  return Buffer.from(bufferData).toString("base64");
}

function getImageUri(
  image: { data: { data: number[] }; contentType: string } | undefined
) {
  if (!image || !image.data || !image.data.data) return null;
  const base64 = bufferToBase64(image.data.data);
  return `data:${image.contentType};base64,${base64}`;
}

export default function CreatorBlog({ selectedType }: CreatorBlogProps) {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOffers = async () => {
    try {
      setLoading(true);
      setError(null);
      const queryType = selectedType === "hot" ? "" : `?type=${selectedType}`;
      const res = await axios.get(
        `http://192.168.1.5:9000/api/posts/blog-content${queryType}`
      );

      if (res.data && res.data.articles) {
        const offersWithImages = res.data.articles.map((article: any) => ({
          ...article,
          imageDataUrl: getImageUri(article.image),
        }));
        setOffers(offersWithImages);
      } else {
        setOffers([]);
      }
    } catch (err) {
      console.error("Failed to fetch offers:", err);
      setError("Failed to load offers. Please try again later.");
      setOffers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, [selectedType]);

  const filteredOffers =
    selectedType === "hot"
      ? offers
      : offers.filter(
          (offer) =>
            offer.type &&
            offer.type.toLowerCase() === selectedType.toLowerCase()
        );

  const visibleOffers = filteredOffers.slice(0, visibleCount);

  const handleShowMore = () =>
    setVisibleCount((prev) =>
      Math.min(prev + BATCH_SIZE, filteredOffers.length)
    );

  const renderOffer = ({ item }: { item: Offer }) => (
    <View style={styles.card}>
      <View style={styles.imageContainer}>
        <Image
          source={{
            uri:
              item.imageDataUrl ||
              "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1000&auto=format&fit=crop",
          }}
          style={styles.image}
          resizeMode="cover"
        />
        <View style={styles.tagContainer}>
          <Text style={styles.tagText}>{item.tag || "Exclusive"}</Text>
        </View>
      </View>
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.description} numberOfLines={3}>
          {item.description}
        </Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            if (item.url) {
              Linking.openURL(item.url);
            }
          }}
          activeOpacity={0.85}
        >
          <Text style={styles.buttonText}>View Offer →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#af52de" />
        <Text style={{ marginTop: 14, color: "#af52de", fontWeight: "600" }}>
          Loading offers...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={{ color: "#ff453a", marginBottom: 14, fontWeight: "700" }}>
          {error}
        </Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchOffers}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (filteredOffers.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={{ color: "#8e8e93", fontStyle: "italic", fontSize: 16 }}>
          No offers available at the moment.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={visibleOffers}
        keyExtractor={(item) => item._id}
        renderItem={renderOffer}
        contentContainerStyle={{ paddingBottom: 48 }}
        numColumns={1}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={
          filteredOffers.length > visibleCount ? (
            <TouchableOpacity
              style={styles.showMoreButton}
              onPress={handleShowMore}
              activeOpacity={0.85}
            >
              <Text style={styles.showMoreText}>Show more offers</Text>
            </TouchableOpacity>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000", // pure black background like Apple Music
    padding: 20,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    backgroundColor: "#1c1c1e", // dark gray card background
    borderRadius: 24,
    marginBottom: 28,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#3a3a3c", // subtle border
    shadowColor: "#af52de", // purple shadow accent
    shadowOpacity: 0.3,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 16,
  },
  imageContainer: {
    width: "100%",
    aspectRatio: 16 / 9,
    position: "relative",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  tagContainer: {
    position: "absolute",
    bottom: 18,
    left: 18,
    backgroundColor: "rgba(175, 82, 222, 0.85)", // translucent purple
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 48,
    shadowColor: "#af52de",
    shadowOpacity: 0.7,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 14,
  },
  tagText: {
    color: "#f3e8ff", // soft lavender white
    fontWeight: "900",
    fontSize: 15,
    letterSpacing: 0.8,
  },
  content: {
    padding: 28,
  },
  title: {
    fontSize: 24,
    fontWeight: "900",
    color: "#f3f3f3", // bright white
    marginBottom: 16,
    letterSpacing: 0.6,
  },
  description: {
    fontSize: 17,
    color: "#b0a6d8", // muted lavender
    marginBottom: 28,
    lineHeight: 26,
  },
  button: {
    backgroundColor: "#af52de", // vibrant purple
    paddingVertical: 18,
    borderRadius: 28,
    alignItems: "center",
    shadowColor: "#7a2fc1",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 18,
  },
  buttonText: {
    color: "#f3e8ff",
    fontWeight: "900",
    fontSize: 20,
    letterSpacing: 1.2,
  },
  retryButton: {
    backgroundColor: "#af52de",
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 28,
    shadowColor: "#7a2fc1",
    shadowOpacity: 0.7,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 16,
  },
  retryButtonText: {
    color: "#f3e8ff",
    fontWeight: "900",
    fontSize: 20,
  },
  showMoreButton: {
    backgroundColor: "#af52de",
    paddingVertical: 20,
    borderRadius: 28,
    alignItems: "center",
    marginVertical: 36,
    shadowColor: "#7a2fc1",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 18,
  },
  showMoreText: {
    color: "#f3e8ff",
    fontWeight: "900",
    fontSize: 20,
    letterSpacing: 1.2,
  },
});
