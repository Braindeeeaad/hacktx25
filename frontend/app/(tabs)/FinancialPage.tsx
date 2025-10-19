import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { BarChart, CurveType, LineChart, PieChart, PopulationPyramid, RadarChart, lineDataItem } from "react-native-gifted-charts";
import { useAtom } from 'jotai';
import { useEffect, useState } from 'react';
import { 
  financialDataAtom, 
  financeScoreAtom, 
  spendingAnalysisAtom,
  loadingStatesAtom,
  errorStatesAtom,
  isDataReadyAtom,
  isGeminiAnalysisReadyAtom
} from '../../atoms';
import { Transaction, ProcessedData, Anomaly, FinanceScore, accountType, purchaseType, AnalysisResult, Recommendation } from "@/api_hooks/api_types";

interface RecommendationData {
  title: string;
  overview: string;
  insights: string[];
  recommendations: string[];
}

interface WellnessScoreData {
  overall: number;
  category: string;
}

export default function FinancialPage() {
  const navigation = useNavigation<StackNavigationProp<any>>();
  
  // Jotai atoms
  const [financialData] = useAtom(financialDataAtom);
  const [financeScore] = useAtom(financeScoreAtom);
  const [spendingAnalysis] = useAtom(spendingAnalysisAtom);
  const [loadingStates] = useAtom(loadingStatesAtom);
  const [errorStates] = useAtom(errorStatesAtom);
  const [isDataReady] = useAtom(isDataReadyAtom);
  const [isGeminiAnalysisReady] = useAtom(isGeminiAnalysisReadyAtom);
  
  // Local state for display
  const [wellnessScore, setWellnessScore] = useState<WellnessScoreData | null>(null);

// Function to map purchase descriptions to categories (similar to nessie_api.ts)
const mapPurchaseCategory = (description: string): string => {
  // Handle edge cases
  if (!description || typeof description !== 'string') {
    return 'Other';
  }
  
  const desc = description.toLowerCase().trim();
  
  if (desc.includes('takeout') || desc.includes('restaurant') || desc.includes('food')) {
    return 'Food';
  } else if (desc.includes('grocery') || desc.includes('grocery')) {
    return 'Food';
  } else if (desc.includes('gas') || desc.includes('fuel')) {
    return 'Transport';
  } else if (desc.includes('shopping') || desc.includes('store')) {
    return 'Shopping';
  } else if (desc.includes('coffee') || desc.includes('cafe')) {
    return 'Food';
  } else if (desc.includes('entertainment') || desc.includes('movie') || desc.includes('game')) {
    return 'Entertainment';
  } else {
    return 'Other';
  }
};

// Function to determine category from score
const getCategoryFromScore = (score: number): string => {
  if (score >= 80) return 'Excellent';
  else if (score >= 65) return 'Good';
  else if (score >= 50) return 'Fair';
  else if (score >= 35) return 'Poor';
  else return 'Critical';
};

// Recommendation data


// Update wellness score when finance score changes
useEffect(() => {
  if (financeScore) {
    const wellnessScoreData: WellnessScoreData = {
      overall: financeScore.overall,
      category: getCategoryFromScore(financeScore.overall)
    };
    setWellnessScore(wellnessScoreData);
  }
}, [financeScore]);

  
  
  // Function to format date to show only month and date
  const formatDateForChart = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };


  
  // Show loading state if data is not ready
  if (!isDataReady.financial && loadingStates.financial) {
    return (
      <View className="flex-1 bg-gray-50 justify-center items-center">
        <ActivityIndicator size="large" color="#2d1ba1" />
        <Text className="text-gray-600 mt-4">Loading financial data...</Text>
      </View>
    );
  }

  // Show error state if there's an error and no data
  if (errorStates.financial && !financialData) {
    return (
      <View className="flex-1 bg-gray-50 justify-center items-center px-6">
        <Ionicons name="alert-circle" size={48} color="#ef4444" />
        <Text className="text-red-600 text-lg font-semibold mt-4 text-center">
          {errorStates.financial}
        </Text>
        <TouchableOpacity 
          className="mt-4 bg-capitalblue rounded-lg px-6 py-3"
          onPress={() => navigation.goBack()}
        >
          <Text className="text-white font-semibold">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Show message if no data is available
  if (!financialData) {
    return (
      <View className="flex-1 bg-gray-50 justify-center items-center px-6">
        <Ionicons name="information-circle" size={48} color="#6b7280" />
        <Text className="text-gray-600 text-lg font-semibold mt-4 text-center">
          No financial data available
        </Text>
        <TouchableOpacity 
          className="mt-4 bg-capitalblue rounded-lg px-6 py-3"
          onPress={() => navigation.goBack()}
        >
          <Text className="text-white font-semibold">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-50">
      {/* Header with Capital Blue */}
      <View className="bg-capitalblue px-6 py-8 pt-20">
        <View className="flex-row items-center mb-4">
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            className="mr-4"
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-2xl font-bold flex-1">
            Purchase History
          </Text>
        </View>
        <Text className="text-blue-200 text-base">
          Recent transactions and purchases
        </Text>
      </View>

      {/* Financial Wellness Score */}
      {(wellnessScore || loadingStates.geminiFinance) && (
        <View className="mx-4 mt-6">
          <WellnessScoreCard 
            score={wellnessScore} 
            isLoading={loadingStates.geminiFinance} 
          />
        </View>
      )}

      {/* Chart */}
      {financialData.purchases.length > 0 && (
        <View className='w-full px-4'>
          <LineChart 
            data={financialData.purchases.map((item, index) => ({
              value: item.amount,
              label: formatDateForChart(item.purchase_date),
            }))}
            width={300}
            height={200}
            spacing={60}
            initialSpacing={20}
            endSpacing={20}
            color={'#B22A2C'}
            thickness={4}
            curved={true}
            curveType={CurveType.QUADRATIC}
          />
        </View>
      )}

      {/* Purchase List */}
      <View className="mt-6">
        <View className="flex-row justify-between items-center mb-4 mx-4">
          <Text className="text-capitalblue text-lg font-semibold">
            Recent Purchases
          </Text>
          <TouchableOpacity 
            onPress={() => navigation.push('AllPurchases', {
              purchaseHistory: JSON.stringify(financialData.purchases),
              merchantNames: JSON.stringify(financialData.merchantNames)
            })}
            className="bg-capitalblue px-3 py-1 rounded-lg"
          >
            <Text className="text-white text-sm font-medium">View All</Text>
          </TouchableOpacity>
        </View>
        
        {financialData.purchases.slice().reverse().slice(0, 5).map((purchase, index) => (
          <Purchase 
            key={index}
            amount={purchase.amount}
            date={purchase.purchase_date}
            description={purchase.description}
            merchant={financialData.merchantNames[purchase.merchant_id] || purchase.merchant_id}
          />
        ))}
      </View>

      {/* Recommendations Section */}
      <View className="mt-6">
        <Text className="text-capitalblue text-lg font-semibold mb-4 mx-4">
          Smart Recommendations
        </Text>
        
        {loadingStates.geminiFinance ? (
          <View className="mx-4 bg-white rounded-lg p-4 mb-3">
            <View className="flex-row items-center justify-center">
              <ActivityIndicator size="small" color="#1E40AF" />
              <Text className="text-gray-600 ml-2">Generating recommendations...</Text>
            </View>
          </View>
        ) : spendingAnalysis?.recommendations ? (
          spendingAnalysis.recommendations.map((recommendation, index) => (
            <RecommendationView
              key={index}
              recommendation={recommendation}
              navigation={navigation}
            />
          ))
        ) : (
          <View className="mx-4 bg-white rounded-lg p-4 mb-3">
            <Text className="text-gray-500 text-center">
              No recommendations available yet
            </Text>
          </View>
        )}
      </View>
      <View className='h-4 w-10'></View>
    </ScrollView>
  );
}

interface purchaseViewProps {
    amount : number;
    date : string;
    description : string;
    merchant : string;
}

function Purchase({ amount, date, description, merchant }: purchaseViewProps) {
  return (
    <View className="bg-white rounded-lg shadow-sm p-4 mb-3 mx-4">
      <View className="flex-row justify-between items-center">
        <View className="flex-1">
          <Text className="text-lg font-semibold text-gray-800">{merchant}</Text>
          <Text className="text-gray-600 text-sm">{description}</Text>
        </View>
        <View className="items-end">
          <Text className="text-lg font-semibold text-capitalblue">${amount.toFixed(2)}</Text>
          <Text className="text-gray-500 text-sm">{date}</Text>
        </View>
      </View>
    </View>
  );
}


interface recommendationViewProps {
    recommendation: Recommendation;
    navigation : any;
}

function RecommendationView({ recommendation, navigation }: recommendationViewProps) {
  const handlePress = () => {
    navigation.push('RecommendationDetail', {
      title: recommendation.shortInsight,
      overview: recommendation.detailedAdvice,
      insights: JSON.stringify(recommendation.linkedInsights),
    });
  };

  return (
    <TouchableOpacity 
      className="bg-white rounded-lg shadow-sm p-4 mb-3 mx-4 border-l-4 border-capitalred"
      onPress={handlePress}
    >
      <View className="flex-row justify-between items-center">
        <View className="flex-1">
          <Text className="text-lg font-semibold text-gray-800">{recommendation.shortInsight}</Text>
        </View>
        <View className="items-end">
          <Ionicons name="bulb-outline" size={24} color="#B22A2C" />
        </View>
      </View>
    </TouchableOpacity>
  );
}

interface WellnessScoreCardProps {
  score: WellnessScoreData | null;
  isLoading: boolean;
}

function WellnessScoreCard({ score, isLoading }: WellnessScoreCardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return '#10B981'; // Green
    if (score >= 65) return '#3B82F6'; // Blue
    if (score >= 50) return '#F59E0B'; // Yellow
    if (score >= 35) return '#EF4444'; // Red
    return '#DC2626'; // Dark Red
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return 'trending-up';
    if (score >= 65) return 'checkmark-circle';
    if (score >= 50) return 'warning';
    if (score >= 35) return 'alert-circle';
    return 'close-circle';
  };

  if (isLoading) {
    return (
      <View className="bg-white rounded-xl shadow-sm p-6 mb-4">
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center">
            <Ionicons name="analytics-outline" size={24} color="#1E40AF" />
            <Text className="text-xl font-bold text-gray-800 ml-2">Financial Wellness Score</Text>
          </View>
          <View className="items-center">
            <View className="w-16 h-16 rounded-full items-center justify-center bg-gray-100">
              <Ionicons name="hourglass-outline" size={24} color="#6B7280" />
            </View>
            <Text className="text-sm font-medium mt-1 text-gray-500">
              Analyzing...
            </Text>
          </View>
        </View>
        <View className="flex-row items-center justify-center py-4">
          <Ionicons name="refresh" size={20} color="#6B7280" />
          <Text className="text-gray-600 ml-2">Generating your financial wellness score</Text>
        </View>
      </View>
    );
  }

  if (!score) {
    return null;
  }

  return (
    <View className="bg-white rounded-xl shadow-sm p-6 mb-4">
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-row items-center">
          <Ionicons name="analytics-outline" size={24} color="#1E40AF" />
          <Text className="text-xl font-bold text-gray-800 ml-2">Financial Wellness Score</Text>
        </View>
        <View className="items-center">
          <View 
            className="w-16 h-16 rounded-full items-center justify-center"
            style={{ backgroundColor: getScoreColor(score.overall) + '20' }}
          >
            <Text className="text-2xl font-bold" style={{ color: getScoreColor(score.overall) }}>
              {score.overall}
            </Text>
          </View>
          <Text className="text-sm font-medium mt-1" style={{ color: getScoreColor(score.overall) }}>
            {score.category}
          </Text>
        </View>
      </View>
    </View>
  );
}


