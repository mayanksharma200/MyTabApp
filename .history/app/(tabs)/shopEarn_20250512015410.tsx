import axios from "axios";
import * as SecureStore from "expo-secure-store";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Linking,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { AuthContext } from "../../";


interface Offer {
  _id: string;
  title: string;
  description: string;
  url: string;
}

interface Redemption {
  _id: string;
  pointsRedeemed: number;
  rewardType: string;
  rewardDetails: any;
  redeemedAt: string;
}

export default function ShopEarn() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rewards, setRewards] = useState(0);
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [token, setToken] = useState<string | null>(null);

  // Redemption form state
  const [redeemPoints, setRedeemPoints] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [redeemLoading, setRedeemLoading] = useState(false);

  // Calculate navbarTop based on iOS version
  const versionNumber =
    typeof Platform.Version === "string"
      ? parseInt(Platform.Version, 10)
      : Platform.Version;
  const navbarTop = Platform.OS === "ios" && versionNumber >= 14 ? 55 : 0;

  useEffect(() => {
    const loadToken = async () => {
      try {
        const savedToken = await SecureStore.getItemAsync("userToken");
        setToken(savedToken);
      } catch (err) {
        console.error("Error loading token from SecureStore:", err);
        setError("Failed to load authentication token.");
      }
    };
    loadToken();
  }, []);

  useEffect(() => {
    if (!token) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const offersRes = await axios.get(
          "http://192.168.1.5:9000/api/posts/shopEarn/offers",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log("Full offers response data:", offersRes.data);

        // Adjust this based on actual response structure
        const offersRaw =
          offersRes.data?.data?.offers ||
          offersRes.data?.offers ||
          offersRes.data;

        console.log("Parsed offersRaw:", offersRaw);

        if (!Array.isArray(offersRaw)) {
          throw new Error("Offers data is not an array");
        }

        const mappedOffers = offersRaw.map((offer: any) => ({
          _id: offer._id ?? Math.random().toString(),
          title: offer.title ?? "No Title",
          description: offer.description ?? "No Description",
          url: offer.url ?? "",
        }));

        setOffers(mappedOffers);

        const rewardsRes = await axios.get(
          "http://192.168.1.5:9000/api/shopEarn/rewards",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setRewards(rewardsRes.data?.data?.totalRewards ?? 0);

        const redemptionsRes = await axios.get(
          "http://192.168.1.5:9000/api/shopEarn/redemptions",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setRedemptions(redemptionsRes.data?.data?.redemptions ?? []);
      } catch (err) {
        console.error("Error fetching ShopEarn data:", err);
        setError("Failed to load offers, rewards, or redemptions.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  const handleViewOffer = async (offer: Offer) => {
    try {
      await axios.post(
        "http://192.168.1.5:9000/api/shopEarn/trackClick",
        { offerId: offer._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Refresh rewards after click
      const rewardsRes = await axios.get(
        "http://192.168.1.5:9000/api/shopEarn/rewards",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRewards(rewardsRes.data?.data?.totalRewards ?? 0);
    } catch (err) {
      console.warn("Failed to track click or refresh rewards", err);
    }
    Linking.openURL(offer.url);
  };

  const handleRedeem = async () => {
    const pointsToRedeem = parseInt(redeemPoints, 10);

    if (isNaN(pointsToRedeem) || pointsToRedeem <= 0) {
      Alert.alert("Invalid input", "Please enter a valid number of points.");
      return;
    }

    if (pointsToRedeem > rewards) {
      Alert.alert("Insufficient points", "You do not have enough points.");
      return;
    }

    if (!couponCode.trim()) {
      Alert.alert("Invalid input", "Please enter a coupon code.");
      return;
    }

    setRedeemLoading(true);

    try {
      await axios.post(
        "http://192.168.1.5:9000/api/shopEarn/redeem",
        {
          points: pointsToRedeem,
          rewardType: "voucher",
          rewardDetails: { code: couponCode.trim() },
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Alert.alert("Success", "Points redeemed successfully!");
      setRedeemPoints("");
      setCouponCode("");

      const [rewardsRes, redemptionsRes] = await Promise.all([
        axios.get("http://192.168.1.5:9000/api/shopEarn/rewards", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("http://192.168.1.5:9000/api/shopEarn/redemptions", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setRewards(rewardsRes.data?.data?.totalRewards ?? 0);
      setRedemptions(redemptionsRes.data?.data?.redemptions ?? []);
    } catch (err) {
      console.error("Redeem error:", err);
      Alert.alert("Error", "Failed to redeem points. Please try again.");
    } finally {
      setRedeemLoading(false);
    }
  };

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
        <Text style={{ color: "red" }}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: navbarTop }]}>
      {offers.length === 0 ? (
        <Text style={{ color: "white", textAlign: "center", marginTop: 20 }}>
          No offers available
        </Text>
      ) : (
        <FlatList
          data={offers}
          keyExtractor={(item) => item._id}
          ListHeaderComponent={
            <>
              <Text style={styles.rewardsText}>
                Your Rewards: {rewards} Points
              </Text>

              <View style={styles.redeemSection}>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Coupon Code</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter coupon code"
                    value={couponCode}
                    onChangeText={setCouponCode}
                    editable={!redeemLoading}
                    autoCapitalize="characters"
                    placeholderTextColor="#aaa"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Points to Redeem</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter points"
                    keyboardType="numeric"
                    value={redeemPoints}
                    onChangeText={setRedeemPoints}
                    editable={!redeemLoading}
                    placeholderTextColor="#aaa"
                  />
                </View>

                <TouchableOpacity
                  style={[
                    styles.redeemButton,
                    redeemLoading && { opacity: 0.6 },
                  ]}
                  onPress={handleRedeem}
                  disabled={redeemLoading}
                >
                  <Text style={styles.redeemButtonText}>
                    {redeemLoading ? "Redeeming..." : "Redeem Points"}
                  </Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.sectionTitle}>Redemption History</Text>
              {redemptions.length === 0 ? (
                <Text style={styles.noRedemptionsText}>
                  No redemptions yet.
                </Text>
              ) : (
                redemptions.map((r) => (
                  <View key={r._id} style={styles.redemptionItem}>
                    <Text style={styles.redemptionText}>
                      Redeemed {r.pointsRedeemed} points for {r.rewardType} on{" "}
                      {new Date(r.redeemedAt).toLocaleDateString()}
                    </Text>
                  </View>
                ))
              )}
            </>
          }
          renderItem={({ item }) => (
            <View style={styles.offerCard}>
              <Text style={styles.offerTitle}>{item.title}</Text>
              <Text style={styles.offerDescription} numberOfLines={3}>
                {item.description}
              </Text>
              <TouchableOpacity
                style={styles.viewOfferButton}
                onPress={() => handleViewOffer(item)}
              >
                <Text style={styles.viewOfferButtonText}>View Offer</Text>
              </TouchableOpacity>
            </View>
          )}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: "#121212",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#121212",
  },
  rewardsText: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 24,
    color: "#FFD700", // Gold color for premium feel
    textAlign: "center",
  },
  redeemSection: {
    backgroundColor: "#1E1E1E",
    padding: 20,
    borderRadius: 12,
    marginBottom: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    color: "#bbb",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: "#2A2A2A",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: "#fff",
    borderWidth: 1,
    borderColor: "#444",
  },
  redeemButton: {
    backgroundColor: "#FFD700",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 8,
  },
  redeemButtonText: {
    color: "#121212",
    fontWeight: "700",
    fontSize: 16,
  },
  offerCard: {
    marginBottom: 20,
    padding: 20,
    borderRadius: 14,
    backgroundColor: "#1E1E1E",
    borderWidth: 1,
    borderColor: "#333",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 5,
  },
  offerTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 10,
    color: "#FFD700",
  },
  offerDescription: {
    fontSize: 15,
    color: "#ccc",
    marginBottom: 16,
    lineHeight: 22,
  },
  viewOfferButton: {
    backgroundColor: "#FFD700",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  viewOfferButtonText: {
    color: "#121212",
    fontWeight: "700",
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 16,
    color: "#FFD700",
  },
  noRedemptionsText: {
    fontSize: 16,
    color: "#888",
    fontStyle: "italic",
    textAlign: "center",
  },
  redemptionItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  redemptionText: {
    fontSize: 16,
    color: "#eee",
  },
});
