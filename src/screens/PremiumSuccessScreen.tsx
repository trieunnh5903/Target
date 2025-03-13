import React, { useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import LottieView from "lottie-react-native";
import { RootStackScreenProps } from "@/types/navigation";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppTheme } from "@/config/theme";

const SuccessScreen: React.FC<RootStackScreenProps<"PremiumSuccess">> = ({
  navigation,
  route,
}) => {
  const { planType = "monthly" } = route.params || {};

  const fadeAnim = new Animated.Value(0);
  const moveAnim = new Animated.Value(20);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(moveAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    if (lottieRef.current) {
      setTimeout(() => {
        lottieRef.current?.play();
      }, 100);
    }
  }, []);

  const lottieRef = React.useRef<LottieView>(null);

  const getSubscriptionText = () => {
    if (planType === "yearly") {
      return "Yearly";
    } else {
      return "Monthly";
    }
  };
  const theme = useAppTheme();
  const currentDate = new Date();

  const getEndDate = () => {
    const endDate = new Date(currentDate);
    if (planType === "yearly") {
      endDate.setFullYear(endDate.getFullYear() + 1);
    } else {
      endDate.setMonth(endDate.getMonth() + 1);
    }
    return endDate.toLocaleDateString("vi-VN");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      <TouchableOpacity
        style={styles.closeButton}
        onPress={() => navigation.navigate("Tabs", { screen: "Profile" })}
      >
        <Ionicons name="close" size={24} color="#333" />
      </TouchableOpacity>

      <Animated.View
        style={[
          styles.container,
          {
            opacity: fadeAnim,
            transform: [{ translateY: moveAnim }],
          },
        ]}
      >
        <View style={styles.animationContainer}>
          <LottieView
            ref={lottieRef}
            source={require("../../assets/success-animation.json")}
            style={styles.animation}
            autoPlay={false}
            loop={false}
          />
        </View>

        <Text style={styles.title}>Congratulations!</Text>
        <Text style={styles.subtitle}>You have become a Premium member</Text>

        <View style={styles.card}>
          <View style={styles.infoContainer}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Subscription Package:</Text>
              <Text style={styles.infoValue}>{getSubscriptionText()}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Start date:</Text>
              <Text style={styles.infoValue}>
                {currentDate.toLocaleDateString("vi-VN")}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Renewal date:</Text>
              <Text style={styles.infoValue}>{getEndDate()}</Text>
            </View>

            <View style={styles.divider} />

            <Text style={styles.noteText}>
              Your Premium plan will automatically renew on its expiration date.
              You can cancel your subscription at any time in Settings.
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.colors.primary }]}
          onPress={() => navigation.navigate("Tabs", { screen: "Profile" })}
        >
          <Text style={styles.buttonText}>Start experiencing now</Text>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  closeButton: {
    position: "absolute",
    top: 25,
    right: 15,
    zIndex: 10,
    padding: 5,
  },
  container: {
    flex: 1,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  animationContainer: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  animation: {
    width: "100%",
    height: "100%",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: "#666",
    marginBottom: 30,
    textAlign: "center",
  },
  card: {
    width: "100%",
    backgroundColor: "#f8f8f8",
    borderRadius: 16,
    padding: 20,
    marginBottom: 25,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  badgeContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  badge: {
    backgroundColor: "#4776E6",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  badgeText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  infoContainer: {
    width: "100%",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 16,
    color: "#666",
  },
  infoValue: {
    fontSize: 16,
    color: "#333",
    fontWeight: "600",
  },
  divider: {
    height: 1,
    backgroundColor: "#ddd",
    width: "100%",
    marginVertical: 15,
  },
  noteText: {
    fontSize: 14,
    color: "#888",
    lineHeight: 20,
  },
  benefitsContainer: {
    width: "100%",
    marginBottom: 25,
  },
  benefitsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  benefitRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  benefitText: {
    fontSize: 16,
    color: "#333",
    marginLeft: 10,
  },
  button: {
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 12,
    width: "100%",
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default SuccessScreen;
