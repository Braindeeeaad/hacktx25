import { Text, View, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from "react";
import { useAtom } from 'jotai';
import { useEmail } from "../../contexts/emailContext";
import { calculateWellnessScore } from "@/api_hooks/wellbeing_db_api";
import { DataService } from "../../services/dataService";
import { 
  financialDataAtom, 
  wellbeingDataAtom, 
  financeScoreAtom, 
  spendingAnalysisAtom, 
  wellnessAnalysisAtom,
  loadingStatesAtom,
  errorStatesAtom,
  isAnyLoadingAtom,
  hasAnyErrorAtom,
  refreshTriggerAtom,
  triggerRefreshAtom
} from "../../atoms";

export default function Index() {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const { email } = useEmail();
  
  // Jotai atoms
  const [financialData, setFinancialData] = useAtom(financialDataAtom);
  const [wellbeingData, setWellbeingData] = useAtom(wellbeingDataAtom);
  const [financeScore, setFinanceScore] = useAtom(financeScoreAtom);
  const [spendingAnalysis, setSpendingAnalysis] = useAtom(spendingAnalysisAtom);
  const [wellnessAnalysis, setWellnessAnalysis] = useAtom(wellnessAnalysisAtom);
  const [loadingStates, setLoadingStates] = useAtom(loadingStatesAtom);
  const [errorStates, setErrorStates] = useAtom(errorStatesAtom);
  const [isAnyLoading] = useAtom(isAnyLoadingAtom);
  const [hasAnyError] = useAtom(hasAnyErrorAtom);
  const [refreshTrigger] = useAtom(refreshTriggerAtom);
  const [, triggerRefresh] = useAtom(triggerRefreshAtom);
  
  // Local state for display
  const [totalPurchases, setTotalPurchases] = useState<number>(0);
  const [wellbeingScore, setWellbeingScore] = useState<number>(0);
  
  // Data service
  const dataService = new DataService();

  // Helper function to get loading stage text
  const getLoadingStageText = () => {
    if (loadingStates.financial) return 'Loading financial data...';
    if (loadingStates.wellbeing) return 'Loading wellness data...';
    if (loadingStates.geminiFinance || loadingStates.geminiWellness) return 'Analyzing your data with AI...';
    return 'Loading your data...';
  };

  // Initialize data fetching on component mount
  useEffect(() => {
    const initializeData = async () => {
      if (!email) {
        console.log('No email provided, skipping data initialization');
        return;
      }

      try {
        console.log('Starting data initialization...');
        
        // Fetch total purchases for display
        const total = await dataService.getTotalPurchases();
        setTotalPurchases(total);
        
        // Start fetching financial data
        setLoadingStates(prev => ({ ...prev, financial: true }));
        setErrorStates(prev => ({ ...prev, financial: null }));
        
        try {
          const financial = await dataService.fetchFinancialData();
          setFinancialData(financial);
          console.log('Financial data loaded successfully');
        } catch (error) {
          console.error('Failed to fetch financial data:', error);
          setErrorStates(prev => ({ ...prev, financial: 'Failed to load financial data' }));
        } finally {
          setLoadingStates(prev => ({ ...prev, financial: false }));
        }
        
        // Start fetching wellbeing data
        setLoadingStates(prev => ({ ...prev, wellbeing: true }));
        setErrorStates(prev => ({ ...prev, wellbeing: null }));
        
        try {
          const wellbeing = await dataService.fetchWellbeingData(email);
          setWellbeingData(wellbeing);
          const score = calculateWellnessScore(wellbeing);
          setWellbeingScore(score);
          console.log('Wellbeing data loaded successfully');
        } catch (error) {
          console.error('Failed to fetch wellbeing data:', error);
          setErrorStates(prev => ({ ...prev, wellbeing: 'Failed to load wellbeing data' }));
        } finally {
          setLoadingStates(prev => ({ ...prev, wellbeing: false }));
        }
        
      } catch (error) {
        console.error('Error during data initialization:', error);
      }
    };

    initializeData();
  }, [email]);

  // Run Gemini analysis when data becomes available
  useEffect(() => {
    const runGeminiAnalysis = async () => {
      // Only run if we have the required data
      if (!financialData || !wellbeingData) {
        return;
      }

      // Check if we need to run analysis (either not done yet or data has changed)
      const shouldRunFinanceAnalysis = !financeScore || !spendingAnalysis;
      const shouldRunWellnessAnalysis = !wellnessAnalysis;
      
      if (!shouldRunFinanceAnalysis && !shouldRunWellnessAnalysis) {
        console.log('Gemini analysis already completed, skipping...');
        return;
      }

      try {
        console.log('Starting Gemini analysis...');
        
        // Run financial analysis if needed
        if (shouldRunFinanceAnalysis) {
          setLoadingStates(prev => ({ ...prev, geminiFinance: true }));
          setErrorStates(prev => ({ ...prev, geminiFinance: null }));
          
          try {
            const [score, analysis] = await Promise.all([
              dataService.generateFinanceScore(financialData.purchases),
              dataService.analyzeSpending(financialData.purchases)
            ]);
            
            setFinanceScore(score);
            setSpendingAnalysis(analysis);
            console.log('Financial Gemini analysis completed');
          } catch (error) {
            console.error('Failed to run financial Gemini analysis:', error);
            setErrorStates(prev => ({ ...prev, geminiFinance: 'Failed to analyze financial data' }));
          } finally {
            setLoadingStates(prev => ({ ...prev, geminiFinance: false }));
          }
        }
        
        // Run wellness analysis if needed
        if (shouldRunWellnessAnalysis) {
          setLoadingStates(prev => ({ ...prev, geminiWellness: true }));
          setErrorStates(prev => ({ ...prev, geminiWellness: null }));
          
          try {
            const analysis = await dataService.analyzeWellness(wellbeingData);
            setWellnessAnalysis(analysis);
            console.log('Wellness Gemini analysis completed');
          } catch (error) {
            console.error('Failed to run wellness Gemini analysis:', error);
            setErrorStates(prev => ({ ...prev, geminiWellness: 'Failed to analyze wellness data' }));
          } finally {
            setLoadingStates(prev => ({ ...prev, geminiWellness: false }));
          }
        }
        
      } catch (error) {
        console.error('Error during Gemini analysis:', error);
      }
    };

    runGeminiAnalysis();
  }, [financialData, wellbeingData, financeScore, spendingAnalysis, wellnessAnalysis]);

  // Handle refresh triggers (e.g., when new wellbeing data is added)
  useEffect(() => {
    if (refreshTrigger > 0 && email) {
      console.log('Refresh triggered, refetching wellbeing data...');
      
      const refreshWellbeingData = async () => {
        try {
          setLoadingStates(prev => ({ ...prev, wellbeing: true }));
          setErrorStates(prev => ({ ...prev, wellbeing: null }));
          
          const wellbeing = await dataService.fetchWellbeingData(email);
          setWellbeingData(wellbeing);
          const score = calculateWellnessScore(wellbeing);
          setWellbeingScore(score);
          
          // Clear existing wellness analysis to trigger re-analysis
          setWellnessAnalysis(null);
          
          console.log('Wellbeing data refreshed successfully');
        } catch (error) {
          console.error('Failed to refresh wellbeing data:', error);
          setErrorStates(prev => ({ ...prev, wellbeing: 'Failed to refresh wellbeing data' }));
        } finally {
          setLoadingStates(prev => ({ ...prev, wellbeing: false }));
        }
      };
      
      refreshWellbeingData();
    }
  }, [refreshTrigger, email]);
  return (
    <ScrollView className="flex-1 bg-gray-50">
      {/* Header Section */}
      <View className="bg-capitalblue px-6 py-8 pt-20">
        <Text className="text-white text-3xl font-bold mb-2">
          Welcome to Your Dashboard
        </Text>
        <Text className="text-blue-200 text-base">
          Manage your finances and track your wellbeing
        </Text>
      </View>

      {/* Quick Stats Section */}
      <View className="mt-8 mx-8">
        <Text className="text-gray-700 text-2xl font-semibold mb-4 text-center">
          Quick Overview
        </Text>
        <View className="flex-row justify-evenly flex items-center">
          <View className="flex-1 bg-white rounded-lg p-4 shadow-sm mr-1">
            <Text className="text-2xl font-bold text-capitalblue text-center">
              {loadingStates.financial ? 'Loading...' : `$${totalPurchases.toLocaleString()}`}
            </Text>
            <Text className="text-gray-600 text-sm text-center">Total Spending</Text>
          </View>
          <View className="flex-1 bg-white rounded-lg p-4 shadow-sm ml-1">
            <Text className="text-2xl font-bold text-green-600 text-center">
              {loadingStates.wellbeing ? 'Loading...' : `${wellbeingScore}%`}
            </Text>
            <Text className="text-gray-600 text-sm text-center">Wellbeing Score</Text>
          </View>
        </View>
      </View>

      {/* Staged Loading Indicator */}
      {isAnyLoading && (
        <View className="mx-8 mt-4 bg-blue-50 rounded-lg p-4 border border-blue-200">
          <View className="flex-row items-center justify-center mb-3">
            <ActivityIndicator size="small" color="#1E40AF" />
            <Text className="text-blue-800 ml-2 text-sm font-medium">
              {getLoadingStageText()}
            </Text>
          </View>
          
          {/* Progress Stages */}
          <View className="flex-row justify-between items-center">
            <LoadingStage 
              label="Fetching Data" 
              isActive={loadingStates.financial || loadingStates.wellbeing} 
              isCompleted={financialData !== null && wellbeingData !== null}
            />
            <View className="flex-1 h-0.5 bg-gray-300 mx-2" />
            <LoadingStage 
              label="Financial Analysis" 
              isActive={loadingStates.geminiFinance} 
              isCompleted={financeScore !== null && spendingAnalysis !== null}
            />
            <View className="flex-1 h-0.5 bg-gray-300 mx-2" />
            <LoadingStage 
              label="Wellness Analysis" 
              isActive={loadingStates.geminiWellness} 
              isCompleted={wellnessAnalysis !== null}
            />
          </View>
        </View>
      )}

      {/* Error Display */}
      {hasAnyError && (
        <View className="mx-8 mt-4 bg-red-50 rounded-lg p-4 border border-red-200">
          <Text className="text-red-800 text-sm text-center">
            Some data couldn't be loaded. The app will still work with available data.
          </Text>
        </View>
      )}

      {/* Main Content */}
      <View className="flex-1 justify-center items-center p-6">
        <View className="w-full max-w-sm space-y-6">
          {/* Financial Page Button */}
          <TouchableOpacity
            className="bg-white rounded-xl p-6 mb-6 border border-gray-200 shadow-sm"
            onPress={() => navigation.push('FinancialPage')}
            activeOpacity={0.8}
          >
            <View className="flex-row items-center mb-4">
              <View className="bg-green-100 p-3 rounded-full mr-4">
                <Ionicons name="wallet-outline" size={24} color="#10B981" />
              </View>
              <View className="flex-1">
                <Text className="text-xl font-bold text-gray-800">
                  Financial Dashboard
                </Text>
                <Text className="text-gray-600 text-sm">
                  Track and manage your money
                </Text>
              </View>
            </View>
            <View className="flex-row items-center justify-between">
              <Text className="text-green-600 font-semibold">
                View Financial Data
              </Text>
              <Ionicons name="chevron-forward" size={20} color="#10B981" />
            </View>
          </TouchableOpacity>

          {/* Wellbeing Page Button */}
          <TouchableOpacity
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
            onPress={() => navigation.push('WellbeingPage')}
            activeOpacity={0.8}
          >
            <View className="flex-row items-center mb-4">
              <View className="bg-blue-100 p-3 rounded-full mr-4">
                <Ionicons name="heart-outline" size={24} color="#3B82F6" />
              </View>
              <View className="flex-1">
                <Text className="text-xl font-bold text-gray-800">
                  Wellbeing Tracker
                </Text>
                <Text className="text-gray-600 text-sm">
                  Monitor your emotional health
                </Text>
              </View>
            </View>
            <View className="flex-row items-center justify-between">
              <Text className="text-blue-600 font-semibold">
                Track Your Wellbeing
              </Text>
              <Ionicons name="chevron-forward" size={20} color="#3B82F6" />
            </View>
          </TouchableOpacity>

          
        </View>
      </View>
    </ScrollView>
  );
}

// LoadingStage component for progress indicator
interface LoadingStageProps {
  label: string;
  isActive: boolean;
  isCompleted: boolean;
}

function LoadingStage({ label, isActive, isCompleted }: LoadingStageProps) {
  const getStageColor = () => {
    if (isCompleted) return '#10B981'; // Green
    if (isActive) return '#3B82F6'; // Blue
    return '#D1D5DB'; // Gray
  };

  const getStageIcon = () => {
    if (isCompleted) return 'checkmark-circle';
    if (isActive) return 'ellipse';
    return 'ellipse-outline';
  };

  // Split label on space and join with newlines
  const labelWithNewlines = label.split(' ').join('\n');

  return (
    <View className="items-center flex-1">
      <View className="items-center">
        <Ionicons 
          name={getStageIcon() as any} 
          size={16} 
          color={getStageColor()} 
        />
        <Text 
          className="text-xs text-center leading-tight mt-1"
          style={{ 
            color: isActive || isCompleted ? '#374151' : '#9CA3AF',
            fontWeight: isActive ? '600' : '400',
            fontSize: 10,
            lineHeight: 12
          }}
        >
          {labelWithNewlines}
        </Text>
      </View>
    </View>
  );
}
