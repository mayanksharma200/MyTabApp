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
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>View Offer →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={{ marginTop: 12, color: "#2563eb" }}>
          Loading offers...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={{ color: "#ef4444", marginBottom: 12 }}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchOffers}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (filteredOffers.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={{ color: "#6b7280", fontStyle: "italic" }}>
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
        contentContainerStyle={{ paddingBottom: 40 }}
        numColumns={1}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={
          filteredOffers.length > visibleCount ? (
            <TouchableOpacity
              style={styles.showMoreButton}
              onPress={handleShowMore}
              activeOpacity={0.8}
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
    backgroundColor: "#f0f5ff", // very light blue
    padding: 16,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    marginBottom: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#dbeafe", // light blue border
    shadowColor: "#3b82f6",
    shadowOpacity: 0.15,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  imageContainer: {
    width: "100%",
    aspectRatio: 16 / 9,
    position: "relative",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  tagContainer: {
    position: "absolute",
    bottom: 12,
    left: 12,
    backgroundColor: "#2563eb", // blue-600
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 30,
    shadowColor: "#2563eb",
    shadowOpacity: 0.4,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 5,
  },
  tagText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 13,
    letterSpacing: 0.5,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1e40af", // blue-900
    marginBottom: 10,
  },
  description: {
    fontSize: 15,
    color: "#374151", // gray-700
    marginBottom: 18,
    lineHeight: 22,
  },
  button: {
    backgroundColor: "#2563eb", // blue-600
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    shadowColor: "#1e40af",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 7,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 16,
    letterSpacing: 0.7,
  },
  retryButton: {
    backgroundColor: "#2563eb",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 14,
  },
  retryButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  showMoreButton: {
    backgroundColor: "#2563eb",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    marginVertical: 24,
    shadowColor: "#1e40af",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 7,
  },
  showMoreText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
    letterSpacing: 0.7,
  },
});
