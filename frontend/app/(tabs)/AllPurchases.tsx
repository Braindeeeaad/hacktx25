import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { purchaseType } from '@/api_hooks/api_types';

export default function AllPurchases() {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const route = useRoute();
  const params = route.params as any;
  
  // Parse the data from params
  const purchase_history: purchaseType[] = params?.purchaseHistory ? JSON.parse(params.purchaseHistory as string) : [];
  const merchant_names: {[key: string]: string} = params?.merchantNames ? JSON.parse(params.merchantNames as string) : {};


  // Function to format date for display
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric',
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Function to format date for grouping
  const formatDateForGrouping = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric',
      month: 'long', 
      day: 'numeric'
    });
  };

  // Group purchases by date
  const groupedPurchases = purchase_history.reduce((groups, purchase) => {
    const date = formatDateForGrouping(purchase.purchase_date);
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(purchase);
    return groups;
  }, {} as {[key: string]: purchaseType[]});

  // Sort dates in descending order (most recent first)
  // We need to sort by the actual purchase dates, not the formatted strings
  const sortedDates = Object.keys(groupedPurchases).sort((a, b) => {
    // Find the first purchase in each group to get the actual date
    const dateA = new Date(groupedPurchases[a][0].purchase_date);
    const dateB = new Date(groupedPurchases[b][0].purchase_date);
    return dateB.getTime() - dateA.getTime();
  });

  const renderPurchase = ({ item }: { item: purchaseType }) => (
    <Purchase 
      amount={item.amount}
      date={formatDate(item.purchase_date)}
      type={item.description}
      merchant={merchant_names[item.merchant_id] || item.merchant_id}
      status={item.status}
    />
  );

  const renderDateGroup = (date: string) => {
    const purchases = groupedPurchases[date];
    const totalAmount = purchases.reduce((sum, purchase) => sum + purchase.amount, 0);
    
    return (
      <View key={date} className="mb-6">
        <View className="flex-row justify-between items-center mb-3 mx-4">
          <Text className="text-capitalblue text-lg font-semibold">{date}</Text>
          <Text className="text-gray-600 text-sm">
            {purchases.length} transaction{purchases.length !== 1 ? 's' : ''} • ${totalAmount.toFixed(2)}
          </Text>
        </View>
        {purchases.slice().reverse().map((purchase, index) => (
          <Purchase 
            key={purchase._id}
            amount={purchase.amount}
            date={formatDate(purchase.purchase_date)}
            type={purchase.description}
            merchant={merchant_names[purchase.merchant_id] || purchase.merchant_id}
            status={purchase.status}
          />
        ))}
      </View>
    );
  };


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
            All Purchases
          </Text>
        </View>
        <Text className="text-blue-200 text-base">
          Complete transaction history
        </Text>
      </View>

      {/* Purchase List */}
      <ScrollView className="flex-1">
        <View className="mt-6">
          {sortedDates.length > 0 ? (
            sortedDates.map(renderDateGroup)
          ) : (
            <View className="flex-1 justify-center items-center py-20">
              <Ionicons name="receipt-outline" size={64} color="#B22A2C" />
              <Text className="text-gray-500 text-lg mt-4">No purchases found</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </ScrollView>
  );
}

interface purchaseViewProps {
  amount: number;
  date: string;
  type: string;
  merchant: string;
  status: string;
}

function Purchase({ amount, date, type, merchant, status }: purchaseViewProps) {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'text-green-600';
      case 'pending':
        return 'text-yellow-600';
      case 'failed':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <View className="bg-white rounded-lg shadow-sm p-4 mb-3 mx-4">
      <View className="flex-row justify-between items-center">
        <View className="flex-1">
          <Text className="text-lg font-semibold text-gray-800">{merchant}</Text>
          <Text className="text-gray-600 text-sm">{type}</Text>
          {/* <Text className={`text-xs mt-1 ${getStatusColor(status)}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Text> */}
        </View>
        <View className="items-end">
          <Text className="text-lg font-semibold text-capitalblue">${amount.toFixed(2)}</Text>
          <Text className="text-gray-500 text-sm">{date}</Text>
        </View>
      </View>
    </View>
  );
}
