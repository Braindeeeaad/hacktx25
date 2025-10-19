/**
 * React Native Mood Input Component
 * Copy this to your frontend app for mood data collection
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

// Mood data types (copy these to your types file)
interface MoodData {
  mood: 'very_happy' | 'happy' | 'neutral' | 'sad' | 'very_sad';
  sleep: 'very_high' | 'high' | 'medium' | 'low' | 'very_low';
  stress: 'very_low' | 'low' | 'medium' | 'high' | 'very_high';
  notes?: string;
  tags?: string[];
  location?: string;
  weather?: string;
}

interface MoodInputProps {
  onMoodSubmit: (moodData: MoodData) => Promise<void>;
  userId: string;
}

export const MoodInput: React.FC<MoodInputProps> = ({ onMoodSubmit, userId }) => {
  const [mood, setMood] = useState<'very_happy' | 'happy' | 'neutral' | 'sad' | 'very_sad'>('neutral');
  const [sleep, setSleep] = useState<'very_high' | 'high' | 'medium' | 'low' | 'very_low'>('medium');
  const [stress, setStress] = useState<'very_low' | 'low' | 'medium' | 'high' | 'very_high'>('medium');
  const [notes, setNotes] = useState('');
  const [location, setLocation] = useState('');
  const [weather, setWeather] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!userId) {
      Alert.alert('Error', 'User ID is required');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const moodData: MoodData = {
        mood,
        sleep,
        stress,
        notes: notes.trim() || undefined,
        location: location.trim() || undefined,
        weather: weather.trim() || undefined,
        tags: [] // You can add tag selection UI later
      };
      
      await onMoodSubmit(moodData);
      
      // Reset form
      setMood('neutral');
      setSleep('medium');
      setStress('medium');
      setNotes('');
      setLocation('');
      setWeather('');
      
      Alert.alert('Success', 'Mood logged successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to save mood data');
      console.error('Mood submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const moodOptions = [
    { value: 'very_sad', emoji: '😢', label: 'Very Sad' },
    { value: 'sad', emoji: '😔', label: 'Sad' },
    { value: 'neutral', emoji: '😐', label: 'Neutral' },
    { value: 'happy', emoji: '😊', label: 'Happy' },
    { value: 'very_happy', emoji: '😄', label: 'Very Happy' }
  ];

  const sleepOptions = [
    { value: 'very_low', emoji: '😴', label: 'Very Low' },
    { value: 'low', emoji: '😪', label: 'Low' },
    { value: 'medium', emoji: '😑', label: 'Medium' },
    { value: 'high', emoji: '😊', label: 'High' },
    { value: 'very_high', emoji: '😄', label: 'Very High' }
  ];

  const stressOptions = [
    { value: 'very_low', emoji: '😌', label: 'Very Low' },
    { value: 'low', emoji: '😊', label: 'Low' },
    { value: 'medium', emoji: '😐', label: 'Medium' },
    { value: 'high', emoji: '😰', label: 'High' },
    { value: 'very_high', emoji: '😱', label: 'Very High' }
  ];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>How are you feeling today?</Text>
      
      {/* Mood Selection */}
      <View style={styles.section}>
        <Text style={styles.label}>Mood</Text>
        <View style={styles.optionsContainer}>
          {moodOptions.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.optionButton,
                mood === option.value && styles.selectedOption
              ]}
              onPress={() => setMood(option.value as any)}
            >
              <Text style={styles.emoji}>{option.emoji}</Text>
              <Text style={styles.optionLabel}>{option.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Sleep Selection */}
      <View style={styles.section}>
        <Text style={styles.label}>Sleep Quality</Text>
        <View style={styles.optionsContainer}>
          {sleepOptions.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.optionButton,
                sleep === option.value && styles.selectedOption
              ]}
              onPress={() => setSleep(option.value as any)}
            >
              <Text style={styles.emoji}>{option.emoji}</Text>
              <Text style={styles.optionLabel}>{option.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Stress Selection */}
      <View style={styles.section}>
        <Text style={styles.label}>Stress Level</Text>
        <View style={styles.optionsContainer}>
          {stressOptions.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.optionButton,
                stress === option.value && styles.selectedOption
              ]}
              onPress={() => setStress(option.value as any)}
            >
              <Text style={styles.emoji}>{option.emoji}</Text>
              <Text style={styles.optionLabel}>{option.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Notes */}
      <View style={styles.section}>
        <Text style={styles.label}>Notes (Optional)</Text>
        <TextInput
          style={styles.textInput}
          placeholder="How was your day? Any specific thoughts or feelings?"
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={3}
        />
      </View>

      {/* Location */}
      <View style={styles.section}>
        <Text style={styles.label}>Location (Optional)</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Where are you? (home, work, etc.)"
          value={location}
          onChangeText={setLocation}
        />
      </View>

      {/* Weather */}
      <View style={styles.section}>
        <Text style={styles.label}>Weather (Optional)</Text>
        <TextInput
          style={styles.textInput}
          placeholder="What's the weather like? (sunny, rainy, etc.)"
          value={weather}
          onChangeText={setWeather}
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
    marginBottom: 30,
    color: '#333',
  },
  section: {
    marginBottom: 25,
  },
  label: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    color: '#333',
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  optionButton: {
    width: '18%',
    aspectRatio: 1,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ddd',
    backgroundColor: '#f8f9fa',
    marginBottom: 10,
  },
  selectedOption: {
    borderColor: '#007bff',
    backgroundColor: '#e3f2fd',
  },
  emoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  optionLabel: {
    fontSize: 10,
    textAlign: 'center',
    color: '#666',
    fontWeight: '500',
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

// Usage example in your app:
/*
import { MoodInput } from './MoodInput';

// In your main component:
const handleMoodSubmit = async (moodData: MoodData) => {
  try {
    // Send to your backend API
    const response = await fetch('/api/mood', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: currentUser.uid,
        ...moodData
      })
    });
    
    if (!response.ok) throw new Error('Failed to save mood');
  } catch (error) {
    console.error('Error saving mood:', error);
    throw error;
  }
};

// In your render:
<MoodInput 
  onMoodSubmit={handleMoodSubmit}
  userId={currentUser.uid}
/>
*/
