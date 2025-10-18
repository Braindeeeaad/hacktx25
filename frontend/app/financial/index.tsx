import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface RecommendationDetailProps {
  title: string;
  overview: string;
  insights: string[];
  recommendations: string[];
}

export default function RecommendationDetail() {
  const router = useRouter();
  
  // For now, we'll use static data. In a real app, this would come from navigation params
  const recommendationData: RecommendationDetailProps = {
    title: "Emergency Fund Optimization",
    overview: "Based on your spending patterns and financial goals, we've identified several opportunities to strengthen your financial foundation and improve your long-term financial health.",
    insights: [
      "Your current emergency fund covers only 2.3 months of expenses, below the recommended 6-month minimum",
      "You're spending 23% more on discretionary items compared to last month",
      "Your savings rate has decreased by 8% over the past quarter"
    ],
    recommendations: [
      "Increase emergency fund contributions by $200/month to reach 6-month coverage within 18 months",
      "Set up automatic transfers to a high-yield savings account earning 4.5% APY",
      "Review and cancel 2-3 unused subscriptions to free up $45/month for emergency fund"
    ]
  };

  return (
    <ScrollView className="flex-1 bg-gray-50">
      {/* Header with back button */}
      <View className="bg-capitalblue px-6 py-8 pt-20">
        <View className="flex-row items-center mb-4">
          <TouchableOpacity 
            onPress={() => router.replace('/FinancialPage')}
            className="mr-4"
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-2xl font-bold flex-1">
            {recommendationData.title}
          </Text>
        </View>
        <Text className="text-blue-200 text-base">
          Smart financial recommendations
        </Text>
      </View>

      {/* Overview Section */}
      <View className="mt-6 mx-4">
        <View className="bg-white rounded-lg shadow-sm p-6">
          <View className="flex-row items-center mb-4">
            <Ionicons name="information-circle-outline" size={24} color="#B22A2C" />
            <Text className="text-capitalblue text-lg font-semibold ml-2">
              Overview
            </Text>
          </View>
          <Text className="text-gray-800 text-base leading-6">
            {recommendationData.overview}
          </Text>
        </View>
      </View>

      {/* Insights Section */}
      <View className="mt-6 mx-4">
        <View className="bg-white rounded-lg shadow-sm p-6">
          <View className="flex-row items-center mb-4">
            <Ionicons name="analytics-outline" size={24} color="#B22A2C" />
            <Text className="text-capitalblue text-lg font-semibold ml-2">
              Key Insights
            </Text>
          </View>
          {recommendationData.insights.map((insight, index) => (
            <View key={index} className="mb-4 last:mb-0">
              <View className="flex-row items-start">
                <View className="bg-capitalred rounded-full w-6 h-6 items-center justify-center mr-3 mt-1">
                  <Text className="text-white text-xs font-bold">{index + 1}</Text>
                </View>
                <Text className="text-gray-800 text-base leading-6 flex-1">
                  {insight}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Recommendations Section */}
      <View className="mt-6 mx-4 mb-8">
        <View className="bg-white rounded-lg shadow-sm p-6">
          <View className="flex-row items-center mb-4">
            <Ionicons name="bulb-outline" size={24} color="#B22A2C" />
            <Text className="text-capitalblue text-lg font-semibold ml-2">
              Recommendations
            </Text>
          </View>
          {recommendationData.recommendations.map((recommendation, index) => (
            <View key={index} className="mb-4 last:mb-0">
              <View className="flex-row items-start">
                <View className="bg-capitalblue rounded-full w-6 h-6 items-center justify-center mr-3 mt-1">
                  <Text className="text-white text-xs font-bold">{index + 1}</Text>
                </View>
                <Text className="text-gray-800 text-base leading-6 flex-1">
                  {recommendation}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}
