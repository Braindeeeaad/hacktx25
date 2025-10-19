import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { BarChart, CurveType, LineChart, PieChart, PopulationPyramid, RadarChart, lineDataItem } from "react-native-gifted-charts";
import { NessieAPIIntegration, accountType, purchaseType } from '@/api_hooks/nessie_api';
import { useEffect, useState } from 'react';

interface RecommendationData {
  title: string;
  overview: string;
  insights: string[];
  recommendations: string[];
}




export default function FinancialPage() {



  const navigation = useNavigation<StackNavigationProp<any>>();

  const nessie = new NessieAPIIntegration(
    '2535e8ec7de75e2bb33a7e0bab0cc897',        // Your actual API key
    '68f4080c9683f20dd519f005',           // Your actual customer ID
    'http://api.nessieisreal.com' // Base URL
  );

  const [purchase_history, setPurchaseHistory] = useState<purchaseType[]>([]);
  const [merchant_names, setMerchantNames] = useState<{[key: string]: string}>({});
// ... (you probably need a user_account state too)
const [user_account, setUserAccount] = useState<accountType | null>(null);

// Recommendation data
const recommendations: RecommendationData[] = [
  {
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
  },
  {
    title: "High-Yield Savings Account",
    overview: "Your current savings account is earning minimal interest. By switching to a high-yield savings account, you could significantly increase your returns on your emergency fund and other savings.",
    insights: [
      "Your current savings account earns only 0.01% APY",
      "High-yield savings accounts are currently offering 4.5-5.0% APY",
      "You could earn an additional $180-200 annually on a $4,000 emergency fund"
    ],
    recommendations: [
      "Research and compare high-yield savings accounts from online banks",
      "Consider accounts with no minimum balance requirements",
      "Set up automatic transfers to maximize your interest earnings"
    ]
  },
  {
    title: "Subscription Service Review",
    overview: "An analysis of your spending patterns shows potential savings opportunities in your subscription services. Many users have unused or underutilized subscriptions that can be optimized.",
    insights: [
      "Average household has 12+ subscription services costing $200+ monthly",
      "Many subscriptions go unused after the first few months",
      "Bundling similar services can reduce costs by 20-30%"
    ],
    recommendations: [
      "Audit all your current subscriptions and their usage",
      "Cancel services you haven't used in the past 3 months",
      "Consider family plans or annual billing for services you use regularly"
    ]
  }
];

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
        const merchantName = await nessie.getMerchantbyMerchantId(merchantId);
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
            type={purchase.description}
            merchant={merchant_names[purchase.merchant_id] || purchase.merchant_id}
          />
        ))}
      </View>

      {/* Recommendations Section */}
      <View className="mt-6">
        <Text className="text-capitalblue text-lg font-semibold mb-4 mx-4">
          Smart Recommendations
        </Text>
        
        {recommendations.map((recommendation, index) => (
          <Recommendation 
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
    type : string;
    merchant : string;
}

function Purchase({ amount, date, type, merchant }: purchaseViewProps) {
  return (
    <View className="bg-white rounded-lg shadow-sm p-4 mb-3 mx-4">
      <View className="flex-row justify-between items-center">
        <View className="flex-1">
          <Text className="text-lg font-semibold text-gray-800">{merchant}</Text>
          <Text className="text-gray-600 text-sm">{type}</Text>
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
    recommendation: RecommendationData;
    navigation : any;
}

function Recommendation({ recommendation, navigation }: recommendationViewProps) {
  const handlePress = () => {
    navigation.push('RecommendationDetail', {
      title: recommendation.title,
      overview: recommendation.overview,
      insights: JSON.stringify(recommendation.insights),
      recommendations: JSON.stringify(recommendation.recommendations)
    });
  };

  return (
    <TouchableOpacity 
      className="bg-white rounded-lg shadow-sm p-4 mb-3 mx-4 border-l-4 border-capitalred"
      onPress={handlePress}
    >
      <View className="flex-row justify-between items-center">
        <View className="flex-1">
          <Text className="text-lg font-semibold text-gray-800">{recommendation.title}</Text>
        </View>
        <View className="items-end">
          <Ionicons name="bulb-outline" size={24} color="#B22A2C" />
        </View>
      </View>
    </TouchableOpacity>
  );
}

