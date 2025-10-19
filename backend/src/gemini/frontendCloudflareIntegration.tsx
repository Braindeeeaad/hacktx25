/**
 * Frontend Cloudflare D1 Integration Example
 * Shows how to modify the existing MoodInput component to use Cloudflare D1 directly
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

// Mood data types (same as your existing component)
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
  cloudflareAPIUrl?: string; // Your backend API URL
}

// Rating slider component (same as your existing component)
const RatingSlider: React.FC<{
  label: string;
  value: number;
  onValueChange: (value: number) => void;
  emoji: string;
  description: string;
}> = ({ label, value, onValueChange, emoji, description }) => {
  return (
    <View style={styles.sliderContainer}>
      <Text style={styles.sliderLabel}>
        {emoji} {label}: {value}/10
      </Text>
      <Text style={styles.sliderDescription}>{description}</Text>
      <View style={styles.sliderTrack}>
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
          <TouchableOpacity
            key={rating}
            style={[
              styles.sliderButton,
              value === rating && styles.sliderButtonActive
            ]}
            onPress={() => onValueChange(rating)}
          >
            <Text style={[
              styles.sliderButtonText,
              value === rating && styles.sliderButtonTextActive
            ]}>
              {rating}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export const CloudflareMoodInput: React.FC<MoodInputProps> = ({ 
  userId, 
  onMoodSubmitted,
  cloudflareAPIUrl = 'http://localhost:3000/api/mood' // Default to local backend
}) => {
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
      
      // Submit to Cloudflare D1 via your backend API
      const response = await fetch(`${cloudflareAPIUrl}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          ...moodData
        })
      });

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message);
      }
      
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
      
      <RatingSlider
        label="Overall Wellbeing"
        value={overall_wellbeing}
        onValueChange={setOverallWellbeing}
        emoji="😊"
        description="How do you feel overall today?"
      />
      
      <RatingSlider
        label="Sleep Quality"
        value={sleep_quality}
        onValueChange={setSleepQuality}
        emoji="😴"
        description="How well did you sleep last night?"
      />
      
      <RatingSlider
        label="Physical Activity"
        value={physical_activity}
        onValueChange={setPhysicalActivity}
        emoji="🏃"
        description="How active were you today?"
      />
      
      <RatingSlider
        label="Social Time"
        value={time_with_family_friends}
        onValueChange={setTimeWithFamilyFriends}
        emoji="👨‍👩‍👧‍👦"
        description="How much time did you spend with family/friends?"
      />
      
      <RatingSlider
        label="Diet Quality"
        value={diet_quality}
        onValueChange={setDietQuality}
        emoji="🥗"
        description="How healthy was your eating today?"
      />
      
      <RatingSlider
        label="Stress Levels"
        value={stress_levels}
        onValueChange={setStressLevels}
        emoji="😰"
        description="How stressed did you feel today?"
      />
      
      <View style={styles.notesContainer}>
        <Text style={styles.notesLabel}>📝 Additional Notes (Optional)</Text>
        <TextInput
          style={styles.notesInput}
          value={notes}
          onChangeText={setNotes}
          placeholder="Any additional thoughts about your day..."
          multiline
          numberOfLines={3}
        />
      </View>
      
      <TouchableOpacity
        style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={isSubmitting}
      >
        <Text style={styles.submitButtonText}>
          {isSubmitting ? 'Saving...' : 'Save Mood Entry'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#333',
  },
  sliderContainer: {
    marginBottom: 25,
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sliderLabel: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 5,
    color: '#333',
  },
  sliderDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  sliderTrack: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  sliderButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 2,
  },
  sliderButtonActive: {
    backgroundColor: '#4CAF50',
  },
  sliderButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  sliderButtonTextActive: {
    color: 'white',
  },
  notesContainer: {
    marginBottom: 25,
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  notesLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  notesInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});

// Usage example:
/*
import { CloudflareMoodInput } from './CloudflareMoodInput';

// In your main app component
<CloudflareMoodInput 
  userId={auth.currentUser?.uid || ''}
  cloudflareAPIUrl="https://your-backend-api.com/api/mood" // Your backend URL
  onMoodSubmitted={() => {
    // Navigate to analysis screen or show success message
    console.log('Mood logged successfully!');
  }}
/>
*/
