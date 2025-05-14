import axios from "axios";
import React, { useState, useCallback, useEffect } from "react";
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
import { useSelector } from "react-redux";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { RootState } from "../../store"; // Adjust path to your store

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
  const navigation = useNavigation();
  const token = useSelector((state: RootState) => state.auth.token);

  // Redirect to SignIn if no token
  useEffect(() => {
    if (!token) {
      Alert.alert(
        "Authentication Required",
        "Please sign in to access Shop & Earn features.",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Sign In",
            onPress: () => navigation.navigate("SignIn"), // Adjust route name if needed
          },
        ],
        { cancelable: false }
      );
    }
  }, [token, navigation]);

  if (!token) {
    return (
      <View style={styles.centered}>
        <Text style={{ color: "#fff", fontSize: 18, textAlign: "center" }}>
          Please sign in to view this content.
        </Text>
      </View>
    );
  }

  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rewards, setRewards] = useState(0);
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);

  const [redeemPoints, setRedeemPoints] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [redeemLoading, setRedeemLoading] = useState(false);

  const versionNumber =
    typeof Platform.Version === "string"
      ? parseInt(Platform.Version, 10)
      : Platform.Version;
  const navbarTop = Platform.OS === "ios" && versionNumber >= 14 ? 55 : 0;

  const fetchData = async (authToken: string) => {
    try {
      setLoading(true);
      setError(null);

      const offersRes = await axios.get(
        "http://192.168.1.7:9000/api/posts/shopEarn/offers",
        { headers: { Authorization: `Bearer ${authToken}` } }
      );

      const offersRaw =
        offersRes.data?.data?.offers ||
        offersRes.data?.offers ||
        offersRes.data;

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
        "http://192.168.1.7:9000/api/shopEarn/rewards",
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      setRewards(rewardsRes.data?.data?.totalRewards ?? 0);

      const redemptionsRes = await axios.get(
        "http://192.168.1.7:9000/api/shopEarn/redemptions",
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      setRedemptions(redemptionsRes.data?.data?.redemptions ?? []);
    } catch (err) {
      setError("Failed to load offers, rewards, or redemptions.");
      setOffers([]);
      setRewards(0);
      setRedemptions([]);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (token) {
        fetchData(token);
      } else {
        setOffers([]);
        setRewards(0);
        setRedemptions([]);
        setLoading(false);
      }
    }, [token])
  );

  const handleViewOffer = async (offer: Offer) => {
    if (!token) {
      Alert.alert("Not authenticated", "Please sign in to view offers.");
      return;
    }
    try {
      await axios.post(
        "http://192.168.1.7:9000/api/shopEarn/trackClick",
        { offerId: offer._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const rewardsRes = await axios.get(
        "http://192.168.1.7:9000/api/shopEarn/rewards",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRewards(rewardsRes.data?.data?.totalRewards ?? 0);
    } catch (err) {
      // ignore tracking errors
    }
    Linking.openURL(offer.url);
  };

  const handleRedeem = async () => {
    if (!token) {
      Alert.alert("Not authenticated", "Please sign in to redeem points.");
      return;
    }

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
        "http://192.168.1.7:9000/api/shopEarn/redeem",
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

      await fetchData(token);
    } catch (err) {
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
    color: "#FFD700",
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