import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import Slider from '@react-native-community/slider';
import { useEmail } from '../contexts/emailContext';
import { useAtom } from 'jotai';
import { wellbeingDataAtom } from '@/atoms';

type UserState = {
  "Well-being": number;
  Sleep: number;
  Exercise: number;
  Diet: number;
  Stress: number;
};
type Operation = () => void;
type WellbeingDataRequest = {
  userId: string;
  date: string;
  overall_wellbeing: number;
  sleep_quality: number;
  physical_activity: number;
  time_with_family_friends: number;
  diet_quality: number;
  stress_levels: number;
};
type Props = {
  closeTab: Operation;
  onDataSubmit?: (data: WellbeingDataRequest) => void;
};
export default function EmotionLogging(props: Props) {
  const { email } = useEmail();
  const [wellbeingData] = useAtom(wellbeingDataAtom);
  
  const categories: { key: keyof UserState; title: string; options: string[] }[] = [
    { key: "Well-being", title: "Your overall well-being", options: ["Really sad", "Sad", "OK", "Good", "Amazing!"] },
    { key: "Sleep", title: "How much sleep you got", options: ["0-2 hours", "3-4 hours", "5-6 hours", "7-8 hours", "8+ hours"] },
    { key: "Exercise", title: "How much physical activity you did", options: ["Immobile day", "A little exercise", "Some exercise", "Good amount of exercise", "LOTS of exercise"] },
    { key: "Diet", title: "Diet quality", options: ["Unhealthy", "Somewhat unhealthy", "Ok", "Somewhat healthy", "Healthy"] },
    { key: "Stress", title: "Stress levels", options: ["Very high", "High", "Normal", "Low", "Very low"] },
  ];

  const initialUserState: UserState = {"Well-being": 1, "Sleep": 1, "Exercise": 1, "Diet": 1, "Stress": 1};
  const [userState, setUserState] = useState<UserState>(initialUserState);
  function setCategoryValue(key: keyof UserState, value: number) {
    setUserState(prev => ({ ...prev, [key]: value }));
  }

  // Get the most recent wellbeing data date
  const getLatestDate = (): string | null => {
    if (!wellbeingData || wellbeingData.length === 0) {
      return null;
    }
    
    // Sort by date descending and get the most recent
    const sortedData = [...wellbeingData].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    return sortedData[0].date;
  };

  // Helper function to format date for display
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  
  const handleSubmit = async () => {
      if (!email) {
        Alert.alert('Error', 'User email is required. Please log in first.');
        return;
      }
      
      // Map userState to backend API format
      const today = new Date();
      const dateString = today.toISOString().split('T')[0]; // YYYY-MM-DD format
      const latestDateString = getLatestDate();
      const dateObject = new Date(latestDateString + "T00:00:00");

      // 1. Increment the date by one day
      // getTime() gets the milliseconds since the epoch.
      // 24 * 60 * 60 * 1000 is the number of milliseconds in a day.
      dateObject.setTime(dateObject.getTime() + (24 * 60 * 60 * 1000));

      // 2. Format the new date back into "YYYY-MM-DD"
      const year = dateObject.getFullYear();
      // getMonth() is 0-indexed, so we add 1.
      // padStart(2, '0') ensures it's always two digits (e.g., "05" instead of "5").
      const month = String(dateObject.getMonth() + 1).padStart(2, '0');
      const day = String(dateObject.getDate()).padStart(2, '0');

      const nextDate = `${year}-${month}-${day}`;
      const wellbeingData: WellbeingDataRequest = {
        userId: email, // Using email as userId
        date: nextDate,
        overall_wellbeing: userState["Well-being"],
        sleep_quality: userState["Sleep"],
        physical_activity: userState["Exercise"],
        time_with_family_friends: 5, // Default value since not in current form
        diet_quality: userState["Diet"],
        stress_levels: userState["Stress"]
      };

      // Reset form
      setUserState(initialUserState);
      
      // Call the parent component's submit handler
      if (props.onDataSubmit) {
        props.onDataSubmit(wellbeingData);
      } else {
        // Fallback to just closing the tab
        props.closeTab();
      }
    };
  return (
    <View className="bg-white rounded-2xl px-6 py-6 items-center w-full max-w-md">
      <Text className="text-lg font-semibold mb-2 text-capitalblue">Log your Well-Being</Text>
      <Text className="mb-4 text-gray-700">On a scale of 1 to 10 rate:</Text>
      {categories.map((category) => (
        <View key={category.key} className="w-full mb-4">
          <Text className="text-base font-semibold text-gray-800 mb-1">{category.title}</Text>
          <Text className="text-xs text-gray-500 mb-1">{category.options[Math.floor((userState[category.key] - 1) / 2)]}</Text>
          <Slider
            style={{ width: 200, height: 40 }}
            minimumValue={1}
            maximumValue={10}
            step={1}
            value={userState[category.key]}
            onValueChange={(v) => setCategoryValue(category.key, v)}
            tapToSeek
            renderStepNumber
            minimumTrackTintColor="#2d1ba1"
            maximumTrackTintColor="#e5e7eb"
          />
        </View>
      ))}
      <TouchableOpacity
        className="mt-2 bg-capitalblue rounded-lg px-6 py-2 shadow-sm w-full"
        onPress={handleSubmit}
      >
        <Text className="text-white text-center font-semibold text-base">Submit</Text>
      </TouchableOpacity>
    </View>
  );
}

