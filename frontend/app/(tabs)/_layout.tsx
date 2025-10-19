import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import '../../global.css';

// Import screen components
import IndexScreen from './index';
import AllPurchasesScreen from './AllPurchases';
import EmotionLoggingScreen from './EmotionLogging';
import FinancialPageScreen from './FinancialPage';
import RecommendationDetailScreen from './RecommendationDetail';

const Stack = createStackNavigator();

export default function SwipeNavigatorLayout() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        gestureDirection: 'horizontal',
        cardStyleInterpolator: ({ current, layouts }) => {
          return {
            cardStyle: {
              transform: [
                {
                  translateX: current.progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [layouts.screen.width, 0],
                  }),
                },
              ],
            },
          };
        },
      }}
    >
      <Stack.Screen name="index" component={IndexScreen} />
      <Stack.Screen name="EmotionLogging" component={EmotionLoggingScreen} />
      <Stack.Screen name="FinancialPage" component={FinancialPageScreen} />
      <Stack.Screen name="AllPurchases" component={AllPurchasesScreen} />
      <Stack.Screen name="RecommendationDetail" component={RecommendationDetailScreen} />
    </Stack.Navigator>
  );
}
