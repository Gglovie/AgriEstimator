import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Pressable,
  FlatList,
} from "react-native";
import { Feather, FontAwesome, MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from '@react-navigation/native';

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
    <View className="flex-1 bg-lavender">
      <ScrollView className="flex-1 px-4 py-6">
        {/* Header */}
        <View className="flex-row justify-between items-center mb-6">
          <Text className="text-3xl font-extrabold text-savoy-blue tracking-wide">AGRESTIMATOR</Text>
          <Feather name="search" size={26} color="#1A237E" />
        </View>

        {/* Crop Selection */}
        <ScrollView horizontal className="flex-row mb-6 space-x-3">
          {crops.map((crop, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => setSelectedCrop(crop)}
              className={`px-5 py-2 rounded-full border-2 ${
                selectedCrop === crop
                  ? 'bg-savoy-blue border-savoy-blue'
                  : 'bg-white border-tiffany-blue'
              } shadow-sm`}
              style={{
                shadowColor: "#1A237E",
                shadowOpacity: 0.08,
                shadowRadius: 4,
                elevation: 2,
              }}
            >
              <Text className={`text-base font-semibold ${selectedCrop === crop ? 'text-white' : 'text-savoy-blue'}`}>
                {crop}
              </Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            onPress={openAddCropModal}
            className="bg-tiffany-blue px-5 py-2 rounded-full border-2 border-tiffany-blue shadow-sm"
            style={{
              shadowColor: "#009CA6",
              shadowOpacity: 0.08,
              shadowRadius: 4,
              elevation: 2,
            }}
          >
            <Text className="text-base font-bold text-white">+</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Cost Expenses */}
        <Text className="text-lg font-bold text-savoy-blue mb-3 tracking-wide">Cost Expenses</Text>
        {costData[selectedCrop].map((item, index) => (
          <View key={index} className="mb-4">
            <View className="bg-white border border-tiffany-blue rounded-2xl px-4 py-3 shadow-sm"
              style={{
                shadowColor: "#009CA6",
                shadowOpacity: 0.07,
                shadowRadius: 6,
                elevation: 2,
              }}>
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-savoy-blue font-semibold text-base">{item.label}</Text>
                <TouchableOpacity
                  onPress={() => openEditModal(index)}
                  className="p-1"
                >
                  <FontAwesome name="edit" size={20} color="#1A237E" />
                </TouchableOpacity>
              </View>
              {item.entries.length === 0 ? (
                <Text className="text-gray-400 italic">No data entered yet.</Text>
              ) : (
                item.entries.map((entry, i) => (
                  <Text key={i} className="text-savoy-blue text-sm mb-1">• {entry}</Text>
                ))
              )}
            </View>
          </View>
        ))}

        {/* Add Cost Component */}
        <TouchableOpacity
          onPress={openAddCostModal}
          className="bg-tiffany-blue py-3 mt-2 rounded-xl shadow-lg"
          style={{
            shadowColor: "#009CA6",
            shadowOpacity: 0.15,
            shadowRadius: 8,
            elevation: 3,
          }}
        >
          <Text className="text-center font-bold text-lg text-white tracking-wide">+ Add Cost Component</Text>
        </TouchableOpacity>

        {/* Total Cost Summary */}
        <View className="mt-8 p-5 bg-rosy-brown rounded-2xl border-2 border-tiffany-blue shadow"
          style={{
            shadowColor: "#009CA6",
            shadowOpacity: 0.10,
            shadowRadius: 8,
            elevation: 2,
          }}>
          <Text className="text-xl font-bold text-savoy-blue mb-2 tracking-wide">Total Cost Summary</Text>
          <Text className="text-3xl font-extrabold text-tiffany-blue">₦{calculateTotal().toLocaleString()}</Text>
        </View>

        {/* Modal */}
        <Modal visible={modalVisible} transparent={true} animationType="slide">
          <View className="flex-1 justify-center items-center bg-black/40">
            <View className="bg-white w-11/12 p-6 rounded-2xl shadow-xl"
              style={{
                shadowColor: "#1A237E",
                shadowOpacity: 0.15,
                shadowRadius: 12,
                elevation: 6,
              }}>
              {modalType === "edit" && (
                <>
                  <Text className="text-lg font-bold text-savoy-blue mb-3">
                    {costData[selectedCrop][editingIndex]?.label}
                  </Text>
                  {/* Show entry history */}
                  <View className="mb-3 max-h-32">
                    {costData[selectedCrop][editingIndex]?.entries.length === 0 ? (
                      <Text className="text-gray-400 italic">No history yet.</Text>
                    ) : (
                      costData[selectedCrop][editingIndex]?.entries.map((entry, i) => (
                        <Text key={i} className="text-savoy-blue text-sm mb-1">• {entry}</Text>
                      ))
                    )}
                  </View>
                  <Text className="text-base font-semibold text-gray-700 mb-1">
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
                    className="border border-tiffany-blue px-4 py-2 rounded-lg mb-4 bg-lavender"
                    placeholderTextColor="#B0B0B0"
                  />
                </>
              )}
              {modalType === "crop" && (
                <>
                  <Text className="text-lg font-bold text-savoy-blue mb-3">Add a New Crop</Text>
                  <TextInput
                    value={newCropName}
                    onChangeText={setNewCropName}
                    placeholder="Enter crop name"
                    className="border border-tiffany-blue px-4 py-2 rounded-lg mb-4 bg-lavender"
                    placeholderTextColor="#B0B0B0"
                  />
                </>
              )}
              {modalType === "cost" && (
                <>
                  <Text className="text-lg font-bold text-savoy-blue mb-3">Add a New Cost Component</Text>
                  <TextInput
                    value={newCostLabel}
                    onChangeText={setNewCostLabel}
                    placeholder="e.g. Transportation"
                    className="border border-tiffany-blue px-4 py-2 rounded-lg mb-4 bg-lavender"
                    placeholderTextColor="#B0B0B0"
                  />
                </>
              )}
              <View className="flex-row justify-end space-x-3 mt-2">
                <Pressable onPress={() => setModalVisible(false)} className="px-5 py-2 bg-gray-200 rounded-lg">
                  <Text className="font-semibold text-savoy-blue">Cancel</Text>
                </Pressable>
                <Pressable onPress={handleSave} className="px-5 py-2 bg-savoy-blue rounded-lg">
                  <Text className="font-semibold text-white">Save</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>

      {/* Fixed Bottom Navigation */}
      <View
        className="flex-row justify-around py-4 border-t-2 border-tiffany-blue bg-white rounded-t-2xl shadow"
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          shadowColor: "#009CA6",
          shadowOpacity: 0.10,
          shadowRadius: 8,
          elevation: 2,
        }}
      >
        <TouchableOpacity className="items-center">
          <FontAwesome name="home" size={26} color="#1A237E" />
          <Text className="text-savoy-blue text-xs mt-1 font-semibold">Home</Text>
        </TouchableOpacity>
        <TouchableOpacity className="items-center">
          <Feather name="search" size={26} color="#1A237E" />
          <Text className="text-savoy-blue text-xs mt-1 font-semibold" onPress={() => navigation.navigate("index1")}>Search</Text>
        </TouchableOpacity>
        <TouchableOpacity className="items-center" onPress={() => navigation.navigate("MarketTrends")}>
          <MaterialCommunityIcons name="chart-line" size={26} color="#1A237E" />
          <Text className="text-savoy-blue text-xs mt-1 font-semibold" >Market Trends</Text>
        </TouchableOpacity>
        <TouchableOpacity className="items-center">
          <FontAwesome name="user-circle" size={26} color="#1A237E" />
          <Text className="text-savoy-blue text-xs mt-1 font-semibold">Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
