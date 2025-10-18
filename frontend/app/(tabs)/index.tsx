import { Text, View, ScrollView } from "react-native";

export default function Index() {
  return (
    <ScrollView className="flex-1 bg-gray-900">
      <View className="flex-1 justify-center items-center p-6">
        <View className="bg-blue-500 p-6 rounded-lg shadow-lg mb-6">
          <Text className="text-white text-xl font-bold text-center">
            NativeWind is Working! 🎉
          </Text>
        </View>
        
        <View className="bg-green-500 p-4 rounded-lg mb-4">
          <Text className="text-white text-lg">
            This text has green background
          </Text>
        </View>
        
        <View className="bg-purple-500 p-4 rounded-lg mb-4">
          <Text className="text-white text-lg font-semibold">
            Purple background with semibold text
          </Text>
        </View>
        
        <View className="flex-row space-x-4">
          <View className="bg-red-500 p-3 rounded">
            <Text className="text-white">Red</Text>
          </View>
          <View className="bg-yellow-500 p-3 rounded">
            <Text className="text-black">Yellow</Text>
          </View>
          <View className="bg-pink-500 p-3 rounded">
            <Text className="text-white">Pink</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
