import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import Slider from '@react-native-community/slider';
import { db } from '../firebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

type UserState = {
  "Well-being": number;
  Sleep: number;
  Exercise: number;
  Diet: number;
  Stress: number;
};
type Operation = () => void;
type Props = {closeTab : Operation;
              userId: string
};
export default function EmotionLogging(props: Props) {
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
      if (!props.userId) {
        Alert.alert('Error', 'User ID is required');
        return;
      }
      console.log("hi");
      try {
        const moodData = Object.values(userState);
        
        const id = props.userId;
        // Save to Firebase Firestore
        await addDoc(collection(db, 'mood_entries'), {
          id,
          date: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD format
          ...moodData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        setUserState(initialUserState);
        } catch (error) {
        Alert.alert('Error', 'Failed to save mood data');
        console.error('Mood submission error:', error);
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

