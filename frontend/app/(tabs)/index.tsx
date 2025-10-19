import { Text, View, ScrollView, TouchableOpacity } from "react-native";
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { NessieAPIIntegration } from "@/api_hooks/nessie_api";
import { useState, useEffect } from "react";
import { useEmail } from "../../contexts/emailContext";
import { fetchUserWellbeingData, calculateWellnessScore } from "@/api_hooks/wellbeing_db_api";

export default function Index() {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const { email } = useEmail();
  const [totalPurchases, setTotalPurchases] = useState<number>(0);
  const [wellbeingScore, setWellbeingScore] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  
  const nessie = new NessieAPIIntegration(
    '2535e8ec7de75e2bb33a7e0bab0cc897',        // Your actual API key
    '68f4a25a9683f20dd51a206a',           // Your actual customer ID
    'http://api.nessieisreal.com' // Base URL
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch total purchases
        const total = await nessie.getsum();
        setTotalPurchases(total);
        
        // Fetch wellbeing score if user is logged in
        if (email) {
          const wellbeingData = await fetchUserWellbeingData(email);
          const score = calculateWellnessScore(wellbeingData);
          setWellbeingScore(score);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
        setTotalPurchases(0);
        setWellbeingScore(0);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [email]);
  return (
    <ScrollView className="flex-1 bg-gray-50">
      {/* Header Section */}
      <View className="bg-capitalblue px-6 py-8 pt-20">
        <Text className="text-white text-3xl font-bold mb-2">
          Welcome to Your Dashboard
        </Text>
        <Text className="text-blue-200 text-base">
          Manage your finances and track your wellbeing
        </Text>
      </View>

      {/* Quick Stats Section */}
          <View className="mt-8 mx-8">
            <Text className="text-gray-700 text-2xl font-semibold mb-4 text-center">
              Quick Overview
            </Text>
            <View className="flex-row justify-evenly flex items-center">
              <View className="flex-1 bg-white rounded-lg p-4 shadow-sm mr-1">
                <Text className="text-2xl font-bold text-capitalblue text-center">
                  {loading ? 'Loading...' : `$${totalPurchases.toLocaleString()}`}
                </Text>
                <Text className="text-gray-600 text-sm text-center">Total Spending</Text>
              </View>
              <View className="flex-1 bg-white rounded-lg p-4 shadow-sm ml-1">
                <Text className="text-2xl font-bold text-green-600 text-center">
                  {loading ? 'Loading...' : `${wellbeingScore}%`}
                </Text>
                <Text className="text-gray-600 text-sm text-center">Wellbeing Score</Text>
              </View>
            </View>
          </View>

      {/* Main Content */}
      <View className="flex-1 justify-center items-center p-6">
        <View className="w-full max-w-sm space-y-6">
          {/* Financial Page Button */}
          <TouchableOpacity
            className="bg-white rounded-xl p-6 mb-6 border border-gray-200 shadow-sm"
            onPress={() => navigation.push('FinancialPage')}
            activeOpacity={0.8}
          >
            <View className="flex-row items-center mb-4">
              <View className="bg-green-100 p-3 rounded-full mr-4">
                <Ionicons name="wallet-outline" size={24} color="#10B981" />
              </View>
              <View className="flex-1">
                <Text className="text-xl font-bold text-gray-800">
                  Financial Dashboard
                </Text>
                <Text className="text-gray-600 text-sm">
                  Track and manage your money
                </Text>
              </View>
            </View>
            <View className="flex-row items-center justify-between">
              <Text className="text-green-600 font-semibold">
                View Financial Data
              </Text>
              <Ionicons name="chevron-forward" size={20} color="#10B981" />
            </View>
          </TouchableOpacity>

          {/* Wellbeing Page Button */}
          <TouchableOpacity
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
            onPress={() => navigation.push('WellbeingPage')}
            activeOpacity={0.8}
          >
            <View className="flex-row items-center mb-4">
              <View className="bg-blue-100 p-3 rounded-full mr-4">
                <Ionicons name="heart-outline" size={24} color="#3B82F6" />
              </View>
              <View className="flex-1">
                <Text className="text-xl font-bold text-gray-800">
                  Wellbeing Tracker
                </Text>
                <Text className="text-gray-600 text-sm">
                  Monitor your emotional health
                </Text>
              </View>
            </View>
            <View className="flex-row items-center justify-between">
              <Text className="text-blue-600 font-semibold">
                Track Your Wellbeing
              </Text>
              <Ionicons name="chevron-forward" size={20} color="#3B82F6" />
            </View>
          </TouchableOpacity>

          
        </View>
      </View>
    </ScrollView>
  );
}
