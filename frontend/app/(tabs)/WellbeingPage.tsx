import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import EmotionLogging from '../../components/EmotionLogging';
import { LineChart } from 'react-native-gifted-charts';
import Slider from '@react-native-community/slider';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useEmail } from '../../app/emailContext';

// API service functions
const API_BASE_URL = 'http://localhost:8000/api/emotional-data';

interface WellbeingData {
  id: string;
  userId: string;
  date: string;
  overall_wellbeing: number;
  sleep_quality: number;
  physical_activity: number;
  time_with_family_friends: number;
  diet_quality: number;
  stress_levels: number;
  createdAt: string;
  updatedAt: string;
}

const fetchUserWellbeingData = async (userId: string): Promise<WellbeingData[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/user/${userId}?limit=30`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const result = await response.json();
    return result.data || [];
  } catch (error) {
    console.error('Error fetching wellbeing data:', error);
    return [];
  }
};

const calculateWellnessScore = (data: WellbeingData[]): number => {
  if (data.length === 0) return 0;
  
  const latest = data[0]; // Most recent entry
  const weights = {
    overall_wellbeing: 0.3,
    sleep_quality: 0.2,
    physical_activity: 0.15,
    time_with_family_friends: 0.1,
    diet_quality: 0.15,
    stress_levels: 0.1 // Lower stress is better, so we'll invert this
  };
  
  const score = (
    latest.overall_wellbeing * weights.overall_wellbeing +
    latest.sleep_quality * weights.sleep_quality +
    latest.physical_activity * weights.physical_activity +
    latest.time_with_family_friends * weights.time_with_family_friends +
    latest.diet_quality * weights.diet_quality +
    (11 - latest.stress_levels) * weights.stress_levels // Invert stress (lower is better)
  ) * 10; // Scale to 0-100
  
  return Math.round(score);
};

const generateRecommendations = (data: WellbeingData[]): string[] => {
  if (data.length === 0) {
    return [
      "Take your first wellness assessment to get personalized recommendations",
      "Start tracking your daily mood and activities",
      "Set up a regular wellness routine"
    ];
  }
  
  const latest = data[0];
  const recommendations: string[] = [];
  
  if (latest.sleep_quality < 6) {
    recommendations.push("Try to get 7-8 hours of sleep tonight");
  }
  
  if (latest.physical_activity < 5) {
    recommendations.push("Take a 10-minute walk or do some light stretching");
  }
  
  if (latest.diet_quality < 6) {
    recommendations.push("Try to include more fruits and vegetables in your meals");
  }
  
  if (latest.stress_levels > 6) {
    recommendations.push("Try a 5-minute mindfulness or breathing exercise");
  }
  
  if (latest.time_with_family_friends < 5) {
    recommendations.push("Reach out to a friend or family member today");
  }
  
  if (recommendations.length === 0) {
    recommendations.push("Great job! Keep up your healthy habits");
  }
  
  return recommendations;
};

const formatChartData = (data: WellbeingData[]): { value: number; label: string }[] => {
  return data.slice(0, 7).reverse().map((entry, index) => ({
    value: calculateWellnessScore([entry]),
    label: new Date(entry.date).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' })
  }));
};

export default function WellbeingPage() {
  const { email } = useEmail();
  const router = useRouter();
  
  // State management
  const [wellbeingData, setWellbeingData] = useState<WellbeingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [quizTaken, setQuizTaken] = useState(false);

  // Fetch data on component mount
  useEffect(() => {
    const loadWellbeingData = async () => {
      if (!email) {
        setError('Please log in to view your wellbeing data');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await fetchUserWellbeingData(email);
        setWellbeingData(data);
        setQuizTaken(data.length > 0);
      } catch (err) {
        console.error('Error loading wellbeing data:', err);
        setError('Failed to load wellbeing data');
      } finally {
        setLoading(false);
      }
    };

    loadWellbeingData();
  }, [email]);

  // Calculate derived data
  const currentScore = calculateWellnessScore(wellbeingData);
  const recommendations = generateRecommendations(wellbeingData);
  const chartData = formatChartData(wellbeingData);
  
  const colors = ['#c20000ff', '#eb9e2bff', '#f8d40aff', '#2c9104ff'];
  const currentColor = colors[Math.floor(Math.max(0, currentScore / 25 - 1))];

  // Handle quiz completion
  const handleQuizComplete = () => {
    setModalVisible(false);
    setQuizTaken(true);
    // Refresh data after quiz completion
    if (email) {
      fetchUserWellbeingData(email).then(setWellbeingData);
    }
  };

  // Loading state
  if (loading) {
    return (
      <View className="flex-1 bg-gray-50 justify-center items-center">
        <ActivityIndicator size="large" color="#2d1ba1" />
        <Text className="text-gray-600 mt-4">Loading your wellness data...</Text>
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View className="flex-1 bg-gray-50 justify-center items-center px-6">
        <Ionicons name="alert-circle" size={48} color="#ef4444" />
        <Text className="text-red-600 text-lg font-semibold mt-4 text-center">
          {error}
        </Text>
        <TouchableOpacity 
          className="mt-4 bg-capitalblue rounded-lg px-6 py-3"
          onPress={() => {
            if (email) {
              fetchUserWellbeingData(email).then(setWellbeingData);
            }
          }}
        >
          <Text className="text-white font-semibold">Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="bg-capitalblue px-6 py-8 pt-20">
        <View className="flex-row items-center mb-4">
          <TouchableOpacity 
            onPress={() => router.back()}
            className="mr-4"
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-2xl font-bold flex-1">
            My Well-Being
          </Text>
        </View>
        <Text className="text-blue-200 text-base">
          Track your wellness
        </Text>
      </View>

      {/* Wellness Score Card */}
      <View className="mx-4 mt-6 bg-capitalblue rounded-2xl p-8 items-center">
        <Text className="text-white text-lg mb-2">Your Overall Wellness Score:</Text>
        <Text className="text-4xl font-bold mb-2" style={{ color: currentColor }}>{currentScore}</Text>
        <Slider
          style={{ width: 200, height: 40 }}
          minimumValue={1}
          maximumValue={100}
          disabled={true}
          value={currentScore}
          minimumTrackTintColor={currentColor}
          maximumTrackTintColor="#000000ff"
        />
        {!quizTaken && (
          <>
            <TouchableOpacity
              className="mt-4 bg-white rounded-lg px-4 py-2 shadow-sm border-l-4 border-capitalred"
              onPress={() => setModalVisible(true)}
            >
              <Text className="text-capitalred font-semibold text-base">Take your daily wellness quiz</Text>
            </TouchableOpacity>
            <Modal
              visible={modalVisible}
              animationType="fade"
              transparent={true}
            >
              <View className="flex-1 bg-black/50 justify-center items-center">
                <View className="bg-white p-6 rounded-xl w-80">
                  <EmotionLogging closeTab={handleQuizComplete} />
                </View>
              </View>
            </Modal>
          </>
        )}
      </View>

      {/* Wellness Chart */}
      <View className="items-center my-8">
        <Text className="text-capitalblue text-lg font-semibold mb-4">Wellness Over Time</Text>

        {/* Row with rotated Y-label on the left and chart centered */}
        <View className="flex-row items-center w-full px-6">
          {/* make the label container narrower so the label sits closer to the chart */}
          <View className="mr-1 w-8 items-center">
          </View>

          <View className="flex-1 items-center">
            {chartData.length > 0 ? (
              <LineChart data={chartData} />
            ) : (
              <View className="items-center py-8">
                <Text className="text-gray-500 text-center">
                  No wellness data yet.{'\n'}Take your first quiz to see your progress!
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Recommendations Section */}
      <View className="mt-6">
        <Text className="text-capitalblue text-lg font-semibold mb-4 mx-4">
          Smart Recommendations
        </Text>
        {recommendations.length > 0 ? (
          recommendations.map((recommendation, index) => (
            <Recommendation 
              key={index}
              short={recommendation}
              router={router}
            />
          ))
        ) : (
          <View className="mx-4 bg-white rounded-lg p-4 mb-3">
            <Text className="text-gray-500 text-center">
              Take your wellness quiz to get personalized recommendations
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
// Recommendation component for WellbeingPage (copied and adapted from FinancialPage)
interface recommendationViewProps {
  short: string;
  router: any;
}

function Recommendation({ short, router }: recommendationViewProps) {
  return (
    <TouchableOpacity 
      className="bg-white rounded-lg shadow-sm p-4 mb-3 mx-4 border-l-4 border-capitalred"
      onPress={() => router.push('/wellbeing')}
    >
      <View className="flex-row justify-between items-center">
        <View className="flex-1">
          <Text className="text-lg font-semibold text-gray-800">{short}</Text>
        </View>
        <View className="items-end">
          <Ionicons name="bulb-outline" size={24} color="#B22A2C" />
        </View>
      </View>
    </TouchableOpacity>
  );
}
}
