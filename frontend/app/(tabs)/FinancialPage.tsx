import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { BarChart, CurveType, LineChart, PieChart, PopulationPyramid, RadarChart, lineDataItem } from "react-native-gifted-charts";
import { NessieAPIIntegration} from '@/api_hooks/nessie_api';
import { useEffect, useState } from 'react';
import { GeminiIntegration } from '@/api_hooks/gemini_api';
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
  const gemini = new GeminiIntegration()
  const nessie = new NessieAPIIntegration(
    '2535e8ec7de75e2bb33a7e0bab0cc897',        // Your actual API key
    '68f4a25a9683f20dd51a206a',           // Your actual customer ID
    'http://api.nessieisreal.com' // Base URL
  );

  const [purchase_history, setPurchaseHistory] = useState<purchaseType[]>([]);
  const [merchant_names, setMerchantNames] = useState<{[key: string]: string}>({});
// ... (you probably need a user_account state too)
  const [user_account, setUserAccount] = useState<accountType | null>(null);
   const [wellnessScore, setWellnessScore] = useState<WellnessScoreData | null>(null);
   const [isLoadingWellnessScore, setIsLoadingWellnessScore] = useState(false);
   const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
   const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);

// Function to transform purchase data to Transaction format
const transformPurchasesToTransactions = (purchases: purchaseType[]): Transaction[] => {
  return purchases.map((purchase) => ({
    date: purchase.purchase_date,
    category: purchase.description.slice(0, purchase.description.indexOf(" ")),
    amount: Math.abs(purchase.amount), // Make positive for spending analysis
    product: purchase.description || 'Unknown Product'
  }));
};

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


// This useEffect hook will run ONLY ONCE when the component mounts
useEffect(() => {
  
  // All your async logic lives inside this hook now
  async function doSomethingWithAccount(account: accountType) {
    console.log("Fetching purchases for account:", account._id);
    const purchases = await nessie.getAccountPurchases(account._id);
    setPurchaseHistory(purchases); // This will schedule a re-render
    console.log("Purchases fetched!");
    
    // Fetch merchant names for all purchases
    await fetchMerchantNames(purchases);
  }

  async function fetchMerchantNames(purchases: purchaseType[]) {
    console.log("Fetching merchant names...");
    const merchantNamesMap: {[key: string]: string} = {};
    
    // Get unique merchant IDs
    const uniqueMerchantIds = [...new Set(purchases.map(p => p.merchant_id))];
    
    // Fetch merchant names for each unique merchant ID
    for (const merchantId of uniqueMerchantIds) {
      try {
        const merchant = await nessie.getMerchantbyMerchantId(merchantId);
        const merchantName = merchant?.name || merchantId;
        merchantNamesMap[merchantId] = merchantName;
        console.log(`Merchant ${merchantId}: ${merchantName}`);
      } catch (error) {
        console.error(`Failed to fetch merchant name for ${merchantId}:`, error);
        merchantNamesMap[merchantId] = merchantId; // Fallback to merchant ID
      }
    }
    
    setMerchantNames(merchantNamesMap);
    console.log("Merchant names fetched!");
  }

  async function getAndProcessAccounts() {
    try {
      console.log("Getting accounts...");
      const accounts: accountType[] = await nessie.getAccounts();
      console.log("API Response:", accounts);

      const firstAccount = accounts[0];
      setUserAccount(firstAccount); // Save the account to state

      // Now fetch purchases for that account
      await doSomethingWithAccount(firstAccount);
      
      console.log("All data processed!");

    } catch (error) {
      console.error("Error processing accounts:", error);
    }
  }

  // Call the function
  getAndProcessAccounts();

}, []);

// Separate useEffect to generate wellness score when purchase data is available
useEffect(() => {
  const generateWellnessScore = async () => {
    if (purchase_history.length > 0) {
      setIsLoadingWellnessScore(true);
      try {
        console.log('Generating wellness score with Gemini API...');
        
        // Transform purchase data to Transaction format
        const transactions = transformPurchasesToTransactions(purchase_history);
        console.log(`Transformed ${transactions.length} purchases to transactions`);
        
        // Call Gemini API to generate finance score
        const financeScore: FinanceScore = await gemini.generateFinanceScore(transactions);
        console.log('Finance score generated:', financeScore);
        
        // Convert FinanceScore to WellnessScoreData format
        const wellnessScoreData: WellnessScoreData = {
          overall: financeScore.overall,
          category: getCategoryFromScore(financeScore.overall)
        };
        
        setWellnessScore(wellnessScoreData);
        console.log('Wellness score set:', wellnessScoreData);
        
      } catch (error) {
        console.error('=== WELLNESS SCORE ERROR ===');
        console.error('Error generating wellness score:', error);
        console.error('Error type:', typeof error);
        console.error('Error message:', error instanceof Error ? error.message : 'Unknown error');
        console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
        console.error('=== END ERROR LOG ===');
        
        // Fallback to mock data if API fails
        const fallbackScore: WellnessScoreData = {
          overall: 72,
          category: 'Good'
        };
        setWellnessScore(fallbackScore);
      } finally {
        setIsLoadingWellnessScore(false);
      }
    }
  };

  generateWellnessScore();
}, [purchase_history]);

// Separate useEffect to generate analysis result when purchase data is available
useEffect(() => {
  const generateAnalysisResult = async () => {
    if (purchase_history.length > 0) {
      setIsLoadingAnalysis(true);
      try {
        console.log('Generating spending analysis with Gemini API...');
        
        // Transform purchase data to Transaction format
        const transactions = transformPurchasesToTransactions(purchase_history);
        console.log(`Transformed ${transactions.length} purchases to transactions for analysis`);
        
        // Call Gemini API to analyze spending
        const analysis: AnalysisResult = await gemini.analyzeSpending(transactions);
        
        // Only log if we successfully got the analysis result
        if (analysis) {
          // Comprehensive logging of AnalysisResult
          console.log('=== SPENDING ANALYSIS RESULT ===');
          console.log('Full AnalysisResult object:', JSON.stringify(analysis, null, 2));
          
          console.log('\n--- SUMMARY ---');
          console.log('Total Spent:', analysis.summary.totalSpent);
          console.log('Average Daily:', analysis.summary.averageDaily);
          console.log('Span Days:', analysis.summary.spanDays);
          
          console.log('\n--- CATEGORIES ---');
          analysis.categories.forEach((category, index) => {
            console.log(`Category ${index + 1}:`, {
              name: category.category,
              trend: category.trend,
              change: category.change,
              shortInsight: category.shortInsight,
              detailedAnalysis: category.detailedAnalysis,
              wellnessAdvice: category.wellnessAdvice
            });
          });
          
          console.log('\n--- ANOMALIES ---');
          analysis.anomalies.forEach((anomaly, index) => {
            console.log(`Anomaly ${index + 1}:`, {
              id: anomaly.id,
              date: anomaly.date,
              category: anomaly.category,
              amount: anomaly.amount,
              shortInsight: anomaly.shortInsight,
              detailedReason: anomaly.detailedReason
            });
          });
          
          console.log('\n--- RECOMMENDATIONS ---');
          analysis.recommendations.forEach((rec, index) => {
            console.log(`Recommendation ${index + 1}:`, {
              shortInsight: rec.shortInsight,
              detailedAdvice: rec.detailedAdvice,
              linkedInsights: rec.linkedInsights,
              linkedAnomalies: rec.linkedAnomalies,
              category: rec.category
            });
          });
          
          console.log('\n--- WELLNESS TIPS ---');
          analysis.wellnessTips.forEach((tip, index) => {
            console.log(`Wellness Tip ${index + 1}:`, {
              trigger: tip.trigger,
              shortTip: tip.shortTip,
              detailedTip: tip.detailedTip
            });
          });
          
          console.log('=== END ANALYSIS RESULT ===\n');
        }
        
        setAnalysisResult(analysis);
        
      } catch (error) {
        console.error('=== SPENDING ANALYSIS ERROR ===');
        console.error('Error generating spending analysis:', error);
        console.error('Error type:', typeof error);
        console.error('Error message:', error instanceof Error ? error.message : 'Unknown error');
        console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
        console.error('=== END ERROR LOG ===');
        
        // Set to null if API fails - no fallback needed as this is optional data
        setAnalysisResult(null);
      } finally {
        setIsLoadingAnalysis(false);
      }
    }
  };

  generateAnalysisResult();
}, [purchase_history]);

  
  
  // Function to format date to show only month and date
  const formatDateForChart = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };


  
  // Purchase data array
  
  
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
      {(wellnessScore || isLoadingWellnessScore) && (
        <View className="mx-4 mt-6">
          <WellnessScoreCard score={wellnessScore} isLoading={isLoadingWellnessScore} />
        </View>
      )}

      <View className='w-full px-4'>
        <LineChart 
          data={purchase_history.map((item, index) => ({
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
          curved = {true}
          curveType={CurveType.QUADRATIC}
          /* curvature={0.05} */
          /* startFillColor="green" */
        />
      </View>

      {/* Purchase List */}
      <View className="mt-6">
        <View className="flex-row justify-between items-center mb-4 mx-4">
          <Text className="text-capitalblue text-lg font-semibold">
            Recent Purchases
          </Text>
          <TouchableOpacity 
            onPress={() => navigation.push('AllPurchases', {
              purchaseHistory: JSON.stringify(purchase_history),
              merchantNames: JSON.stringify(merchant_names)
            })}
            className="bg-capitalblue px-3 py-1 rounded-lg"
          >
            <Text className="text-white text-sm font-medium">View All</Text>
          </TouchableOpacity>
        </View>
        
        {purchase_history.slice().reverse().slice(0, 5).map((purchase, index) => (
          <Purchase 
            key={index}
            amount={purchase.amount}
            date={purchase.purchase_date}
            description={purchase.description}
            merchant={merchant_names[purchase.merchant_id] || purchase.merchant_id}
          />
        ))}
      </View>

      {/* Recommendations Section */}
      <View className="mt-6">
        <Text className="text-capitalblue text-lg font-semibold mb-4 mx-4">
          Smart Recommendations
        </Text>
        
        {analysisResult?.recommendations.map((recommendation, index) => (
          <RecommendationView
            key={index}
            recommendation={recommendation}
            navigation={navigation}
          />
        ))}
      </View>
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


