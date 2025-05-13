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

// Polyfill Buffer globally if needed (add this in your App entry point if not already done)
// import { Buffer } from 'buffer';
// global.Buffer = global.Buffer || Buffer;

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
          <Text style={styles.tagText}>{item.tag || "Limited Time"}</Text>
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
        >
          <Text style={styles.buttonText}>View Offer →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#D97706" />
        <Text style={{ marginTop: 12, color: "#D97706" }}>
          Loading offers...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={{ color: "red", marginBottom: 12 }}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchOffers}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (filteredOffers.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={{ color: "#888", fontStyle: "italic" }}>
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
        ListFooterComponent={
          filteredOffers.length > visibleCount ? (
            <TouchableOpacity
              style={styles.showMoreButton}
              onPress={handleShowMore}
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
    backgroundColor: "#fef3c7", // yellow-50
    padding: 16,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#ddd",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  imageContainer: {
    width: "100%",
    aspectRatio: 16 / 9,
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  tagContainer: {
    position: "absolute",
    bottom: 8,
    left: 8,
    backgroundColor: "#f59e0b", // yellow-500
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  tagText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 12,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#b45309", // yellow-600
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: "#555",
    marginBottom: 12,
  },
  button: {
    backgroundColor: "#f59e0b", // yellow-500
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  retryButton: {
    backgroundColor: "#f59e0b",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  retryButtonText: {
    color: "#fff",
    fontWeight: "700",
  },
  showMoreButton: {
    backgroundColor: "#f59e0b",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginVertical: 20,
  },
  showMoreText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});
