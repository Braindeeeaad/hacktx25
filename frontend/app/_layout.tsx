import { Tabs, Stack, Redirect, useSegments} from "expo-router";
import '../global.css';
import { useColorScheme, View , ActivityIndicator} from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../firebaseConfig';
export default function RootLayout() {
 const colorScheme = useColorScheme();

  const [user, setUser] = useState<User | null | undefined>(undefined);
  const segments = useSegments();
  
  // LOGIC MOVED OUT OF useEffect, but useEffect is still necessary for setting state
  const isAuthenticated = user !== null && user !== undefined;
  // Assumes 'Login' is a file directly under 'app/'
  const inPublicRoute = segments[0] === 'Login'; 

  useEffect(() => {
    // This listener handles both initial load and state changes (login/logout)
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
    });

    return () => unsubscribe();
  }, []);

  // 1. Handle Initial Loading State
  if (user === undefined) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }
  
  // 2. Handle Redirection

  // Case A: User is NOT authenticated AND is trying to access a PROTECTED route.
  // Redirect to /Login.
  if (!isAuthenticated && !inPublicRoute) {
    return <Redirect href="/Login" />;
  }

  // Case B: User IS authenticated AND is trying to access the PUBLIC login route.
  // Redirect to the main app (e.g., /tabs).
  if (isAuthenticated && inPublicRoute) {
    return <Redirect href="/(tabs)" />;
  }
  
  // 3. Render the Navigation Stack
  // If no redirection occurred, we render the stack.
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" /> // Protected routes
      <Stack.Screen name="Login" /> // Public route
    </Stack>
  );
}

function TabBarIcon(props: {
  name: React.ComponentProps<typeof MaterialIcons>['name'];
  color: string;
}) {
  return <MaterialIcons size={28} style={{ marginBottom: -3 }} {...props} />;
}
