/**
 * Nessie API Configuration
 * Update this file with your actual Nessie API credentials
 */

// 🔑 NESSIE API CONFIGURATION
// Replace these with your actual credentials from the Nessie API

export const NESSIE_CONFIG = {
  // Your Nessie API key (get from http://api.nessieisreal.com/documentation)
  API_KEY: 'your-nessie-api-key-here',
  
  // Your customer ID (create a customer first, then use their ID)
  CUSTOMER_ID: 'your-customer-id-here',
  
  // Base URL for Nessie API
  BASE_URL: 'http://api.nessieisreal.com',
  
  // Optional: Default date range for analysis
  DEFAULT_DAYS: 30
};

/**
 * Example of how to use the configuration
 */
export function createNessieIntegration() {
  const { NessieAPIIntegration } = require('./nessieIntegration');
  
  return new NessieAPIIntegration(
    NESSIE_CONFIG.API_KEY,
    NESSIE_CONFIG.CUSTOMER_ID,
    NESSIE_CONFIG.BASE_URL
  );
}

/**
 * Validate configuration
 */
export function validateNessieConfig() {
  const errors = [];
  
  if (!NESSIE_CONFIG.API_KEY || NESSIE_CONFIG.API_KEY === 'your-nessie-api-key-here') {
    errors.push('API_KEY is not set');
  }
  
  if (!NESSIE_CONFIG.CUSTOMER_ID || NESSIE_CONFIG.CUSTOMER_ID === 'your-customer-id-here') {
    errors.push('CUSTOMER_ID is not set');
  }
  
  if (errors.length > 0) {
    throw new Error(`Nessie configuration errors: ${errors.join(', ')}`);
  }
  
  return true;
}

/**
 * Get configuration status
 */
export function getConfigStatus() {
  return {
    apiKeySet: NESSIE_CONFIG.API_KEY !== 'your-nessie-api-key-here',
    customerIdSet: NESSIE_CONFIG.CUSTOMER_ID !== 'your-customer-id-here',
    baseUrl: NESSIE_CONFIG.BASE_URL,
    isConfigured: NESSIE_CONFIG.API_KEY !== 'your-nessie-api-key-here' && 
                  NESSIE_CONFIG.CUSTOMER_ID !== 'your-customer-id-here'
  };
}

