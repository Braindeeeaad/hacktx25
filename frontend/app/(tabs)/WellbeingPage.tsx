import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import EmotionLogging from '../../components/EmotionLogging';
import { LineChart } from 'react-native-gifted-charts';
import Slider from '@react-native-community/slider';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useAtom } from 'jotai';
import { useEmail } from '../../contexts/emailContext';
import { WellbeingData, WellbeingResult, wellnessTip } from '@/api_hooks/api_types';
import { calculateWellnessScore } from '@/api_hooks/wellbeing_db_api';
import { 
  wellbeingDataAtom, 
  wellnessAnalysisAtom,
  loadingStatesAtom,
  errorStatesAtom,
  isDataReadyAtom,
  isGeminiAnalysisReadyAtom,
  triggerRefreshAtom
} from '../../atoms';

// API service functions
const API_BASE_URL = 'https://webless-lustreless-adeline.ngrok-free.dev/api/emotional-data';

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

// New function to post wellbeing data to backend
interface WellbeingDataRequest {
  userId: string;
  date: string;
  overall_wellbeing: number;
  sleep_quality: number;
  physical_activity: number;
  time_with_family_friends: number;
  diet_quality: number;
  stress_levels: number;
}

const postWellbeingData = async (data: WellbeingDataRequest): Promise<boolean> => {
  try {
    console.log('📤 Posting wellbeing data:', data);
    console.log('🌐 API URL:', `${API_BASE_URL}/user/${data.userId}`);
    
    const response = await fetch(`${API_BASE_URL}/user/${data.userId}`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });
    
    console.log('📡 Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API Error Response:', errorText);
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }
    
    const result = await response.json();
    console.log('✅ API Success:', result);
    return true;
  } catch (error) {
    console.error('❌ Error posting wellbeing data:', error);
    throw error;
  }
};

export default function WellbeingPage() {
  const { email } = useEmail();
  const navigation = useNavigation<StackNavigationProp<any>>();
  
  // Jotai atoms
  const [wellbeingData] = useAtom(wellbeingDataAtom);
  const [wellnessAnalysis] = useAtom(wellnessAnalysisAtom);
  const [loadingStates] = useAtom(loadingStatesAtom);
  const [errorStates] = useAtom(errorStatesAtom);
  const [isDataReady] = useAtom(isDataReadyAtom);
  const [isGeminiAnalysisReady] = useAtom(isGeminiAnalysisReadyAtom);
  const [, triggerRefresh] = useAtom(triggerRefreshAtom);
  
  // Local state management
  const [modalVisible, setModalVisible] = useState(false);
  const [quizTaken, setQuizTaken] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Update quiz taken state when wellbeing data changes
  /* useEffect(() => {
    if (wellbeingData) {
      setQuizTaken(false);
    }
  }, [wellbeingData]);
 */
  // Calculate derived data
  const currentScore = calculateWellnessScore(wellbeingData || []);
  const recommendations = generateRecommendations(wellbeingData || []);
  const chartData = formatChartData(wellbeingData || []);
  
  // Debug logging
  console.log('Current wellnessAnalysis state:', wellnessAnalysis);
  console.log('Current wellbeingData length:', wellbeingData?.length || 0);
  console.log('Current recommendations (fallback):', recommendations);
  
  const colors = ['#c20000ff', '#eb9e2bff', '#f8d40aff', '#2c9104ff'];
  const currentColor = colors[Math.floor(Math.max(0, currentScore / 25 - 1))];

  // Handle quiz completion
  const handleQuizComplete = async (wellbeingData: WellbeingDataRequest) => {
    if (!email) {
      Alert.alert('Error', 'Please log in to save your wellbeing data');
      return;
    }

    try {
      const dataToSubmit = {
        ...wellbeingData,
        userId: email
      };
      
      await postWellbeingData(dataToSubmit);
      
      setModalVisible(false);
      setQuizTaken(true);
      Alert.alert('Success', 'Your wellbeing data has been saved successfully!');
      
      // Trigger a refresh of the data
      triggerRefresh();
      console.log('Wellbeing data saved, triggering data refresh');
    
    } catch (error) {
      console.error('Error submitting wellbeing data:', error);
      Alert.alert('Error', 'Failed to save your wellbeing data. Please try again.');
    }
  };

  // Loading state
  if (!isDataReady.wellbeing && loadingStates.wellbeing) {
    return (
      <View className="flex-1 bg-gray-50 justify-center items-center">
        <ActivityIndicator size="large" color="#2d1ba1" />
        <Text className="text-gray-600 mt-4">Loading your wellness data...</Text>
      </View>
    );
  }

  // Error state
  if (errorStates.wellbeing && !wellbeingData) {
    return (
      <View className="flex-1 bg-gray-50 justify-center items-center px-6">
        <Ionicons name="alert-circle" size={48} color="#ef4444" />
        <Text className="text-red-600 text-lg font-semibold mt-4 text-center">
          {errorStates.wellbeing}
        </Text>
        <TouchableOpacity 
          className="mt-4 bg-capitalblue rounded-lg px-6 py-3"
          onPress={() => navigation.goBack()}
        >
          <Text className="text-white font-semibold">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="bg-capitalblue px-6 py-8 pt-20">
        <View className="flex-row items-center mb-4">
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
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
                  <EmotionLogging 
                    closeTab={() => setModalVisible(false)}
                    onDataSubmit={handleQuizComplete}
                  />
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
        {loadingStates.geminiWellness ? (
          <View className="mx-4 bg-white rounded-lg p-4 mb-3">
            <View className="flex-row items-center justify-center">
              <ActivityIndicator size="small" color="#1E40AF" />
              <Text className="text-gray-600 ml-2">Generating recommendations...</Text>
            </View>
          </View>
        ) : wellnessAnalysis && wellnessAnalysis.length > 0 ? (
          wellnessAnalysis.map((recommendation, index) => {
            console.log('Rendering AI recommendation:', recommendation);
            return (
              <Recommendation 
                key={index}
                shortTip={recommendation.shortTip}
                detailedTip={recommendation.detailedTip}
                recommendations={recommendation.recommendations}
                navigation={navigation}
              />
            );
          })
        ) : wellbeingData && wellbeingData.length > 0 ? (
          // Show fallback recommendations if we have data but no AI recommendations
          recommendations.map((recommendation, index) => {
            console.log('Rendering fallback recommendation:', recommendation);
            return (
              <Recommendation 
                key={index}
                shortTip={recommendation}
                detailedTip={recommendation}
                recommendations={[]}
                navigation={navigation}
              />
            );
          })
        ) : (
          <View className="mx-4 bg-white rounded-lg p-4 mb-3">
            <Text className="text-gray-500 text-center">
              Take your wellness quiz to get personalized recommendations
            </Text>
          </View>
        )}
      </View>
      <View className='h-4 w-10'>

      </View>
    </ScrollView>
  );
// Recommendation component for WellbeingPage (copied and adapted from FinancialPage)
interface recommendationViewProps {
  shortTip: string;
  detailedTip: string;
  recommendations?: string[];
  navigation: any;
}

function Recommendation({ shortTip, detailedTip, recommendations, navigation }: recommendationViewProps) {
  console.log('Recommendation component received props:', { shortTip, detailedTip, recommendations });

  const handlePress = () => {
    console.log('Navigating to WellbeingRecommendationDetail with params:', {
      shortTip: shortTip,
      detailedTip: detailedTip,
      recommendations: recommendations,
    });
    navigation.push('WellbeingRecommendationDetail', {
      shortTip: shortTip,
      detailedTip: detailedTip,
      recommendations: recommendations || [],
    });
  };

  return (
    <TouchableOpacity 
      className="bg-white rounded-lg shadow-sm p-4 mb-3 mx-4 border-l-4 border-capitalred"
      onPress={handlePress}
    >
      <View className="flex-row justify-between items-center">
        <View className="flex-1">
          <Text className="text-lg font-semibold text-gray-800">{shortTip}</Text>
        </View>
        <View className="items-end">
          <Ionicons name="bulb-outline" size={24} color="#B22A2C" />
        </View>
      </View>
    </TouchableOpacity>
  );
}
}
