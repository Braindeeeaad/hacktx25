import { atom } from 'jotai';
import { 
  purchaseType, 
  accountType, 
  WellbeingData, 
  FinanceScore, 
  AnalysisResult, 
  wellnessTip 
} from '@/api_hooks/api_types';

// Raw data atoms
export const financialDataAtom = atom<{
  purchases: purchaseType[];
  merchantNames: {[key: string]: string};
  account: accountType | null;
} | null>(null);

export const wellbeingDataAtom = atom<WellbeingData[] | null>(null);

// Processed Gemini analysis atoms
export const financeScoreAtom = atom<FinanceScore | null>(null);
export const spendingAnalysisAtom = atom<AnalysisResult | null>(null);
export const wellnessAnalysisAtom = atom<wellnessTip[] | null>(null);

// Loading states
export const loadingStatesAtom = atom<{
  financial: boolean;
  wellbeing: boolean;
  geminiFinance: boolean;
  geminiWellness: boolean;
}>({
  financial: false,
  wellbeing: false,
  geminiFinance: false,
  geminiWellness: false,
});

// Error states
export const errorStatesAtom = atom<{
  financial: string | null;
  wellbeing: string | null;
  geminiFinance: string | null;
  geminiWellness: string | null;
}>({
  financial: null,
  wellbeing: null,
  geminiFinance: null,
  geminiWellness: null,
});

// Derived atoms for easy access
export const isDataReadyAtom = atom((get) => {
  const financial = get(financialDataAtom);
  const wellbeing = get(wellbeingDataAtom);
  return {
    financial: financial !== null,
    wellbeing: wellbeing !== null,
    all: financial !== null && wellbeing !== null,
  };
});

export const isGeminiAnalysisReadyAtom = atom((get) => {
  const financeScore = get(financeScoreAtom);
  const spendingAnalysis = get(spendingAnalysisAtom);
  const wellnessAnalysis = get(wellnessAnalysisAtom);
  return {
    financeScore: financeScore !== null,
    spendingAnalysis: spendingAnalysis !== null,
    wellnessAnalysis: wellnessAnalysis !== null,
    all: financeScore !== null && spendingAnalysis !== null && wellnessAnalysis !== null,
  };
});

// Combined loading state
export const isAnyLoadingAtom = atom((get) => {
  const loadingStates = get(loadingStatesAtom);
  return Object.values(loadingStates).some(loading => loading);
});

// Combined error state
export const hasAnyErrorAtom = atom((get) => {
  const errorStates = get(errorStatesAtom);
  return Object.values(errorStates).some(error => error !== null);
});

// Refresh trigger atom - can be used to trigger data refresh
export const refreshTriggerAtom = atom(0);

// Action atom to trigger refresh
export const triggerRefreshAtom = atom(
  null,
  (get, set) => {
    set(refreshTriggerAtom, get(refreshTriggerAtom) + 1);
  }
);
