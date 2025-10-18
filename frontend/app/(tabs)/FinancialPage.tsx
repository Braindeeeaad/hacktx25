import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { BarChart, CurveType, LineChart, PieChart, PopulationPyramid, RadarChart, lineDataItem } from "react-native-gifted-charts";

export default function FinancialPage() {
  const router = useRouter();
  
  // Function to format date to show only month and date
  const formatDateForChart = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  // Purchase data array
  const purchases: purchaseViewProps[] = [
    {
      amount: 45.99,
      date: "2024-01-15",
      type: "Groceries",
      merchant: "Whole Foods"
    },
    {
      amount: 12.50,
      date: "2024-01-14",
      type: "Coffee",
      merchant: "Starbucks"
    },
    {
      amount: 89.99,
      date: "2024-01-13",
      type: "Entertainment",
      merchant: "Netflix"
    },
    {
      amount: 156.78,
      date: "2024-01-12",
      type: "Gas",
      merchant: "Shell Station"
    },
    {
      amount: 23.45,
      date: "2024-01-11",
      type: "Dining",
      merchant: "Chipotle"
    },
    {
    amount: 1250.00,
    date: "2024-01-01",
    type: "Housing",
    merchant: "Riverbend Apartments"
  },
  {
    amount: 98.75,
    date: "2024-01-10",
    type: "Shopping",
    merchant: "Amazon"
  },
  {
    amount: 145.20,
    date: "2024-01-09",
    type: "Utilities",
    merchant: "City Power & Light"
  },
  {
    amount: 55.00,
    date: "2024-01-08",
    type: "Fitness",
    merchant: "Anytime Fitness"
  },
  {
    amount: 32.10,
    date: "2024-01-07",
    type: "Pharmacy",
    merchant: "Walgreens"
  },
  {
    amount: 550.99,
    date: "2024-01-05",
    type: "Travel",
    merchant: "Delta Airlines"
  },
  {
    amount: 4.99,
    date: "2024-01-04",
    type: "Subscription",
    merchant: "iCloud Storage"
  },
  {
    amount: 72.30,
    date: "2024-01-03",
    type: "Pet Supplies",
    merchant: "PetSmart"
  },
  {
    amount: 6.25,
    date: "2024-01-02",
    type: "Coffee",
    merchant: "Local Coffee Shop"
  }
  ];
  
  return (
    <ScrollView className="flex-1 bg-gray-50">
      {/* Header with Capital Blue */}

      <View className="bg-capitalblue px-6 py-8 pt-20">
        <View className="flex-row items-center mb-4">
          <TouchableOpacity 
            onPress={() => router.back()}
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
          data={purchases.map((item, index) => ({
            value: item.amount,
            label: formatDateForChart(item.date),
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
        <Text className="text-capitalblue text-lg font-semibold mb-4 mx-4">
          Recent Purchases
        </Text>
        
        {purchases.map((purchase, index) => (
          <Purchase 
            key={index}
            amount={purchase.amount}
            date={purchase.date}
            type={purchase.type}
            merchant={purchase.merchant}
          />
        ))}
      </View>

      {/* Recommendations Section */}
      <View className="mt-6">
        <Text className="text-capitalblue text-lg font-semibold mb-4 mx-4">
          Smart Recommendations
        </Text>
        
        <Recommendation 
          short="Consider increasing your emergency fund"
          router={router}
        />
        
        <Recommendation 
          short="Switch to a high-yield savings account"
          router={router}
        />
        
        <Recommendation 
          short="Review your subscription services"
          router={router}
        />
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
    short : string;
    router : any;
}

function Recommendation({ short, router }: recommendationViewProps) {
  return (
    <TouchableOpacity 
      className="bg-white rounded-lg shadow-sm p-4 mb-3 mx-4 border-l-4 border-capitalred"
      onPress={() => router.push('/financial')}
    >
      <View className="flex-row justify-between items-center">
        <View className="flex-1">
          <Text className="text-lg font-semibold text-gray-800">{short}</Text>
        </View>
        <View className="items-end">
          <Ionicons name="bulb-outline" size={24} color="#B22A2C" />
        </View>
      </View>
    </TouchableOpacity>
  );
}

