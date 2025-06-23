import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Pressable,
  Alert
} from "react-native";
import {
  Feather,
  FontAwesome,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { setUserId, clearUserId } from './features/authSlice';

import { create_crop, get_user, create_cost } from "./utils";
import BottomNav from "./components/BottomNav";

// New color palette
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

// const initialCrops = ["Yam", "Cassava", "Rice"];
const initialCrops = [];
export const defaultCosts = [
  { label: "Number of hours worked", entries: [] },
  { label: "Labour cost", entries: [] },
  { label: "Cost of seeds", entries: [] },
  { label: "Fertilizers", entries: [] },
  { label: "Equipment", entries: [] },
  { label: "Land use", entries: [] },
];

export default function AgrestimatorScreen() {
  const dispatch = useDispatch();
  const nav = useNavigation()

  const [crops, setCrops] = useState(initialCrops);
  const [selectedCrop, setSelectedCrop] = useState(
    crops.length > 0 ? crops[0] : null
  );
  const [costData, setCostData] = useState({
    Yam: JSON.parse(JSON.stringify(defaultCosts)),
    Cassava: JSON.parse(JSON.stringify(defaultCosts)),
    Rice: JSON.parse(JSON.stringify(defaultCosts)),
  });
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState("edit");
  const [editingIndex, setEditingIndex] = useState(null);
  const [inputValue, setInputValue] = useState("");
  const [inputCostPerHour, setInputCostPerHour] = useState(""); // NEW: for custom cost per hour
  const [user, setUser] = useState("");
  const [newCropName, setNewCropName] = useState("");
  const [newCostLabel, setNewCostLabel] = useState("");
  const [showMenu, setShowMenu] = useState(false);

  // const dispatch = useDispatch();
  const userId = useSelector((state) => state.auth.userId);

  // Load crops before mount (on component mount)
  React.useEffect(() => {
    const fetchData = async () => {
      const res = await get_user(userId);
      // setCrops([]);
      if (res.status && res.data.status_code === 200) {
        const loadedCrops = res.data.user.crops;
        setCrops(loadedCrops);
        setUser(res.data.user.name);
        if (loadedCrops.length > 0) setSelectedCrop(loadedCrops[0]);
          // Ensure costData is initialized for all crops
          const newCostData = { ...costData };
          loadedCrops.forEach(crop => {
            if (!newCostData[crop.name]) {
              newCostData[crop.name] = JSON.parse(JSON.stringify(defaultCosts));
            }
          });
          setCostData(newCostData);
      }
      console.log(res);
    };
    fetchData();
  }, []);

  const openEditModal = (index) => {
    setEditingIndex(index);
    const lastEntry =
      costData[selectedCrop.name][index]?.entries
        ?.slice(-1)[0]
        ?.split(" (Logged:")[0] || "";
    setInputValue(lastEntry.split(" hours")[0] || "");
    // If Number of hours worked, try to extract last cost per hour
    if (costData[selectedCrop.name][index]?.label === "Number of hours worked") {
      const last = costData[selectedCrop.name][index]?.entries?.slice(-1)[0];
      if (last && last.includes("₦")) {
        const match = last.match(/= ₦([\d,]+)/);
        if (match) {
          const lastCost = parseInt(match[1].replace(/,/g, "")) / parseFloat(lastEntry.split(" hours")[0] || 1);
          setInputCostPerHour(isNaN(lastCost) ? "1500" : lastCost.toString());
        } else {
          setInputCostPerHour("1500");
        }
      } else {
        setInputCostPerHour("1500");
      }
    } else {
      setInputCostPerHour("");
    }
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

  const handleSave = async () => {
    if (modalType === "edit") {
      const label = costData[selectedCrop.name][editingIndex]?.label;
      let newEntry = "";
      if (label === "Number of hours worked") {
        // Multiply hours by custom cost per hour and show both in entry
        const hours = parseFloat(inputValue);
        const costPerHour = parseFloat(inputCostPerHour) || 1500;
        if (!isNaN(hours)) {
          const cost = hours * costPerHour;
          newEntry = `${hours} hours x ₦${costPerHour.toLocaleString()} = ₦${cost.toLocaleString()} (Logged: ${new Date().toLocaleString()})`;
        } else {
          newEntry = `0 hours x ₦${costPerHour.toLocaleString()} = ₦0 (Logged: ${new Date().toLocaleString()})`;
        }
      } else {
        newEntry = `${inputValue} (Logged: ${new Date().toLocaleString()})`;
      }
      const updatedCosts = [...costData[selectedCrop.name]];
      updatedCosts[editingIndex].entries.push(newEntry);
      setCostData({ ...costData, [selectedCrop.name]: updatedCosts });
    } else if (modalType === "crop" && newCropName.trim()) {
      const res = await create_crop(userId, newCropName);
      console.log(res);

      if (res.result.status && res.result.data.status_code === 200) {
        const newCropObj = { id: res.crop.id, name: newCropName };
        const newCrops = [...crops, newCropObj];
        setCrops(newCrops);
        setSelectedCrop(newCropObj);
        setCostData({
          ...costData,
          [newCropName]: JSON.parse(JSON.stringify(defaultCosts)),
        });
      }

      setModalVisible(false);
    } else if (modalType === "cost" && newCostLabel.trim()) {
      console.log("cost: ", newCostLabel);
      const cropKey = selectedCrop.name;
      const updatedCosts = [
        ...(costData[cropKey] || []),
        { label: newCostLabel, entries: [] },
      ];
      setCostData({ ...costData, [cropKey]: updatedCosts });
  // Prepare cost data for submission as an object: { label: value, ... }
  
    }
    setModalVisible(false);
  };

  const prepareCostSubmission = () => {
    if (!selectedCrop || !costData[selectedCrop.name]) return {};
    const result = {};
    costData[selectedCrop.name].forEach(item => {
      // Use the last entry for each cost
      if (item.entries.length > 0) {
        // Extract value before (Logged: ...)
        const lastEntry = item.entries[item.entries.length - 1];
        let value = lastEntry.split(' (Logged:')[0];
        // For hours worked, extract the hours value
        if (item.label === 'Number of hours worked') {
          value = value.split(' hours')[0];
        }
        // Convert label to snake_case for keys
        const key = item.label.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
        result[key] = value;
      }
    });
    return result;
  };

  const calculateTotal = () => {
    if (!selectedCrop || !costData[selectedCrop.name]) {
      return 0;
    }
    return costData[selectedCrop.name].reduce((total, item) => {
      const sum = item.entries.reduce((entryTotal, entry) => {
        if (item.label === "Number of hours worked") {
          // Extract hours and cost per hour
          const match = entry.match(/([\d.]+) hours x ₦([\d,]+)/);
          if (match) {
            const hours = parseFloat(match[1]);
            const costPerHour = parseFloat(match[2].replace(/,/g, ""));
            const cost = (isNaN(hours) || isNaN(costPerHour)) ? 0 : hours * costPerHour;
            return entryTotal + cost;
          }
          return entryTotal;
        } else {
          const numericValue = parseFloat(entry.split(" ")[0]);
          return isNaN(numericValue) ? entryTotal : entryTotal + numericValue;
        }
      }, 0);
      return total + sum;
    }, 0);
  };

  // Add handleSubmit function to the component
  const handleSubmit = async () => {
    const submission = prepareCostSubmission();
    // console.log('Submitting cost data:', submission);
    const res = await create_cost({uid: userId, crop: selectedCrop.id, total: calculateTotal() || 0, expense: submission});
    console.log(res)
    if(res.status && res.data.status_code === 200){
      Alert.alert('Success', 'Expense logged successfully');
    }
  };

  const handleLogout = () => {
    dispatch(clearUserId());
    setShowMenu(false);
    nav.navigate('index');
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <ScrollView
        style={{
          flex: 1,
          paddingHorizontal: 16,
          paddingTop: 24,
          marginBottom: 80,
        }}
      >
        {/* Header */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 24,
          }}
        >
          <Text
            style={{
              fontSize: 32,
              fontWeight: "bold",
              color: COLORS.primary,
              letterSpacing: 1.5,
            }}
          >
            Hello, {user}
          </Text>
          <View style={{ position: 'relative' }}>
            <TouchableOpacity onPress={() => setShowMenu((v) => !v)}>
              <Feather name="menu" size={28} color={COLORS.primary} />
            </TouchableOpacity>
            {showMenu && (
              <View style={{
                position: 'absolute',
                top: 36,
                right: 0,
                backgroundColor: COLORS.card,
                borderRadius: 10,
                borderWidth: 1,
                borderColor: COLORS.border,
                shadowColor: COLORS.primary,
                shadowOpacity: 0.08,
                shadowRadius: 6,
                elevation: 4,
                minWidth: 100,
                zIndex: 100,
              }}>
                <TouchableOpacity
                  onPress={handleLogout}
                  style={{ paddingVertical: 10, paddingHorizontal: 18 }}
                >
                  <Text style={{ color: COLORS.primary, fontWeight: 'bold', fontSize: 16, textAlign: 'center' }}>Log out</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {/* Crop Selection */}
        <ScrollView
          horizontal
          style={{ flexDirection: "row", marginBottom: 24 }}
        >
          {crops.map((crop, index) => (
            <TouchableOpacity
              key={crop.id}
              onPress={() => setSelectedCrop(crop)}
              style={{
                paddingHorizontal: 20,
                paddingVertical: 10,
                borderRadius: 24,
                borderWidth: 2,
                borderColor:
                  selectedCrop && selectedCrop.id === crop.id
                    ? COLORS.primary
                    : COLORS.border,
                backgroundColor:
                  selectedCrop && selectedCrop.id === crop.id
                    ? COLORS.primary
                    : COLORS.card,
                marginRight: 12,
                shadowColor: COLORS.primary,
                shadowOpacity: 0.08,
                shadowRadius: 4,
                elevation: 2,
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "600",
                  color:
                    selectedCrop && selectedCrop.id === crop.id
                      ? COLORS.accent
                      : COLORS.primary,
                }}
              >
                {crop.name}
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
            <Text
              style={{
                fontSize: 18,
                fontWeight: "bold",
                color: COLORS.primary,
              }}
            >
              +
            </Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Cost Expenses */}
        <Text
          style={{
            fontSize: 20,
            fontWeight: "bold",
            color: COLORS.primary,
            marginBottom: 12,
            letterSpacing: 1,
          }}
        >
          Cost Expenses
        </Text>
        {selectedCrop &&
          costData[selectedCrop.name] &&
          costData[selectedCrop.name].map((item, index) => (
            <View key={index} style={{ marginBottom: 16 }}>
              <View
                style={{
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
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 6,
                  }}
                >
                  <Text
                    style={{
                      color: COLORS.primary,
                      fontWeight: "bold",
                      fontSize: 16,
                    }}
                  >
                    {item.label}
                  </Text>
                  <TouchableOpacity
                    onPress={() => openEditModal(index)}
                    style={{ padding: 4 }}
                  >
                    <FontAwesome name="edit" size={20} color={COLORS.accent} />
                  </TouchableOpacity>
                </View>
                {item.entries.length === 0 ? (
                  <Text style={{ color: COLORS.muted, fontStyle: "italic" }}>
                    No data entered yet.
                  </Text>
                ) : (
                  item.entries.map((entry, i) => (
                    <Text
                      key={i}
                      style={{
                        color: COLORS.secondary,
                        fontSize: 14,
                        marginBottom: 2,
                      }}
                    >
                      • {entry}
                    </Text>
                  ))
                )
                }
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
          <Text
            style={{
              textAlign: "center",
              fontWeight: "bold",
              fontSize: 18,
              color: COLORS.primary,
              letterSpacing: 1,
            }}
          >
            + Add Cost Component
          </Text>
        </TouchableOpacity>

        {/* Submit Button */}
        <TouchableOpacity
          onPress={handleSubmit}
          style={{
            backgroundColor: COLORS.primary,
            paddingVertical: 14,
            marginTop: 16,
            borderRadius: 16,
            shadowColor: COLORS.primary,
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
              color: COLORS.accent,
              letterSpacing: 1,
            }}
          >
            Submit
          </Text>
        </TouchableOpacity>

        {/* Total Cost Summary */}
        <View
          style={{
            marginTop: 32,
            marginBottom: 32,
            padding: 22,
            backgroundColor: COLORS.secondary,
            borderRadius: 18,
            borderWidth: 2,
            borderColor: COLORS.accent,
            shadowColor: COLORS.primary,
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 2,
          }}
        >
          <Text
            style={{
              fontSize: 20,
              fontWeight: "bold",
              color: COLORS.card,
              marginBottom: 6,
              letterSpacing: 1,
            }}
          >
            Total Cost Summary
          </Text>
          <Text
            style={{
              fontSize: 32,
              fontWeight: "bold",
              color: COLORS.accent,
              letterSpacing: 1,
            }}
          >
            ₦{calculateTotal().toLocaleString()}
          </Text>
        </View>

        {/* Modal */}
        <Modal visible={modalVisible} transparent={true} animationType="slide">
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "#0008",
            }}
          >
            <View
              style={{
                backgroundColor: COLORS.card,
                width: "92%",
                padding: 24,
                borderRadius: 20,
                shadowColor: COLORS.primary,
                shadowOpacity: 0.15,
                shadowRadius: 12,
                elevation: 6,
              }}
            >
              {modalType === "edit" &&
                selectedCrop &&
                costData[selectedCrop.name] &&
                typeof editingIndex === "number" &&
                costData[selectedCrop.name][editingIndex] && (
                  <>
                    <Text
                      style={{
                        fontSize: 18,
                        fontWeight: "bold",
                        color: COLORS.primary,
                        marginBottom: 12,
                      }}
                    >
                      {costData[selectedCrop.name][editingIndex]?.label}
                    </Text>
                    {/* Show entry history */}
                    <View style={{ marginBottom: 12, maxHeight: 120 }}>
                      {costData[selectedCrop.name][editingIndex]?.entries.length === 0 ? (
                        <Text style={{ color: COLORS.muted, fontStyle: "italic" }}>
                          No history yet.
                        </Text>
                      ) : (
                        costData[selectedCrop.name][editingIndex]?.entries.map((entry, i) => (
                          <Text
                            key={i}
                            style={{
                              color: COLORS.secondary,
                              fontSize: 14,
                              marginBottom: 2,
                            }}
                          >
                            • {entry}
                          </Text>
                        ))
                      )}
                    </View>
                    <Text
                      style={{
                        fontSize: 15,
                        fontWeight: "600",
                        color: COLORS.text,
                        marginBottom: 4,
                      }}
                    >
                      {costData[selectedCrop.name][editingIndex]?.label ===
                      "Number of hours worked"
                        ? "Add hours worked"
                        : "Add amount"}
                    </Text>
                    <TextInput
                      keyboardType="numeric"
                      value={inputValue}
                      onChangeText={setInputValue}
                      placeholder={
                        costData[selectedCrop.name][editingIndex]?.label ===
                        "Number of hours worked"
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
                    {/* If Number of hours worked, show cost per hour input */}
                    {costData[selectedCrop.name][editingIndex]?.label === "Number of hours worked" && (
                      <>
                        <Text
                          style={{
                            fontSize: 15,
                            fontWeight: "600",
                            color: COLORS.text,
                            marginBottom: 4,
                          }}
                        >
                          Cost per hour (₦)
                        </Text>
                        <TextInput
                          keyboardType="numeric"
                          value={inputCostPerHour}
                          onChangeText={setInputCostPerHour}
                          placeholder="e.g. 1500"
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
                  </>
                )}
              {modalType === "crop" && (
                <>
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: "bold",
                      color: COLORS.primary,
                      marginBottom: 12,
                    }}
                  >
                    Add a New Crop
                  </Text>
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
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: "bold",
                      color: COLORS.primary,
                      marginBottom: 12,
                    }}
                  >
                    Add a New Cost Component
                  </Text>
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
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "flex-end",
                  marginTop: 8,
                }}
              >
                <Pressable
                  onPress={() => setModalVisible(false)}
                  style={{
                    paddingHorizontal: 20,
                    paddingVertical: 10,
                    backgroundColor: COLORS.border,
                    borderRadius: 10,
                    marginRight: 10,
                  }}
                >
                  <Text style={{ fontWeight: "600", color: COLORS.primary }}>
                    Cancel
                  </Text>
                </Pressable>
                <Pressable
                  onPress={handleSave}
                  style={{
                    paddingHorizontal: 20,
                    paddingVertical: 10,
                    backgroundColor: COLORS.primary,
                    borderRadius: 10,
                  }}
                >
                  <Text style={{ fontWeight: "600", color: COLORS.accent }}>
                    Save
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>

      {/* Fixed Bottom Navigation */}
      <BottomNav/>
      
    </View>
  );
}
