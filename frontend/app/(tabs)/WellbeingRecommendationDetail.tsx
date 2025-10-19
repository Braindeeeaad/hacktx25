import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

interface RecommendationDetailProps {
  shortTip: string;
  detailedTip: string;
  recommendations: string[];
}

export default function WellbeingRecommendationDetail() {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const route = useRoute();
  const params = route.params as any;
  
  console.log('WellbeingRecommendationDetail - Received params:', params);
  
  // Get recommendation data from navigation params
  const recommendationData: RecommendationDetailProps = {
    shortTip: (params?.shortTip as string) || 'Wellness Recommendation',
    detailedTip: (params?.detailedTip as string) || 'No detailed information available.',
    recommendations: (params?.recommendations as string[]) || [],
  };
  
  console.log('WellbeingRecommendationDetail - Processed data:', recommendationData);

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
            {recommendationData.shortTip}
          </Text>
        </View>
        <Text className="text-blue-200 text-base">
          Better emotional recommendations
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
            {recommendationData.detailedTip}
          </Text>
        </View>
      </View>

      {/* Recommendations Section */}
      {recommendationData.recommendations.length > 0 && (
        <View className="mt-6 mx-4">
          <View className="bg-white rounded-lg shadow-sm p-6">
            <View className="flex-row items-center mb-4">
              <Ionicons name="checkmark-circle-outline" size={24} color="#B22A2C" />
              <Text className="text-capitalblue text-lg font-semibold ml-2">
                Action Items
              </Text>
            </View>
            {recommendationData.recommendations.map((recommendation, index) => (
              <View key={index} className="flex-row items-start mb-3">
                <View className="w-6 h-6 bg-capitalred rounded-full items-center justify-center mr-3 mt-0.5">
                  <Text className="text-white text-sm font-bold">{index + 1}</Text>
                </View>
                <Text className="text-gray-800 text-base leading-6 flex-1">
                  {recommendation}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </ScrollView>
  );
}
