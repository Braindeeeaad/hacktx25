import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { auth } from '../firebaseConfig';
import { router } from 'expo-router';
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
        Alert.alert('Login successful');
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
        Alert.alert('Account created!');
      }

      router.replace('/EmotionLogging');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{isLogin ? 'Login' : 'Sign Up'}</Text>

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        autoCapitalize="none"
      />

      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        style={styles.input}
        secureTextEntry
      />

      {loading ? (
        <ActivityIndicator size="large" color="#007bff" style={styles.loader} />
      ) : (
        <Button title={isLogin ? 'Login' : 'Sign Up'} onPress={handleAuth} />
      )}

      <Text
        style={styles.switch}
        onPress={() => setIsLogin(!isLogin)}
      >
        {isLogin ? "Don't have an account? Sign up" : "Already have an account? Login"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
  },
  input: {
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  loader: {
    marginVertical: 20,
  },
  switch: {
    textAlign: 'center',
    color: '#007bff',
    marginTop: 16,
  },
});