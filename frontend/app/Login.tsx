import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { auth } from '../firebaseConfig';
import { router } from 'expo-router';
import { useEmail } from '../contexts/emailContext';
import { Ionicons } from '@expo/vector-icons';

// Define navigation type (optional but nice for TypeScript)
type RootStackParamList = {
  Login: undefined;
  EmotionalLogging: undefined;
};


export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const { setEmail: setContextEmail } = useEmail();

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        console.log('Starting login');
        await signInWithEmailAndPassword(auth, email, password);
        setContextEmail(email); // Set email in context after successful login
        Alert.alert('Login successful');
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
        setContextEmail(email); // Set email in context after successful signup
        Alert.alert('Account created!');
      }
      /* router.replace('/EmotionLogging'); */
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      className="flex-1 bg-gray-50"
    >
      <ScrollView className="flex-1" contentContainerStyle={{ flexGrow: 1 }}>
        {/* Header Section */}
        <View className="bg-capitalblue px-6 py-16 pt-20">
          <View className="items-center">
            <View className="w-20 h-20 bg-white rounded-full items-center justify-center mb-6">
              <Ionicons name="heart" size={40} color="#B22A2C" />
            </View>
            <Text className="text-white text-3xl font-bold mb-2">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </Text>
            <Text className="text-blue-200 text-base text-center">
              {isLogin ? 'Sign in to continue your wellness journey' : 'Join us to start tracking your wellness'}
            </Text>
          </View>
        </View>

        {/* Form Section */}
        <View className="flex-1 px-6 py-8">
          <View className="bg-white rounded-2xl p-6 shadow-sm">
            {/* Email Input */}
            <View className="mb-6">
              <Text className="text-gray-700 text-sm font-medium mb-2">Email Address</Text>
              <View className="flex-row items-center bg-gray-50 rounded-lg px-4 py-3 border border-gray-200">
                <Ionicons name="mail-outline" size={20} color="#6B7280" className="mr-3" />
                <TextInput
                  placeholder="Enter your email"
                  value={email}
                  onChangeText={setEmail}
                  className="flex-1 text-gray-900 text-base"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  autoComplete="email"
                />
              </View>
            </View>

            {/* Password Input */}
            <View className="mb-8">
              <Text className="text-gray-700 text-sm font-medium mb-2">Password</Text>
              <View className="flex-row items-center bg-gray-50 rounded-lg px-4 py-3 border border-gray-200">
                <Ionicons name="lock-closed-outline" size={20} color="#6B7280" className="mr-3" />
                <TextInput
                  placeholder="Enter your password"
                  value={password}
                  onChangeText={setPassword}
                  className="flex-1 text-gray-900 text-base"
                  secureTextEntry
                  autoComplete="password"
                />
              </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              onPress={handleAuth}
              disabled={loading}
              className={`bg-capitalblue rounded-lg py-4 items-center ${
                loading ? 'opacity-50' : ''
              }`}
            >
              {loading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text className="text-white text-lg font-semibold">
                  {isLogin ? 'Sign In' : 'Create Account'}
                </Text>
              )}
            </TouchableOpacity>

            {/* Switch Mode */}
            <TouchableOpacity
              onPress={() => setIsLogin(!isLogin)}
              className="mt-6 items-center"
            >
              <Text className="text-gray-600 text-base">
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <Text className="text-capitalblue font-semibold">
                  {isLogin ? 'Sign Up' : 'Sign In'}
                </Text>
              </Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View className="mt-8 items-center">
            <Text className="text-gray-500 text-sm text-center">
              By continuing, you agree to our Terms of Service and Privacy Policy
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
