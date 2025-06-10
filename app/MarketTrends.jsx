import React, { useState } from "react";
import { get_user, get_user_costs_and_hours } from "./utils";
import { View, Text, TouchableOpacity, ScrollView, Dimensions, TextInput } from "react-native";
import { LineChart } from "react-native-chart-kit";

import { useDispatch, useSelector } from 'react-redux';
import { setUserId, clearUserId } from './features/authSlice';

// Use the same palette as index.jsx
const COLORS = {
  primary: "#217a3b",
  secondary: "#43a047",
  accent: "#FFD700",
  bg: "#f6fff7",
  card: "#ffffff",
  border: "#b2dfdb",
  text: "#1b3c1a",
  muted: "#a5a5a5",
};

const TABS = ["Price Analysis", "User Analysis"];

export default function MarketTrends({
  userId,
  priceTrends = {
    Yam: [
      { date: "2024-06-01", price: 1200 },
      { date: "2024-06-08", price: 1300 },
      { date: "2024-06-15", price: 1250 },
      { date: "2024-06-22", price: 1400 },
    ],
    Cassava: [
      { date: "2024-06-01", price: 950 },
      { date: "2024-06-08", price: 1000 },
      { date: "2024-06-15", price: 980 },
      { date: "2024-06-22", price: 1100 },
    ],
    Rice: [
      { date: "2024-06-01", price: 1800 },
      { date: "2024-06-08", price: 1850 },
      { date: "2024-06-15", price: 1900 },
      { date: "2024-06-22", price: 2000 },
    ],
  },
}) {
  // State for dynamic crops, user, userCosts, userHours
  const [crops, setCrops] = useState([]);
  const [user, setUser] = useState("");
  const [userCosts, setUserCosts] = useState({});
  const [userHours, setUserHours] = useState({});
  const [activeTab, setActiveTab] = useState(0);
  const [selectedCrop, setSelectedCrop] = useState("");

  const dispatch = useDispatch();
  const _userId = useSelector((state) => state.auth.userId);
  // Fetch crops, user, userCosts, userHours on mount
  React.useEffect(() => {
    const fetchData = async () => {
      // Replace with your actual API call functions
      const res = await get_user(_userId);
      if (res.status && res.data.status_code === 200) {
        const loadedCrops = res.data.user.crops || [];
        setCrops(loadedCrops);
        setUser(res.data.user.name);
        if (loadedCrops.length > 0) setSelectedCrop(loadedCrops[0].name);
      }
      // Fetch userCosts and userHours from another endpoint
      const costRes = await get_user_costs_and_hours(_userId);
      if (costRes.status && costRes.data.status_code === 200) {
        setUserCosts(costRes.data.userCosts || {});
        setUserHours(costRes.data.userHours || {});
      }
    };
    fetchData();
  }, [userId]);

  // New state for yam size inputs
  const [bigCount, setBigCount] = useState("");
  const [mediumCount, setMediumCount] = useState("");
  const [smallCount, setSmallCount] = useState("");
  const [profitMargin, setProfitMargin] = useState("20"); // default 20%

  // Crop-specific data
  const cropPriceData = priceTrends[selectedCrop] || [];
  const cropHoursData = userHours[selectedCrop] || [];
  const cropCostData = userCosts[selectedCrop] || [];

  // Get current total cost
  const currentTotalCost =
    cropCostData && cropCostData.length > 0
      ? cropCostData[cropCostData.length - 1].totalCost
      : 0;

  // Calculate total tubers and cost per tuber by size
  const big = parseInt(bigCount) || 0;
  const medium = parseInt(mediumCount) || 0;
  const small = parseInt(smallCount) || 0;
  const totalTubers = big + medium + small;

  // Assign weights/cost multipliers for each size (example: big=1.5x, medium=1x, small=0.7x)
  const bigWeight = 1.5, mediumWeight = 1, smallWeight = 0.7;
  const totalWeighted = big * bigWeight + medium * mediumWeight + small * smallWeight;

  // Cost per weighted tuber
  const costPerWeightedTuber = totalWeighted > 0 ? currentTotalCost / totalWeighted : 0;

  // Predicted cost per tuber by size
  const costPerBig = costPerWeightedTuber * bigWeight;
  const costPerMedium = costPerWeightedTuber * mediumWeight;
  const costPerSmall = costPerWeightedTuber * smallWeight;

  // Monte Carlo + Dual Objective Programming for expected selling price
  function monteCarloDualObjective() {
    const priceArr = (priceTrends[selectedCrop] || []).map(d => d.price);
    if (!priceArr.length) return 0;
    const mean = priceArr.reduce((a, b) => a + b, 0) / priceArr.length;
    const stddev = Math.sqrt(
      priceArr.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b, 0) / priceArr.length
    );
    // Monte Carlo: generate 1000 samples, maximize profit with dual objective (cost & price)
    let sum = 0;
    for (let i = 0; i < 1000; i++) {
      const u = Math.random();
      const v = Math.random();
      const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
      let simulatedPrice = mean + stddev * z;
      // Dual objective: balance between cost and market price
      // Example: 60% weight to market price, 40% to cost + profit margin
      const margin = parseFloat(profitMargin) / 100;
      const costObjective = costPerWeightedTuber * (1 + margin);
      const dualPrice = 0.6 * simulatedPrice + 0.4 * costObjective;
      sum += dualPrice;
    }
    return Math.max(0, Math.round(sum / 1000));
  }

  // Only show the tuber input and prediction for Yam
  const showYamInputs = selectedCrop === "Yam";

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bg, paddingHorizontal: 16, paddingTop: 24 }}>
      {/* Crop Selector */}
      <ScrollView horizontal style={{ flexDirection: "row", marginBottom: 18 }}>
        {crops.map((crop, idx) => (
          <TouchableOpacity
            key={crop.id}
            onPress={() => setSelectedCrop(crop)}
            style={{
              height: 45,
              paddingHorizontal: 20,
              paddingVertical: 10,
              borderRadius: 24,
              borderWidth: 2,
              borderColor: selectedCrop === crop ? COLORS.primary : COLORS.border,
              backgroundColor: selectedCrop === crop ? COLORS.primary : COLORS.card,
              marginRight: 12,
              shadowColor: COLORS.primary,
              shadowOpacity: 0.08,
              shadowRadius: 4,
            }}
          >
            <Text style={{
              fontSize: 16,
              fontWeight: "600",
              color: selectedCrop === crop ? COLORS.accent : COLORS.primary,
            }}>
              {crop.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Tabs */}
      <View style={{ flexDirection: "row", marginBottom: 24 }}>
        {TABS.map((tab, idx) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(idx)}
            style={{
              flex: 1,
              paddingVertical: 14,
              borderRadius: 16,
              backgroundColor: activeTab === idx ? COLORS.primary : COLORS.card,
              marginRight: idx === 0 ? 8 : 0,
              borderWidth: 2,
              borderColor: activeTab === idx ? COLORS.primary : COLORS.border,
            }}
          >
            <Text
              style={{
                textAlign: "center",
                fontWeight: "bold",
                color: activeTab === idx ? COLORS.accent : COLORS.primary,
                fontSize: 16,
              }}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tab Content */}
      {activeTab === 0 ? (
        // Price Analysis Tab (crop-specific)
        <ScrollView
          style={{
            backgroundColor: COLORS.card,
            borderRadius: 18,
            padding: 18,
            shadowColor: COLORS.primary,
            shadowOpacity: 0.07,
            shadowRadius: 6,
            elevation: 2,
          }}
          contentContainerStyle={{ paddingTop: 0 }}
        >
          {/* --- Current Total Cost & Estimated Fair Selling Price --- */}
          <View
            style={{
              backgroundColor: COLORS.secondary,
              borderRadius: 14,
              padding: 16,
              marginBottom: 18,
              borderWidth: 2,
              borderColor: COLORS.accent,
              shadowColor: COLORS.primary,
              shadowOpacity: 0.08,
              shadowRadius: 4,
            }}
          >
            <Text style={{ color: COLORS.card, fontWeight: "bold", fontSize: 16, marginBottom: 6 }}>
              Current Total Cost of {selectedCrop} Production
            </Text>
            <Text style={{ color: COLORS.accent, fontWeight: "bold", fontSize: 24, marginBottom: 10 }}>
              ₦{currentTotalCost.toLocaleString()}
            </Text>

            {showYamInputs && (
              <>
                <Text style={{ color: COLORS.card, fontWeight: "bold", fontSize: 16, marginBottom: 6, marginTop: 10 }}>
                  Enter Number of Tubers Produced
                </Text>
                <View style={{ flexDirection: "row", marginBottom: 8 }}>
                  <View style={{ flex: 1, marginRight: 6 }}>
                    <Text style={{ color: COLORS.card, fontSize: 14, marginBottom: 2 }}>Big</Text>
                    <TextInput
                      value={bigCount}
                      onChangeText={setBigCount}
                      keyboardType="numeric"
                      placeholder="0"
                      style={{
                        backgroundColor: COLORS.bg,
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor: COLORS.accent,
                        color: COLORS.text,
                        paddingHorizontal: 10,
                        paddingVertical: 6,
                        marginBottom: 2,
                      }}
                      placeholderTextColor={COLORS.muted}
                    />
                  </View>
                  <View style={{ flex: 1, marginRight: 6 }}>
                    <Text style={{ color: COLORS.card, fontSize: 14, marginBottom: 2 }}>Medium</Text>
                    <TextInput
                      value={mediumCount}
                      onChangeText={setMediumCount}
                      keyboardType="numeric"
                      placeholder="0"
                      style={{
                        backgroundColor: COLORS.bg,
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor: COLORS.accent,
                        color: COLORS.text,
                        paddingHorizontal: 10,
                        paddingVertical: 6,
                        marginBottom: 2,
                      }}
                      placeholderTextColor={COLORS.muted}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: COLORS.card, fontSize: 14, marginBottom: 2 }}>Small</Text>
                    <TextInput
                      value={smallCount}
                      onChangeText={setSmallCount}
                      keyboardType="numeric"
                      placeholder="0"
                      style={{
                        backgroundColor: COLORS.bg,
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor: COLORS.accent,
                        color: COLORS.text,
                        paddingHorizontal: 10,
                        paddingVertical: 6,
                        marginBottom: 2,
                      }}
                      placeholderTextColor={COLORS.muted}
                    />
                  </View>
                </View>
                <Text style={{ color: COLORS.card, fontSize: 14, marginBottom: 2, marginTop: 6 }}>
                  Profit Margin (%)
                </Text>
                <TextInput
                  value={profitMargin}
                  onChangeText={setProfitMargin}
                  keyboardType="numeric"
                  placeholder="20"
                  style={{
                    backgroundColor: COLORS.bg,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: COLORS.accent,
                    color: COLORS.text,
                    paddingHorizontal: 10,
                    paddingVertical: 6,
                    marginBottom: 8,
                  }}
                  placeholderTextColor={COLORS.muted}
                />
                <View style={{ marginTop: 8, marginBottom: 6 }}>
                  <Text style={{ color: COLORS.card, fontWeight: "bold", fontSize: 15, marginBottom: 2 }}>
                    Cost Per Tuber (Predicted)
                  </Text>
                  <Text style={{ color: COLORS.card, fontSize: 14 }}>
                    Big: ₦{isFinite(costPerBig) ? Math.round(costPerBig).toLocaleString() : "0"}
                  </Text>
                  <Text style={{ color: COLORS.card, fontSize: 14 }}>
                    Medium: ₦{isFinite(costPerMedium) ? Math.round(costPerMedium).toLocaleString() : "0"}
                  </Text>
                  <Text style={{ color: COLORS.card, fontSize: 14 }}>
                    Small: ₦{isFinite(costPerSmall) ? Math.round(costPerSmall).toLocaleString() : "0"}
                  </Text>
                </View>
                <Text style={{ color: COLORS.card, fontWeight: "bold", fontSize: 15, marginTop: 6 }}>
                  Expected Total Revenue (with Profit)
                </Text>
                <Text style={{ color: COLORS.accent, fontWeight: "bold", fontSize: 20 }}>
                  ₦
                  {isFinite(totalTubers)
                    ? (
                        Math.round(
                          monteCarloDualObjective() * totalTubers
                        ).toLocaleString()
                      )
                    : "0"}
                </Text>
              </>
            )}

            <Text style={{ color: COLORS.card, fontWeight: "bold", fontSize: 16, marginBottom: 6, marginTop: showYamInputs ? 10 : 0 }}>
              Estimated Fair Selling Price
            </Text>
            <Text style={{ color: COLORS.accent, fontWeight: "bold", fontSize: 24 }}>
              ₦
              {(() => {
                // --- Monte Carlo Simulation for Fair Price Estimate ---
                const priceArr = (priceTrends[selectedCrop] || []).map(d => d.price);
                if (!priceArr.length) return "0";
                const mean = priceArr.reduce((a, b) => a + b, 0) / priceArr.length;
                const stddev = Math.sqrt(
                  priceArr.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b, 0) / priceArr.length
                );
                let sum = 0;
                for (let i = 0; i < 1000; i++) {
                  const u = Math.random();
                  const v = Math.random();
                  const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
                  sum += mean + stddev * z;
                }
                const fairPrice = Math.max(0, Math.round(sum / 1000));
                return fairPrice.toLocaleString();
              })()}
            </Text>
            <Text style={{ color: COLORS.card, fontSize: 12, fontStyle: "italic", marginTop: 6 }}>
              Based on recent trends and Monte Carlo simulation
            </Text>
          </View>
          {/* --- End of Summary Section --- */}

          <Text style={{
            fontSize: 20,
            fontWeight: "bold",
            color: COLORS.primary,
            marginBottom: 12,
            marginTop: 0,
          }}>
            {selectedCrop} Price Trend
          </Text>
          <LineChart
            data={{
              labels: cropPriceData.map((d) => d.date.slice(5)),
              datasets: [{ data: cropPriceData.map((d) => d.price) }],
            }}
            width={Dimensions.get("window").width - 48}
            height={180}
            yAxisLabel="₦"
            chartConfig={{
              backgroundColor: COLORS.card,
              backgroundGradientFrom: COLORS.card,
              backgroundGradientTo: COLORS.card,
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(255, 215, 0, ${opacity})`, // Gold
              labelColor: (opacity = 1) => `rgba(33, 122, 59, ${opacity})`,
              style: { borderRadius: 16 },
              propsForDots: {
                r: "6",
                strokeWidth: "2",
                stroke: COLORS.primary,
              },
            }}
            bezier
            style={{
              borderRadius: 16,
              marginVertical: 8,
            }}
          />
          <Text style={{ color: COLORS.muted, marginTop: 10, fontSize: 12, fontStyle: "italic" }}>
            Price trend for {selectedCrop} over time.
          </Text>
        </ScrollView>
      ) : (
        // User Analysis Tab (crop-specific)
        <ScrollView style={{ backgroundColor: COLORS.card, borderRadius: 18, padding: 18, shadowColor: COLORS.primary, shadowOpacity: 0.07, shadowRadius: 6, elevation: 2 }}>
          <Text style={{ fontSize: 20, fontWeight: "bold", color: COLORS.primary, marginBottom: 12 }}>
            {selectedCrop} - Hours Worked Trend
          </Text>
          <LineChart
            data={{
              labels: cropHoursData.map((d) => d.date.slice(5)),
              datasets: [{ data: cropHoursData.map((d) => d.hours) }],
            }}
            width={Dimensions.get("window").width - 48}
            height={180}
            yAxisSuffix="h"
            chartConfig={{
              backgroundColor: COLORS.card,
              backgroundGradientFrom: COLORS.card,
              backgroundGradientTo: COLORS.card,
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(33, 122, 59, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(67, 160, 71, ${opacity})`,
              style: { borderRadius: 16 },
              propsForDots: {
                r: "6",
                strokeWidth: "2",
                stroke: COLORS.accent,
              },
            }}
            bezier
            style={{
              borderRadius: 16,
              marginVertical: 8,
            }}
          />
          <Text style={{ color: COLORS.muted, marginTop: 10, fontSize: 12, fontStyle: "italic" }}>
            Track your work hours for {selectedCrop}.
          </Text>

          {/* Total Cost Per Day Graph */}
          <Text style={{ fontSize: 20, fontWeight: "bold", color: COLORS.primary, marginTop: 28, marginBottom: 12 }}>
            {selectedCrop} - Total Cost Per Day
          </Text>
          <LineChart
            data={{
              labels: cropCostData.map((d) => d.date.slice(5)),
              datasets: [{ data: cropCostData.map((d) => d.totalCost) }],
            }}
            width={Dimensions.get("window").width - 48}
            height={180}
            yAxisSuffix=""
            yAxisLabel="₦"
            chartConfig={{
              backgroundColor: COLORS.card,
              backgroundGradientFrom: COLORS.card,
              backgroundGradientTo: COLORS.card,
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(255, 215, 0, ${opacity})`, // Gold
              labelColor: (opacity = 1) => `rgba(33, 122, 59, ${opacity})`,
              style: { borderRadius: 16 },
              propsForDots: {
                r: "6",
                strokeWidth: "2",
                stroke: COLORS.primary,
              },
            }}
            bezier
            style={{
              borderRadius: 16,
              marginVertical: 8,
            }}
          />
          <Text style={{ color: COLORS.muted, marginTop: 10, fontSize: 12, fontStyle: "italic" }}>
            See your total cost inputted for {selectedCrop} each day.
          </Text>
        </ScrollView>
      )}
    </View>
  );
}