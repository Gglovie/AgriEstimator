import React, { useState } from "react";
import { get_user_costs_and_hours } from "./utils";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  TextInput,
} from "react-native";
import { LineChart } from "react-native-chart-kit";
import { useDispatch, useSelector } from "react-redux";

import { create_crop, get_user, create_cost, calc_fair_share } from "./utils";
import { defaultCosts } from "./home";
import BottomNav from "./components/BottomNav";

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

export default function MarketTrends() {
  const [userHours, setUserHours] = useState({});
  const [userCosts, setUserCosts] = useState({});
  const [crops, setCrops] = useState([]);
  const [selectedCrop, setSelectedCrop] = useState("");
  const [activeTab, setActiveTab] = useState(0);
  const [costUnits, setCostUnits] = useState(0);
  const [loading, setLoading] = useState(true);
  const [costPerUnits, setCostPerUnits] = useState(0);
  const [fairCostPerUnits, setFairCostPerUnits] = useState(0);
  const [fairTotalCost, setFairTotalCost] = useState(0);
  const [estTotalCost, setEstTotalCost] = useState(0);
  const [profitMargin, setProfitMargin] = useState(0);
  const [profit, setProfit] = useState(0);

  // Dummy priceTrends for simulation (does not change with crop)
  const priceTrends = [
    { date: "2024-06-01", price: 1200 },
    { date: "2024-06-08", price: 1300 },
    { date: "2024-06-15", price: 1250 },
    { date: "2024-06-22", price: 1400 },
    { date: "2024-06-29", price: 1350 },
    { date: "2024-07-06", price: 1450 },
  ];

  const dispatch = useDispatch();
  const _userId = useSelector((state) => state.auth.userId);

  React.useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const res = await get_user_costs_and_hours(_userId);
      if (res.status && res.data) {
        setUserHours(res.data.hours || {});
        setUserCosts(res.data.costs || {});
        const cropNames = Object.keys(res.data.costs || {});
        setCrops(cropNames);
        if (cropNames.length > 0) setSelectedCrop(cropNames[0]);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleFairPrice = async () => {
    // costUnits
    const res = await calc_fair_share(_userId, selectedCrop, costUnits);

    if (res.status && res.data) {
      setCostPerUnits(res.data.result.suggested_minimum_price_per_kg || 0);
      setFairCostPerUnits(res.data.result.cost_per_kg || 0);
      setFairTotalCost(res.data.result.fair_price || 0);
      setEstTotalCost(res.data.result.final_price_with_profit || 0);
      setProfitMargin(res.data.result.profit_margin_percent || 0);
      setProfit(res.data.result.profit || 0);
    }

    console.log(res);
  };

  // Crop-specific data
  const cropHoursData = Array.isArray(userHours[selectedCrop]) ? userHours[selectedCrop] : [];
  // Fix: support both 'totalCost' and 'price' as the cost field (API may return either)
  const cropCostData = Array.isArray(userCosts[selectedCrop]) ? userCosts[selectedCrop] : [];
  // Use 'price' if present, else 'totalCost'
  const getCostValue = (d) =>
    typeof d.price === "number" ? d.price : typeof d.totalCost === "number" ? d.totalCost : 0;

  // Sum all prices for currentTotalCost
  const currentTotalCost = cropCostData.reduce((sum, d) => sum + getCostValue(d), 0);
  // const currentTotalCost = cropCostData.length > 0 ? getCostValue(cropCostData[cropCostData.length - 1]) : 0;

  // For price trend chart (always the same dummy data)
  const priceLabels = priceTrends.map((d) => d.date.slice(5));
  const priceData = priceTrends.map((d) => d.price);

  // For user hours chart
  const hoursLabels =
    cropHoursData.length > 0
      ? cropHoursData.map((d) => {
          if (d.date) {
            const dt = new Date(d.date * 1000);
            return `${dt.getMonth() + 1}-${dt.getDate()}`;
          }
          return "-";
        }) : [];
  const hoursData =
    cropHoursData.length > 0 ? cropHoursData.map((d) => d.hours) : [];

  // For user costs chart
  const costLabels =
    cropCostData.length > 0
      ? cropCostData.map((d) => {
          if (d.date) {
            const dt = new Date(d.date * 1000);
            return `${dt.getMonth() + 1}-${dt.getDate()}`;
          }
          return "-";
        }) : [];
  const costData =
    cropCostData.length > 0 ? cropCostData.map(getCostValue) : [];

  // Helper to round up to nearest 10 or 100
  function roundUp(value) {
    if (value < 100) return Math.ceil(value / 10) * 10;
    return Math.ceil(value / 100) * 100;
  }

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <ScrollView
      style={{
        flex: 1,
        backgroundColor: COLORS.bg,
        paddingHorizontal: 16,
        paddingTop: 24, 
        marginBottom: 100,
      }}
    >
      {/* Crop Selector */}
      <ScrollView horizontal style={{ flexDirection: "row", marginBottom: 18, height:50, }}>
        {crops.map((crop) => (
          <TouchableOpacity
            key={crop}
            onPress={() => setSelectedCrop(crop)}
            style={{
              height: 45,
              paddingHorizontal: 20,
              paddingVertical: 10,
              borderRadius: 24,
              borderWidth: 2,
              borderColor:
                selectedCrop === crop ? COLORS.primary : COLORS.border,
              backgroundColor:
                selectedCrop === crop ? COLORS.primary : COLORS.card,
              marginRight: 12,
              shadowColor: COLORS.primary,
              shadowOpacity: 0.08,
              shadowRadius: 4,
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: "600",
                color: selectedCrop === crop ? COLORS.accent : COLORS.primary,
              }}
            >
              {crop}
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
        // Price Analysis Tab (trend chart is always the same dummy data)
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
          {/* --- Current Total Cost --- */}
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
            <Text
              style={{
                color: COLORS.card,
                fontWeight: "bold",
                fontSize: 16,
                marginBottom: 6,
              }}
            >
              Current Total Cost of {selectedCrop} Production
            </Text>
            <Text
              style={{
                color: COLORS.accent,
                fontWeight: "bold",
                fontSize: 24,
                marginBottom: 10,
              }}
            >
              ₦{currentTotalCost}
            </Text>
            <Text
              style={{
                color: COLORS.card,
                fontSize: 14,
                marginBottom: 2,
                marginTop: 6,
              }}
            >
              Number of units (kg)
            </Text>
            <TextInput
              value={costUnits}
              onChangeText={setCostUnits}
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
            <TouchableOpacity
              onPress={handleFairPrice}
              style={{
                backgroundColor: COLORS.accent,
                paddingVertical: 14,
                marginTop: 8,
                borderRadius: 16,
                shadowColor: COLORS.accent,
                shadowOpacity: 0.15,
                shadowRadius: 8,
                elevation: 3,
              }}
            >
              <Text
                style={{
                  textAlign: "center",
                  fontWeight: "bold",
                  fontSize: 18,
                  color: COLORS.primary,
                  letterSpacing: 1,
                }}
              >
                Calculate Fair Price
              </Text>
            </TouchableOpacity>
            {/* Aesthetic display of fair price info */}
            {(costPerUnits ||
              fairCostPerUnits ||
              fairTotalCost ||
              estTotalCost) > 0 && (
              <View
                style={{
                  marginTop: 18,
                  backgroundColor: COLORS.bg,
                  borderRadius: 14,
                  borderWidth: 1.5,
                  borderColor: COLORS.accent,
                  padding: 18,
                  shadowColor: COLORS.primary,
                  shadowOpacity: 0.08,
                  shadowRadius: 6,
                  elevation: 2,
                }}
              >
                <Text
                  style={{
                    color: COLORS.primary,
                    fontWeight: "bold",
                    fontSize: 16,
                    marginBottom: 8,
                  }}
                >
                  Fair Price Analysis
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    marginBottom: 6,
                  }}
                >
                  <Text style={{ color: COLORS.text, fontSize: 15 }}>
                    Suggested Min Price per kg:
                  </Text>
                  <Text
                    style={{
                      color: COLORS.accent,
                      fontWeight: "bold",
                      fontSize: 16,
                    }}
                  >
                    ₦{roundUp(costPerUnits)}
                  </Text>
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    marginBottom: 6,
                  }}
                >
                  <Text style={{ color: COLORS.text, fontSize: 15 }}>
                    Cost per kg:
                  </Text>
                  <Text
                    style={{
                      color: COLORS.secondary,
                      fontWeight: "bold",
                      fontSize: 16,
                    }}
                  >
                    ₦{roundUp(fairCostPerUnits)}
                  </Text>
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    marginBottom: 6,
                  }}
                >
                  <Text style={{ color: COLORS.text, fontSize: 15 }}>
                    Fair Price (Total):
                  </Text>
                  <Text
                    style={{
                      color: COLORS.primary,
                      fontWeight: "bold",
                      fontSize: 16,
                    }}
                  >
                    ₦{roundUp(fairTotalCost)}
                  </Text>
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    marginBottom: 12,
                  }}
                >
                  <Text style={{ color: COLORS.text, fontSize: 15 }}>
                    Estimated Total Cost:
                  </Text>
                  <Text
                    style={{
                      color: COLORS.primary,
                      fontWeight: "bold",
                      fontSize: 16,
                    }}
                  >
                    ₦{roundUp(estTotalCost)}
                  </Text>
                </View>
                {/* Profit Margin and Profit */}
                <View
                  style={{
                    backgroundColor: COLORS.secondary,
                    borderRadius: 10,
                    padding: 12,
                    marginTop: 8,
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <View>
                    <Text
                      style={{
                        color: COLORS.card,
                        fontWeight: "bold",
                        fontSize: 15,
                      }}
                    >
                      Profit Margin
                    </Text>
                    <Text
                      style={{
                        color: COLORS.accent,
                        fontWeight: "bold",
                        fontSize: 18,
                      }}
                    >
                      {fairCostPerUnits && costPerUnits
                        ? `${Math.round(profitMargin)}%`
                        : "0%"}
                    </Text>
                  </View>
                  <View>
                    <Text
                      style={{
                        color: COLORS.card,
                        fontWeight: "bold",
                        fontSize: 15,
                      }}
                    >
                      Profit
                    </Text>
                    <Text
                      style={{
                        color: COLORS.accent,
                        fontWeight: "bold",
                        fontSize: 18,
                      }}
                    >
                      ₦{fairCostPerUnits && costPerUnits
                        ? roundUp(profit)
                        : 0}
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </View>
          {/* --- Price Trend Chart (dummy, not crop-specific) --- */}
          <Text
            style={{
              fontSize: 20,
              fontWeight: "bold",
              color: COLORS.primary,
              marginBottom: 12,
              marginTop: 0,
            }}
          >
            Price Trend (Simulated)
          </Text>
          <LineChart
            data={{
              labels: priceLabels,
              datasets: [{ data: priceData }],
            }}
            width={Dimensions.get("window").width - 48}
            height={180}
            yAxisLabel="₦"
            chartConfig={{
              backgroundColor: COLORS.card,
              backgroundGradientFrom: COLORS.card,
              backgroundGradientTo: COLORS.card,
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(255, 215, 0, ${opacity})`,
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
          <Text
            style={{
              color: COLORS.muted,
              marginTop: 10,
              fontSize: 12,
              fontStyle: "italic",
            }}
          >
            Simulated price trend (not crop-specific)
          </Text>
        </ScrollView>
      ) : (
        // User Analysis Tab
        <ScrollView
          style={{
            backgroundColor: COLORS.card,
            borderRadius: 18,
            // marginTop: -20,
            padding: 18,
            // paddingTop: -20,
            shadowColor: COLORS.primary,
            shadowOpacity: 0.07,
            shadowRadius: 6,
            elevation: 2,
          }}
          contentContainerStyle={{ paddingTop: 0 }}
        >
          <Text
            style={{
              fontSize: 20,
              fontWeight: "bold",
              color: COLORS.primary,
              marginBottom: 12,
            }}
          >
            {selectedCrop} - Hours Worked Trend
          </Text>
          {hoursData.length > 0 ? (
            <LineChart
              data={{
                labels: hoursLabels,
                datasets: [{ data: hoursData }],
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
          ) : (
            <Text
              style={{
                color: COLORS.muted,
                fontSize: 14,
                fontStyle: "italic",
                marginBottom: 16,
              }}
            >
              No hours data for this crop.
            </Text>
          )}
          <Text
            style={{
              color: COLORS.muted,
              marginTop: 10,
              fontSize: 12,
              fontStyle: "italic",
            }}
          >
            Track your work hours for {selectedCrop}.
          </Text>

          {/* Total Cost Per Day Graph */}
          <Text
            style={{
              fontSize: 20,
              fontWeight: "bold",
              color: COLORS.primary,
              marginTop: 28,
              marginBottom: 12,
            }}
          >
            {selectedCrop} - Total Cost Per Day
          </Text>
          {costData.length > 0 ? (
            <LineChart
              data={{
                labels: costLabels,
                datasets: [{ data: costData }],
              }}
              width={Dimensions.get("window").width - 48}
              height={180}
              yAxisLabel="₦"
              chartConfig={{
                backgroundColor: COLORS.card,
                backgroundGradientFrom: COLORS.card,
                backgroundGradientTo: COLORS.card,
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(255, 215, 0, ${opacity})`,
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
          ) : (
            <Text
              style={{
                color: COLORS.muted,
                fontSize: 14,
                fontStyle: "italic",
                marginBottom: 16,
              }}
            >
              No cost data for this crop.
            </Text>
          )}
          <Text
            style={{
              color: COLORS.muted,
              marginTop: 10,
              fontSize: 12,
              fontStyle: "italic",
            }}
          >
            See your total cost inputted for {selectedCrop} each day.
          </Text>
        </ScrollView>
      )}
    </ScrollView>
    <BottomNav/>
    </View>
  );
}
