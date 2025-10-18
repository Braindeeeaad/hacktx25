import React from "react";
import { useState } from "react"; 
import { View, Text, StyleSheet, Button } from "react-native";
import Slider from '@react-native-community/slider';


type UserState = {
  "Well-being": number;
  Sleep: number;
  Exercise: number;
  Diet: number;
  Stress: number;
};
type Operation = () => void;
type Props = {closeTab : Operation};
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
  function handleSubmit() {
    console.log(userState); // REPLACE WITH API CALL
    setUserState(initialUserState);
  }
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Log your Well-Being</Text>
      <Text>On a scale of 1 to 10 rate:</Text>
      {categories.map((category) => 
        <React.Fragment key={category.key}>
        <Text>{category.title}</Text>
        <Text>{category.options[Math.floor((userState[category.key] - 1) / 2)]}</Text>
        <Slider
          style={{width: 200, height: 40}}
          minimumValue={1}
          maximumValue={10}
          step={1}
          value={userState[category.key]}
          onValueChange={(v) => setCategoryValue(category.key, v)}
          tapToSeek
          renderStepNumber
          minimumTrackTintColor="#000000"
          maximumTrackTintColor="#000000"
        />
        </React.Fragment>
      )}
      <Button title="Submit"
              onPress={() =>{
                             handleSubmit();
                             props.closeTab();}}/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // remove flex: 1
    alignSelf: 'center',      // center the container in its parent
    alignItems: 'center',     // center children horizontally inside the container
    // remove justifyContent (don't vertically stretch/center the container)
    backgroundColor: '#ffffffff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  title: {
    fontSize: 35,
    fontWeight: 'bold',
  },
});
