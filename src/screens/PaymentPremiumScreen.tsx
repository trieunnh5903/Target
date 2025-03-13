import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { CustomView } from "@/components";
import { Button } from "react-native-paper";
import ZaloPayModule from "modules/zalo-pay/src/ZaloPayModule";
import { useAppDispatch, useAppSelector } from "@/hooks";
import { paymentApi, userAPI } from "@/api";
import Toast from "react-native-simple-toast";
import { verifiedAccountLocal } from "@/redux/slices/authSlice";
import { RootStackScreenProps } from "@/types/navigation";
import { PlanType } from "@/types";
import { LoadingModal } from "@/components/modal";

const PremiumScreen: React.FC<RootStackScreenProps<"Premium">> = ({
  navigation,
}) => {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<PlanType>("monthly");
  const userId = useAppSelector((state) => state.auth.currentUser?.id);
  const plans = useMemo(() => {
    return {
      monthly: {
        price: "1.658₫",
        billingPeriod: "month",
        discount: null,
      },
      yearly: {
        price: "19.900₫",
        billingPeriod: "year",
        discount: "12%",
        originalPrice: "19.896₫",
      },
    };
  }, []);

  const features = [
    "No Ads",
    "Unlimited Messaging",
    "Priority Customer Support",
    "Latest Exclusive Features",
    "Premium Profile Badge",
    "Advanced Analytics",
  ];

  useEffect(() => {
    const zpListener = ZaloPayModule.addListener("onZaloPayResult", (event) => {
      if (event.returnCode === 3) {
        Toast.show("Transaction has been cancelled", Toast.LONG);
      } else if (event.returnCode === 1) {        
        navigation.navigate("PremiumSuccess", { planType: selectedPlan });
        dispatch(verifiedAccountLocal());
        userAPI.verifiedAccount(userId!);
      }
      setLoading(false)
    });

    return () => {
      zpListener.remove();
    };
  }, [dispatch, navigation, selectedPlan, userId]);

  const onUpgradePress = useCallback(async () => {
    setLoading(true)
    const parsedAmount = Number(
      plans[selectedPlan].price.replace(/[^\d]/g, "")
    );
    const orderResponse = await paymentApi.createZpOrder({
      amount: parsedAmount,
      app_user: userId || "Target App User",
    });

    if (orderResponse?.return_code === 1) {
      ZaloPayModule.payOrder(orderResponse.zp_trans_token);
    }else {
      setLoading(false)
    }
  }, [plans, selectedPlan, userId]);

  return (
    <CustomView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Upgrade to Premium</Text>
          <Text style={styles.subtitle}>
            Experience full features with Premium
          </Text>
        </View>

        <View style={styles.plansContainer}>
          <View style={styles.planSelectorContainer}>
            <TouchableOpacity
              style={[
                styles.planSelector,
                selectedPlan === "monthly" && styles.planSelectorActive,
              ]}
              onPress={() => setSelectedPlan("monthly")}
            >
              <Text
                style={[
                  styles.planSelectorText,
                  selectedPlan === "monthly" && styles.planSelectorTextActive,
                ]}
              >
                Monthly
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.planSelector,
                selectedPlan === "yearly" && styles.planSelectorActive,
              ]}
              onPress={() => setSelectedPlan("yearly")}
            >
              <Text
                style={[
                  styles.planSelectorText,
                  selectedPlan === "yearly" && styles.planSelectorTextActive,
                ]}
              >
                Yearly
              </Text>
              {plans.yearly.discount && (
                <View style={styles.discountBadge}>
                  <Text style={styles.discountText}>
                    Save {plans.yearly.discount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.planDetails}>
            <Text style={styles.planPrice}>
              {plans[selectedPlan].price}
              <Text style={styles.planPeriod}>
                /{plans[selectedPlan].billingPeriod}
              </Text>
            </Text>

            {selectedPlan === "yearly" && (
              <Text style={styles.originalPrice}>
                Instead of {plans.yearly.originalPrice}/year
              </Text>
            )}
          </View>
        </View>

        <View style={styles.featuresContainer}>
          <Text style={styles.featuresTitle}>Premium features include:</Text>

          {features.map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>

        <View style={styles.ctaContainer}>
          <Text style={styles.termsText}>
            Subscriptions will automatically renew. You can cancel at any time
            in the Settings section. By subscribing, you agree to our Terms of
            Service and Privacy Policy.
          </Text>
        </View>
      </ScrollView>
      <CustomView style={styles.upgradeContainer}>
        <Button
          mode="contained"
          contentStyle={styles.subscribeButton}
          onPress={onUpgradePress}
        >
          Upgrade
        </Button>
      </CustomView>

      <LoadingModal visible={loading} loadingContent="Loading"/>
    </CustomView>
  );
};

const styles = StyleSheet.create({
  upgradeContainer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    left: 0,
    right: 0,
    padding: 20,
  },
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 0,
  },
  closeButton: {
    position: "absolute",
    top: 15,
    right: 15,
    zIndex: 10,
    padding: 5,
  },
  header: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 30,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 15,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#333",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  plansContainer: {
    backgroundColor: "#f8f8f8",
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
  },
  planSelectorContainer: {
    flexDirection: "row",
    backgroundColor: "#e0e0e0",
    borderRadius: 10,
    marginBottom: 20,
  },
  planSelector: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 10,
    position: "relative",
  },
  planSelectorActive: {
    backgroundColor: "#fff",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  planSelectorText: {
    fontSize: 16,
    color: "#666",
  },
  planSelectorTextActive: {
    color: "#333",
    fontWeight: "bold",
  },
  discountBadge: {
    position: "absolute",
    top: -10,
    right: -10,
    backgroundColor: "#FF5252",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  discountText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  planDetails: {
    alignItems: "center",
  },
  planPrice: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#333",
  },
  planPeriod: {
    fontSize: 16,
    color: "#666",
  },
  originalPrice: {
    fontSize: 14,
    color: "#999",
    textDecorationLine: "line-through",
    marginTop: 5,
  },
  featuresContainer: {
    backgroundColor: "#f8f8f8",
    borderRadius: 15,
    padding: 20,
    marginBottom: 25,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#333",
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  featureText: {
    fontSize: 16,
    color: "#333",
    marginLeft: 10,
  },
  ctaContainer: {
    alignItems: "center",
    marginBottom: 110,
  },
  gradientButton: {
    width: "100%",
    borderRadius: 12,
    marginBottom: 15,
  },
  subscribeButton: {
    width: "100%",
  },
  subscribeButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  restoreButton: {
    paddingVertical: 12,
    marginBottom: 20,
  },
  restoreButtonText: {
    color: "#666",
    fontSize: 16,
  },
  termsText: {
    fontSize: 12,
    color: "#999",
    textAlign: "center",
    lineHeight: 18,
  },
});

export default PremiumScreen;
