import {
  View,
  Text,
  TouchableOpacity,
} from "react-native";
import {
  Feather,
  FontAwesome,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const COLORS = {
  primary: "#217a3b", // Deep Green
  secondary: "#43a047", // Lighter Green
  accent: "#FFD700", // Gold
  bg: "#f6fff7", // Very light green background
  card: "#ffffff", // White for cards
  border: "#b2dfdb", // Soft green border
  text: "#1b3c1a", // Dark green text
  muted: "#a5a5a5", // Muted gray
};

const BottomNav = () => {
    const navigation = useNavigation();
  return (
   <View
        style={{
          flexDirection: "row",
          justifyContent: "space-around",
          paddingVertical: 16,
          borderTopWidth: 2,
          borderTopColor: COLORS.accent,
          backgroundColor: COLORS.card,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          shadowColor: COLORS.primary,
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 2,
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
        }}
      >
        <TouchableOpacity style={{ alignItems: "center" }} onPress={() => navigation.navigate("home")}>
          <FontAwesome name="home" size={26} color={COLORS.primary} />
          <Text
            style={{
              color: COLORS.primary,
              fontSize: 12,
              marginTop: 4,
              fontWeight: "bold",
            }}
          >
            Home
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{ alignItems: "center" }}
          onPress={() => navigation.navigate("MarketTrends")}
        >
          <MaterialCommunityIcons
            name="chart-line"
            size={26}
            color={COLORS.primary}
          />
          <Text
            style={{
              color: COLORS.primary,
              fontSize: 12,
              marginTop: 4,
              fontWeight: "bold",
            }}
          >
            Market Trends
          </Text>
        </TouchableOpacity>
        {/* <TouchableOpacity style={{ alignItems: "center" }}>
          <FontAwesome name="user-circle" size={26} color={COLORS.primary} />
          <Text
            style={{
              color: COLORS.primary,
              fontSize: 12,
              marginTop: 4,
              fontWeight: "bold",
            }}
          >
            Profile
          </Text>
        </TouchableOpacity> */}
      </View>
  )
}

export default BottomNav