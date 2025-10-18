import React from 'react';
import { useState } from "react"; 
import { View, Text, StyleSheet, Modal, Button, ScrollView } from "react-native";
import EmotionLogging from '../../components/EmotionLogging';
import { LineChart } from "react-native-gifted-charts";
import Slider from '@react-native-community/slider';

export default function WellbeingPage() {
    function getCurrentScore() {
        return 75; // REPLACE WITH API CALL
    }
    const data = [ {value:50, label: "10/15"}, {value:80, label: "10/16"}, {value:90, label: "10/17"}, {value:70, label: "10/18"} ]; // REPLACE WITH API CALL
    const currentScore = getCurrentScore();
    const colors = ["#c20000ff", "#eb9e2bff", "#f8d40aff", "#2c9104ff"];
    const currentColor = colors[Math.floor(currentScore / 25 - 1)];
    const quizTaken = false; //REPLACE WITH API CALL
    const [modalVisible, setModalVisible] = useState(false);
    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Your Well-Being</Text>
            <View style={styles.wellnessContainer}>
                <Text style={styles.wellnessTitle}>Your Overall Wellness Score:</Text>
                <Text style={[styles.wellnessScore, { color: currentColor }]}>{currentScore}</Text>
                <Slider
                    style={{width: 200, height: 40}}
                    minimumValue={1}
                    maximumValue={100}
                    disabled={true}
                    value={currentScore}
                    minimumTrackTintColor={currentColor}
                    maximumTrackTintColor="#000000ff"
                />
                {!quizTaken && (
                        <>
                            <Button 
                                title = "Take your daily wellness quiz"
                                onPress={() => setModalVisible(true)}
                            />
                            <Modal 
                                backdropColor="gray"
                                visible={modalVisible}
                                animationType="fade"
                                transparent={true}
                                style={styles.modal}
                            >
                                <View style={styles.popup}>
                                    <EmotionLogging closeTab={() => setModalVisible(false)}/>
                                </View>
                            </Modal>
                        </>
                )}
            </View>
            <View style={styles.chartContainer}>
                <Text style={styles.chartTitle}>Wellness Overtime</Text>
                <LineChart data={data} 
                        />
                <View style={styles.wellnessScoreLabel}>
                    <Text>Wellness Score</Text>
                </View>
                <Text style={styles.days}>Days</Text>
            </View>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  title: {
    fontSize: 40,
    fontWeight: 'bold',
    marginBottom: 10
  },
  chartContainer: {
    alignItems: 'center',
    margin: 20,
  },
  chartTitle: {
    fontSize: 20,
    marginBottom: 10
  },
  wellnessScoreLabel: {
    fontSize: 15,
    transform: [{ rotate: "-90deg" }],
    left: -140,
    bottom: "45%",
  },
  days: {
    marginTop: 0
  },
  wellnessTitle: {
    color: "white",
    fontSize: 20
  },
  wellnessScore: {
    fontSize: 35,
  },
  wellnessContainer: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: '#2d1ba1',
    padding: 40,
    borderRadius: 20
  },
  modal: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 12,
        width: 300,
        elevation: 5,
  },
  popup: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center'
  }
});