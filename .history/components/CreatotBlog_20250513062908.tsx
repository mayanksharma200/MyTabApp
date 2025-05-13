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
        <ActivityIndicator size="large" color="#4f46e5" />
        <Text style={{ marginTop: 14, color: "#4f46e5", fontWeight: "600" }}>
          Loading offers...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={{ color: "#ef4444", marginBottom: 14, fontWeight: "700" }}>
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
        <Text style={{ color: "#94a3b8", fontStyle: "italic", fontSize: 16 }}>
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
    backgroundColor: "#0e0e2c", // deep dark blue background
    padding: 20,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    backgroundColor: "#1f2937", // dark slate gray
    borderRadius: 24,
    marginBottom: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#4338ca", // indigo border
    shadowColor: "#4338ca",
    shadowOpacity: 0.35,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 12 },
    elevation: 15,
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
    bottom: 16,
    left: 16,
    backgroundColor: "#6366f1", // indigo-500
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 40,
    shadowColor: "#6366f1",
    shadowOpacity: 0.7,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 10,
  },
  tagText: {
    color: "#e0e7ff", // light indigo text
    fontWeight: "800",
    fontSize: 14,
    letterSpacing: 0.7,
  },
  content: {
    padding: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: "900",
    color: "#c7d2fe", // light indigo
    marginBottom: 14,
    letterSpacing: 0.5,
  },
  description: {
    fontSize: 16,
    color: "#a5b4fc", // medium light indigo
    marginBottom: 24,
    lineHeight: 24,
  },
  button: {
    backgroundColor: "#6366f1", // indigo-500
    paddingVertical: 16,
    borderRadius: 20,
    alignItems: "center",
    shadowColor: "#4338ca",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 12,
  },
  buttonText: {
    color: "#e0e7ff",
    fontWeight: "900",
    fontSize: 18,
    letterSpacing: 1,
  },
  retryButton: {
    backgroundColor: "#6366f1",
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 20,
    shadowColor: "#4338ca",
    shadowOpacity: 0.6,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 12,
  },
  retryButtonText: {
    color: "#e0e7ff",
    fontWeight: "900",
    fontSize: 18,
  },
  showMoreButton: {
    backgroundColor: "#6366f1",
    paddingVertical: 18,
    borderRadius: 20,
    alignItems: "center",
    marginVertical: 32,
    shadowColor: "#4338ca",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 12,
  },
  showMoreText: {
    color: "#e0e7ff",
    fontWeight: "900",
    fontSize: 18,
    letterSpacing: 1,
  },
});
