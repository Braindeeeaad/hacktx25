import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

interface RecommendationDetailProps {
  title: string;
  overview: string;
  insights: string[];
  recommendations: string[];
}

export default function RecommendationDetail() {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const route = useRoute();
  const params = route.params as any;
  
  // Get recommendation data from navigation params
  const recommendationData: RecommendationDetailProps = {
    title: (params?.title as string) || "Financial Recommendation",
    overview: (params?.overview as string) || "Based on your financial data, here are some personalized recommendations to help improve your financial health.",
    insights: params?.insights ? JSON.parse(params.insights as string) : [],
    recommendations: params?.recommendations ? JSON.parse(params.recommendations as string) : []
  };

  return (
    <ScrollView className="flex-1 bg-gray-50">
      {/* Header with back button */}
      <View className="bg-capitalblue px-6 py-8 pt-20">
        <View className="flex-row items-center mb-4">
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
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
