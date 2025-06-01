import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, Dimensions } from "react-native";
import { LineChart } from "react-native-chart-kit";

const TABS = ["Price Analysis", "User Analysis"];

export default function MarketTrends({ userData = [] }) {
  const [activeTab, setActiveTab] = useState(0);

  // Dummy data for price analysis
  const priceData = [
    { crop: "Yam", price: 1200 },
    { crop: "Cassava", price: 950 },
    { crop: "Rice", price: 1800 },
  ];

  // Example user data for hours worked trend (replace with real user data)
  // userData = [{ date: "2024-06-01", hours: 5 }, ...]
  const hoursData = userData.length
    ? userData
    : [
        { date: "2024-06-01", hours: 4 },
        { date: "2024-06-08", hours: 6 },
        { date: "2024-06-15", hours: 5 },
        { date: "2024-06-22", hours: 7 },
      ];

  return (
    <View className="flex-1 bg-lavender px-4 pt-8">
      {/* Tabs */}
      <View className="flex-row mb-6">
        {TABS.map((tab, idx) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(idx)}
            className={`flex-1 py-3 rounded-t-xl ${
              activeTab === idx ? "bg-savoy-blue" : "bg-white"
            }`}
            style={{
              borderBottomWidth: activeTab === idx ? 0 : 2,
              borderBottomColor: "#009CA6",
            }}
          >
            <Text
              className={`text-center text-base font-bold ${
                activeTab === idx ? "text-white" : "text-savoy-blue"
              }`}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tab Content */}
      {activeTab === 0 ? (
        // Price Analysis Tab
        <ScrollView className="bg-white rounded-2xl p-5 shadow">
          <Text className="text-xl font-bold text-savoy-blue mb-4">General Fair Pricing</Text>
          {priceData.map((item) => (
            <View
              key={item.crop}
              className="flex-row justify-between items-center mb-3 border-b border-tiffany-blue pb-2"
            >
              <Text className="text-savoy-blue font-semibold">{item.crop}</Text>
              <Text className="text-tiffany-blue font-bold">₦{item.price.toLocaleString()}</Text>
            </View>
          ))}
          <Text className="text-gray-500 mt-4 text-xs italic">
            Prices are averages from recent market data.
          </Text>
        </ScrollView>
      ) : (
        // User Analysis Tab
        <ScrollView className="bg-white rounded-2xl p-5 shadow">
          <Text className="text-xl font-bold text-savoy-blue mb-4">Your Hours Worked Trend</Text>
          <LineChart
            data={{
              labels: hoursData.map((d) => d.date.slice(5)), // MM-DD
              datasets: [{ data: hoursData.map((d) => d.hours) }],
            }}
            width={Dimensions.get("window").width - 48}
            height={220}
            yAxisSuffix="h"
            chartConfig={{
              backgroundColor: "#fff",
              backgroundGradientFrom: "#fff",
              backgroundGradientTo: "#fff",
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(26, 35, 126, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 156, 166, ${opacity})`,
              style: { borderRadius: 16 },
              propsForDots: {
                r: "6",
                strokeWidth: "2",
                stroke: "#009CA6",
              },
            }}
            bezier
            style={{
              borderRadius: 16,
              marginVertical: 8,
            }}
          />
          <Text className="text-gray-500 mt-4 text-xs italic">
            Track your work hours trend over time.
          </Text>
        </ScrollView>
      )}
    </View>
  );
}