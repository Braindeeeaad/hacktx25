/**
 * Example configuration for the AI spending analysis module
 * Copy this file to config.ts and update with your actual API key
 */

export const config = {
  // Gemini API Key - Get from https://makersuite.google.com/app/apikey
  GEMINI_API_KEY: 'your-gemini-api-key-here',
  
  // Optional: Customize the Gemini model
  GEMINI_MODEL: 'gemini-2.0-flash-exp',
  
  // Optional: Set analysis limits
  MAX_TRANSACTIONS: 10000,
  MAX_DATE_RANGE_DAYS: 365,
  MAX_FUTURE_DAYS: 30
};
