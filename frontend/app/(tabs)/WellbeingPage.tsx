import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView } from 'react-native';
import EmotionLogging from '../../components/EmotionLogging';
import { LineChart } from 'react-native-gifted-charts';
import Slider from '@react-native-community/slider';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';


export default function WellbeingPage() {
  const router = useRouter();
  function getCurrentScore() {
    return 75; // REPLACE WITH API CALL
  }
  function getRecommendations() {
    return ["Try a short mindfulness exercise today", "Aim for 7-8 hours of sleep tonight", 
      "Take a walk or stretch break"]; //REPLACE WITH API CALL
  }
  const data = [
    { value: 50, label: '10/15' },
    { value: 80, label: '10/16' },
    { value: 90, label: '10/17' },
    { value: 70, label: '10/18' },
  ]; // REPLACE WITH API CALL
  const USER_ID = "f"; // REPLACE WITH API CALL
  const currentScore = getCurrentScore();
  const colors = ['#c20000ff', '#eb9e2bff', '#f8d40aff', '#2c9104ff'];
  const currentColor = colors[Math.floor(currentScore / 25 - 1)];
  const quizTaken = false; //REPLACE WITH API CALL
  const [modalVisible, setModalVisible] = useState(false);
  const recommendations = getRecommendations();

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
                  <EmotionLogging closeTab={() => setModalVisible(false)} userId={USER_ID}/>
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
            <LineChart data={data} />
          </View>
        </View>
      </View>

      {/* Recommendations Section */}
      <View className="mt-6">
        <Text className="text-capitalblue text-lg font-semibold mb-4 mx-4">
          Smart Recommendations
        </Text>
        {recommendations.map((recommendation) => (
          <Recommendation 
            short={recommendation}
            router={router}
          />
        ))}
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
