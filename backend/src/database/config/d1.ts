import { DatabaseConfig } from '../types';

// Lazy D1 configuration to ensure environment variables are loaded
export const getD1Config = (): DatabaseConfig => ({
  databaseId: process.env.CLOUDFLARE_D1_DATABASE_ID || '',
  accountId: process.env.CLOUDFLARE_ACCOUNT_ID || '',
  apiToken: process.env.CLOUDFLARE_API_TOKEN || ''
});

// D1 API base URL (lazy)
export const getD1ApiBase = (): string => {
  const config = getD1Config();
  return `https://api.cloudflare.com/client/v4/accounts/${config.accountId}/d1/database/${config.databaseId}`;
};

// Headers for D1 API requests
export const getD1Headers = () => {
  const config = getD1Config();
  return {
    'Authorization': `Bearer ${config.apiToken}`,
    'Content-Type': 'application/json'
  };
};

// SQL queries for database schema
export const SCHEMA_QUERIES = {
  createWellbeingDataTable: `
    CREATE TABLE IF NOT EXISTS wellbeing_data (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      user_id TEXT NOT NULL,
      date TEXT NOT NULL, -- YYYY-MM-DD format
      year INTEGER NOT NULL,
      month INTEGER NOT NULL,
      day INTEGER NOT NULL,
      overall_wellbeing INTEGER NOT NULL CHECK (overall_wellbeing >= 1 AND overall_wellbeing <= 10),
      sleep_quality INTEGER NOT NULL CHECK (sleep_quality >= 1 AND sleep_quality <= 10),
      physical_activity INTEGER NOT NULL CHECK (physical_activity >= 1 AND physical_activity <= 10),
      time_with_family_friends INTEGER NOT NULL CHECK (time_with_family_friends >= 1 AND time_with_family_friends <= 10),
      diet_quality INTEGER NOT NULL CHECK (diet_quality >= 1 AND diet_quality <= 10),
      stress_levels INTEGER NOT NULL CHECK (stress_levels >= 1 AND stress_levels <= 10),
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      UNIQUE(user_id, date)
    );
  `,
  
  createIndexes: [
    'CREATE INDEX IF NOT EXISTS idx_wellbeing_data_user_id ON wellbeing_data(user_id);',
    'CREATE INDEX IF NOT EXISTS idx_wellbeing_data_date ON wellbeing_data(date);',
    'CREATE INDEX IF NOT EXISTS idx_wellbeing_data_year_month ON wellbeing_data(year, month);',
    'CREATE INDEX IF NOT EXISTS idx_wellbeing_data_created_at ON wellbeing_data(created_at);',
    'CREATE INDEX IF NOT EXISTS idx_wellbeing_data_user_date ON wellbeing_data(user_id, date);'
  ]
};

// Validate D1 configuration
export const validateD1Config = (): boolean => {
  const config = getD1Config();
  console.log("D1Config databaseId:", config.databaseId);
  console.log("D1Config accountId:", config.accountId);
  console.log("D1Config apiToken:", config.apiToken ? 'SET' : 'NOT SET');
  return !!(config.databaseId && config.accountId && config.apiToken);
};
