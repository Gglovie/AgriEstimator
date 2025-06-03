import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Pressable,
} from "react-native";
import { Feather, FontAwesome, MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from '@react-navigation/native';

// New color palette
const COLORS = {
  primary: "#217a3b",      // Deep Green
  secondary: "#43a047",    // Lighter Green
  accent: "#FFD700",       // Gold
  bg: "#f6fff7",           // Very light green background
  card: "#ffffff",         // White for cards
  border: "#b2dfdb",       // Soft green border
  text: "#1b3c1a",         // Dark green text
  muted: "#a5a5a5",        // Muted gray
};

const initialCrops = ["Yam", "Cassava", "Rice"];
const defaultCosts = [
  { label: "Number of hours worked", entries: [] },
  { label: "Labour cost", entries: [] },
  { label: "Cost of seeds", entries: [] },
  { label: "Fertilizers", entries: [] },
  { label: "Equipment", entries: [] },
  { label: "Land use", entries: [] },
];

export default function AgrestimatorScreen() {
  const [crops, setCrops] = useState(initialCrops);
  const [selectedCrop, setSelectedCrop] = useState("Yam");
  const [costData, setCostData] = useState({
    Yam: JSON.parse(JSON.stringify(defaultCosts)),
    Cassava: JSON.parse(JSON.stringify(defaultCosts)),
    Rice: JSON.parse(JSON.stringify(defaultCosts)),
  });
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState("edit");
  const [editingIndex, setEditingIndex] = useState(null);
  const [inputValue, setInputValue] = useState("");
  const [newCropName, setNewCropName] = useState("");
  const [newCostLabel, setNewCostLabel] = useState("");
  const navigation = useNavigation();

  const openEditModal = (index) => {
    setEditingIndex(index);
    const lastEntry =
      costData[selectedCrop][index]?.entries?.slice(-1)[0]?.split(" (Logged:")[0] || "";
    setInputValue(lastEntry);
    setModalType("edit");
    setModalVisible(true);
  };

  const openAddCropModal = () => {
    setModalType("crop");
    setNewCropName("");
    setModalVisible(true);
  };

  const openAddCostModal = () => {
    setModalType("cost");
    setNewCostLabel("");
    setModalVisible(true);
  };

  const handleSave = () => {
    if (modalType === "edit") {
      const label = costData[selectedCrop][editingIndex]?.label;
      let newEntry = "";
      if (label === "Number of hours worked") {
        // Multiply hours by 1500 and show both in entry
        const hours = parseFloat(inputValue);
        if (!isNaN(hours)) {
          const cost = hours * 1500;
          newEntry = `${hours} hours = ₦${cost.toLocaleString()} (Logged: ${new Date().toLocaleString()})`;
        } else {
          newEntry = `0 hours = ₦0 (Logged: ${new Date().toLocaleString()})`;
        }
      } else {
        newEntry = `${inputValue} (Logged: ${new Date().toLocaleString()})`;
      }
      const updatedCosts = [...costData[selectedCrop]];
      updatedCosts[editingIndex].entries.push(newEntry);
      setCostData({ ...costData, [selectedCrop]: updatedCosts });
    } else if (modalType === "crop" && newCropName.trim()) {
      const newCrops = [...crops, newCropName];
      setCrops(newCrops);
      setCostData({ ...costData, [newCropName]: JSON.parse(JSON.stringify(defaultCosts)) });
    } else if (modalType === "cost" && newCostLabel.trim()) {
      const updatedCosts = [...costData[selectedCrop], { label: newCostLabel, entries: [] }];
      setCostData({ ...costData, [selectedCrop]: updatedCosts });
    }
    setModalVisible(false);
  };

  const calculateTotal = () => {
    return costData[selectedCrop].reduce((total, item) => {
      const sum = item.entries.reduce((entryTotal, entry) => {
        if (item.label === "Number of hours worked") {
          // Extract hours and multiply by 1500
          const hours = parseFloat(entry.split(" ")[0]);
          const cost = isNaN(hours) ? 0 : hours * 1500;
          return entryTotal + cost;
        } else {
          const numericValue = parseFloat(entry.split(" ")[0]);
          return isNaN(numericValue) ? entryTotal : entryTotal + numericValue;
        }
      }, 0);
      return total + sum;
    }, 0);
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <ScrollView style={{ flex: 1, paddingHorizontal: 16, paddingTop: 24, marginBottom: 80 }}>
        {/* Header */}
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <Text style={{
            fontSize: 32,
            fontWeight: "bold",
            color: COLORS.primary,
            letterSpacing: 1.5,
          }}>
            AGRESTIMATOR
          </Text>
          <Feather name="search" size={28} color={COLORS.primary} />
        </View>

        {/* Crop Selection */}
        <ScrollView horizontal style={{ flexDirection: "row", marginBottom: 24 }}>
          {crops.map((crop, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => setSelectedCrop(crop)}
              style={{
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
                elevation: 2,
              }}
            >
              <Text style={{
                fontSize: 16,
                fontWeight: "600",
                color: selectedCrop === crop ? COLORS.accent : COLORS.primary,
              }}>
                {crop}
              </Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            onPress={openAddCropModal}
            style={{
              backgroundColor: COLORS.accent,
              paddingHorizontal: 20,
              paddingVertical: 10,
              borderRadius: 24,
              borderWidth: 2,
              borderColor: COLORS.accent,
              shadowColor: COLORS.accent,
              shadowOpacity: 0.12,
              shadowRadius: 4,
              elevation: 2,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: "bold", color: COLORS.primary }}>+</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Cost Expenses */}
        <Text style={{
          fontSize: 20,
          fontWeight: "bold",
          color: COLORS.primary,
          marginBottom: 12,
          letterSpacing: 1,
        }}>
          Cost Expenses
        </Text>
        {costData[selectedCrop].map((item, index) => (
          <View key={index} style={{ marginBottom: 16 }}>
            <View style={{
              backgroundColor: COLORS.card,
              borderWidth: 1.5,
              borderColor: COLORS.border,
              borderRadius: 18,
              paddingHorizontal: 18,
              paddingVertical: 14,
              shadowColor: COLORS.primary,
              shadowOpacity: 0.07,
              shadowRadius: 6,
              elevation: 2,
            }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <Text style={{ color: COLORS.primary, fontWeight: "bold", fontSize: 16 }}>{item.label}</Text>
                <TouchableOpacity
                  onPress={() => openEditModal(index)}
                  style={{ padding: 4 }}
                >
                  <FontAwesome name="edit" size={20} color={COLORS.accent} />
                </TouchableOpacity>
              </View>
              {item.entries.length === 0 ? (
                <Text style={{ color: COLORS.muted, fontStyle: "italic" }}>No data entered yet.</Text>
              ) : (
                item.entries.map((entry, i) => (
                  <Text key={i} style={{ color: COLORS.secondary, fontSize: 14, marginBottom: 2 }}>• {entry}</Text>
                ))
              )}
            </View>
          </View>
        ))}

        {/* Add Cost Component */}
        <TouchableOpacity
          onPress={openAddCostModal}
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
          <Text style={{
            textAlign: "center",
            fontWeight: "bold",
            fontSize: 18,
            color: COLORS.primary,
            letterSpacing: 1,
          }}>
            + Add Cost Component
          </Text>
        </TouchableOpacity>

        {/* Total Cost Summary */}
        <View style={{
          marginTop: 32,
          marginBottom: 32,
          padding: 22,
          backgroundColor: COLORS.secondary,
          borderRadius: 18,
          borderWidth: 2,
          borderColor: COLORS.accent,
          shadowColor: COLORS.primary,
          shadowOpacity: 0.10,
          shadowRadius: 8,
          elevation: 2,
        }}>
          <Text style={{
            fontSize: 20,
            fontWeight: "bold",
            color: COLORS.card,
            marginBottom: 6,
            letterSpacing: 1,
          }}>
            Total Cost Summary
          </Text>
          <Text style={{
            fontSize: 32,
            fontWeight: "bold",
            color: COLORS.accent,
            letterSpacing: 1,
          }}>
            ₦{calculateTotal().toLocaleString()}
          </Text>
        </View>

        {/* Modal */}
        <Modal visible={modalVisible} transparent={true} animationType="slide">
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#0008" }}>
            <View style={{
              backgroundColor: COLORS.card,
              width: "92%",
              padding: 24,
              borderRadius: 20,
              shadowColor: COLORS.primary,
              shadowOpacity: 0.15,
              shadowRadius: 12,
              elevation: 6,
            }}>
              {modalType === "edit" && (
                <>
                  <Text style={{ fontSize: 18, fontWeight: "bold", color: COLORS.primary, marginBottom: 12 }}>
                    {costData[selectedCrop][editingIndex]?.label}
                  </Text>
                  {/* Show entry history */}
                  <View style={{ marginBottom: 12, maxHeight: 120 }}>
                    {costData[selectedCrop][editingIndex]?.entries.length === 0 ? (
                      <Text style={{ color: COLORS.muted, fontStyle: "italic" }}>No history yet.</Text>
                    ) : (
                      costData[selectedCrop][editingIndex]?.entries.map((entry, i) => (
                        <Text key={i} style={{ color: COLORS.secondary, fontSize: 14, marginBottom: 2 }}>• {entry}</Text>
                      ))
                    )}
                  </View>
                  <Text style={{ fontSize: 15, fontWeight: "600", color: COLORS.text, marginBottom: 4 }}>
                    {costData[selectedCrop][editingIndex]?.label === "Number of hours worked"
                      ? "Add hours worked"
                      : "Add amount"}
                  </Text>
                  <TextInput
                    keyboardType="numeric"
                    value={inputValue}
                    onChangeText={setInputValue}
                    placeholder={
                      costData[selectedCrop][editingIndex]?.label === "Number of hours worked"
                        ? "e.g. 4"
                        : "e.g. 5000"
                    }
                    style={{
                      borderWidth: 1.5,
                      borderColor: COLORS.accent,
                      paddingHorizontal: 16,
                      paddingVertical: 10,
                      borderRadius: 10,
                      marginBottom: 16,
                      backgroundColor: COLORS.bg,
                      color: COLORS.text,
                    }}
                    placeholderTextColor={COLORS.muted}
                  />
                </>
              )}
              {modalType === "crop" && (
                <>
                  <Text style={{ fontSize: 18, fontWeight: "bold", color: COLORS.primary, marginBottom: 12 }}>Add a New Crop</Text>
                  <TextInput
                    value={newCropName}
                    onChangeText={setNewCropName}
                    placeholder="Enter crop name"
                    style={{
                      borderWidth: 1.5,
                      borderColor: COLORS.accent,
                      paddingHorizontal: 16,
                      paddingVertical: 10,
                      borderRadius: 10,
                      marginBottom: 16,
                      backgroundColor: COLORS.bg,
                      color: COLORS.text,
                    }}
                    placeholderTextColor={COLORS.muted}
                  />
                </>
              )}
              {modalType === "cost" && (
                <>
                  <Text style={{ fontSize: 18, fontWeight: "bold", color: COLORS.primary, marginBottom: 12 }}>Add a New Cost Component</Text>
                  <TextInput
                    value={newCostLabel}
                    onChangeText={setNewCostLabel}
                    placeholder="e.g. Transportation"
                    style={{
                      borderWidth: 1.5,
                      borderColor: COLORS.accent,
                      paddingHorizontal: 16,
                      paddingVertical: 10,
                      borderRadius: 10,
                      marginBottom: 16,
                      backgroundColor: COLORS.bg,
                      color: COLORS.text,
                    }}
                    placeholderTextColor={COLORS.muted}
                  />
                </>
              )}
              <View style={{ flexDirection: "row", justifyContent: "flex-end", marginTop: 8 }}>
                <Pressable onPress={() => setModalVisible(false)} style={{
                  paddingHorizontal: 20,
                  paddingVertical: 10,
                  backgroundColor: COLORS.border,
                  borderRadius: 10,
                  marginRight: 10,
                }}>
                  <Text style={{ fontWeight: "600", color: COLORS.primary }}>Cancel</Text>
                </Pressable>
                <Pressable onPress={handleSave} style={{
                  paddingHorizontal: 20,
                  paddingVertical: 10,
                  backgroundColor: COLORS.primary,
                  borderRadius: 10,
                }}>
                  <Text style={{ fontWeight: "600", color: COLORS.accent }}>Save</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>

      {/* Fixed Bottom Navigation */}
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
          shadowOpacity: 0.10,
          shadowRadius: 8,
          elevation: 2,
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
        }}
      >
        <TouchableOpacity style={{ alignItems: "center" }}>
          <FontAwesome name="home" size={26} color={COLORS.primary} />
          <Text style={{ color: COLORS.primary, fontSize: 12, marginTop: 4, fontWeight: "bold" }}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{ alignItems: "center" }}>
          <Feather name="search" size={26} color={COLORS.primary} />
          <Text style={{ color: COLORS.primary, fontSize: 12, marginTop: 4, fontWeight: "bold" }} onPress={() => navigation.navigate("index1")}>Search</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{ alignItems: "center" }} onPress={() => navigation.navigate("MarketTrends")}>
          <MaterialCommunityIcons name="chart-line" size={26} color={COLORS.primary} />
          <Text style={{ color: COLORS.primary, fontSize: 12, marginTop: 4, fontWeight: "bold" }}>Market Trends</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{ alignItems: "center" }}>
          <FontAwesome name="user-circle" size={26} color={COLORS.primary} />
          <Text style={{ color: COLORS.primary, fontSize: 12, marginTop: 4, fontWeight: "bold" }}>Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
