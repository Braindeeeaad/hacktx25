/**
 * React Native Mood Input Component
 * Integrates with your existing Firebase setup
 * Uses 0-10 scale for all mood metrics
 */

import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  TextInput,
  ScrollView,
  Alert 
} from 'react-native';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebaseConfig';

// Mood data types
interface MoodData {
  overall_wellbeing: number; // 0-10 scale
  sleep_quality: number; // 0-10 scale
  physical_activity: number; // 0-10 scale
  time_with_family_friends: number; // 0-10 scale
  diet_quality: number; // 0-10 scale
  stress_levels: number; // 0-10 scale
  notes?: string;
}

interface MoodInputProps {
  userId: string;
  onMoodSubmitted?: () => void;
}

// Rating component for 0-10 scale
const RatingSlider: React.FC<{
  label: string;
  value: number;
  onValueChange: (value: number) => void;
  emoji: string;
  description: string;
}> = ({ label, value, onValueChange, emoji, description }) => {
  return (
    <View style={styles.ratingSection}>
      <Text style={styles.ratingLabel}>
        {emoji} {label}
      </Text>
      <Text style={styles.ratingDescription}>{description}</Text>
      
      <View style={styles.sliderContainer}>
        <Text style={styles.sliderLabel}>0</Text>
        <View style={styles.slider}>
          {Array.from({ length: 11 }, (_, i) => (
            <TouchableOpacity
              key={i}
              style={[
                styles.sliderButton,
                value === i && styles.sliderButtonSelected
              ]}
              onPress={() => onValueChange(i)}
            >
              <Text style={[
                styles.sliderButtonText,
                value === i && styles.sliderButtonTextSelected
              ]}>
                {i}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={styles.sliderLabel}>10</Text>
      </View>
      
      <Text style={styles.currentValue}>Current: {value}/10</Text>
    </View>
  );
};

export const MoodInput: React.FC<MoodInputProps> = ({ userId, onMoodSubmitted }) => {
  const [overall_wellbeing, setOverallWellbeing] = useState(5);
  const [sleep_quality, setSleepQuality] = useState(5);
  const [physical_activity, setPhysicalActivity] = useState(5);
  const [time_with_family_friends, setTimeWithFamilyFriends] = useState(5);
  const [diet_quality, setDietQuality] = useState(5);
  const [stress_levels, setStressLevels] = useState(5);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!userId) {
      Alert.alert('Error', 'User ID is required');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const moodData: MoodData = {
        overall_wellbeing,
        sleep_quality,
        physical_activity,
        time_with_family_friends,
        diet_quality,
        stress_levels,
        notes: notes.trim() || undefined
      };
      
      // Save to Firebase Firestore
      await addDoc(collection(db, 'mood_entries'), {
        userId,
        date: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD format
        ...moodData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      // Reset form
      setOverallWellbeing(5);
      setSleepQuality(5);
      setPhysicalActivity(5);
      setTimeWithFamilyFriends(5);
      setDietQuality(5);
      setStressLevels(5);
      setNotes('');
      
      Alert.alert('Success', 'Mood logged successfully!');
      
      // Call callback if provided
      if (onMoodSubmitted) {
        onMoodSubmitted();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to save mood data');
      console.error('Mood submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>How are you feeling today?</Text>
      <Text style={styles.subtitle}>Rate each area from 0-10</Text>
      
      {/* Overall Wellbeing */}
      <RatingSlider
        label="Overall Wellbeing"
        value={overall_wellbeing}
        onValueChange={setOverallWellbeing}
        emoji="😊"
        description="How do you feel overall today?"
      />

      {/* Sleep Quality */}
      <RatingSlider
        label="Sleep Quality"
        value={sleep_quality}
        onValueChange={setSleepQuality}
        emoji="😴"
        description="How well did you sleep last night?"
      />

      {/* Physical Activity */}
      <RatingSlider
        label="Physical Activity"
        value={physical_activity}
        onValueChange={setPhysicalActivity}
        emoji="🏃‍♂️"
        description="How active were you today?"
      />

      {/* Time with Family/Friends */}
      <RatingSlider
        label="Time with Family/Friends"
        value={time_with_family_friends}
        onValueChange={setTimeWithFamilyFriends}
        emoji="👨‍👩‍👧‍👦"
        description="How much quality time did you spend with loved ones?"
      />

      {/* Diet Quality */}
      <RatingSlider
        label="Diet Quality"
        value={diet_quality}
        onValueChange={setDietQuality}
        emoji="🥗"
        description="How healthy was your eating today?"
      />

      {/* Stress Levels */}
      <RatingSlider
        label="Stress Levels"
        value={stress_levels}
        onValueChange={setStressLevels}
        emoji="😰"
        description="How stressed did you feel today? (0 = no stress, 10 = very stressed)"
      />

      {/* Notes */}
      <View style={styles.section}>
        <Text style={styles.label}>Notes (Optional)</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Any additional thoughts about your day?"
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={3}
        />
      </View>

      {/* Submit Button */}
      <TouchableOpacity 
        style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]} 
        onPress={handleSubmit}
        disabled={isSubmitting}
      >
        <Text style={styles.submitText}>
          {isSubmitting ? 'Saving...' : 'Save Mood'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    color: '#666',
  },
  ratingSection: {
    marginBottom: 25,
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
  },
  ratingLabel: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 5,
    color: '#333',
  },
  ratingDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  sliderLabel: {
    fontSize: 12,
    color: '#666',
    width: 20,
    textAlign: 'center',
  },
  slider: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 10,
  },
  sliderButton: {
    width: 25,
    height: 25,
    borderRadius: 12.5,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 1,
  },
  sliderButtonSelected: {
    backgroundColor: '#007bff',
  },
  sliderButtonText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  sliderButtonTextSelected: {
    color: 'white',
    fontWeight: 'bold',
  },
  currentValue: {
    fontSize: 14,
    color: '#007bff',
    fontWeight: '600',
    textAlign: 'center',
  },
  section: {
    marginBottom: 25,
  },
  label: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
  },
  submitButton: {
    backgroundColor: '#007bff',
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
    marginBottom: 40,
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
  },
});