import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import Slider from '@react-native-community/slider';
import { useEmail } from '../app/emailContext';

type UserState = {
  "Well-being": number;
  Sleep: number;
  Exercise: number;
  Diet: number;
  Stress: number;
};
type Operation = () => void;
type Props = {closeTab : Operation;
};
export default function EmotionLogging(props: Props) {
  const { email } = useEmail();
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
  const handleSubmit = async () => {
      if (!email) {
        Alert.alert('Error', 'User email is required. Please log in first.');
        return;
      }
      
      try {
        // Map userState to backend API format
        const today = new Date();
        const dateString = today.toISOString().split('T')[0]; // YYYY-MM-DD format
        
        const wellbeingData = {
          userId: email, // Using email as userId
          date: dateString,
          overall_wellbeing: userState["Well-being"],
          sleep_quality: userState["Sleep"],
          physical_activity: userState["Exercise"],
          time_with_family_friends: 5, // Default value since not in current form
          diet_quality: userState["Diet"],
          stress_levels: userState["Stress"]
        };

        // Call your backend API
        console.log('Sending data to backend:', wellbeingData);
        
        const response = await fetch('http://localhost:8000/api/emotional-data', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(wellbeingData)
        });

        console.log('Response status:', response.status);
        console.log('Response headers:', response.headers);

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Backend error response:', errorText);
          throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }

        const result = await response.json();
        console.log('Wellbeing data saved:', result);
        
        // Reset form and show success
        setUserState(initialUserState);
        Alert.alert('Success', 'Your wellbeing data has been saved!');
        props.closeTab();
        
      } catch (error) {
        console.error('Mood submission error:', error);
        Alert.alert('Error', 'Failed to save mood data. Please try again.');
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

