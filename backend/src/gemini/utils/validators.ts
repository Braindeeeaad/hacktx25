import { Transaction } from '../types';
import { ValidationError } from './errorHandler';

/**
 * Validates transaction data structure and content
 */
export function validateTransaction(transaction: any, index: number): Transaction {
  if (!transaction || typeof transaction !== 'object') {
    throw new ValidationError(`Transaction at index ${index} must be an object`);
  }

  // Validate required fields
  if (!transaction.date || typeof transaction.date !== 'string') {
    throw new ValidationError(`Transaction at index ${index} must have a valid date string`);
  }

  if (!transaction.category || typeof transaction.category !== 'string') {
    throw new ValidationError(`Transaction at index ${index} must have a valid category string`);
  }

  if (typeof transaction.amount !== 'number' || isNaN(transaction.amount)) {
    throw new ValidationError(`Transaction at index ${index} must have a valid numeric amount`);
  }

  // Validate date format
  const date = new Date(transaction.date);
  if (isNaN(date.getTime())) {
    throw new ValidationError(`Transaction at index ${index} has invalid date format: ${transaction.date}`);
  }

  // Validate amount is positive
  if (transaction.amount < 0) {
    throw new ValidationError(`Transaction at index ${index} amount cannot be negative: ${transaction.amount}`);
  }

  // Validate category is not empty
  if (transaction.category.trim().length === 0) {
    throw new ValidationError(`Transaction at index ${index} category cannot be empty`);
  }

  return {
    date: transaction.date,
    category: transaction.category.trim(),
    amount: transaction.amount
  };
}

/**
 * Validates the entire transaction array
 */
export function validateTransactionArray(data: any[]): Transaction[] {
  if (!Array.isArray(data)) {
    throw new ValidationError('Data must be an array of transactions');
  }

  if (data.length === 0) {
    throw new ValidationError('No transaction data provided');
  }

  if (data.length > 10000) {
    throw new ValidationError('Too many transactions provided (max 10,000)');
  }

  return data.map((transaction, index) => validateTransaction(transaction, index));
}

/**
 * Validates API key format
 */
export function validateApiKey(apiKey: string): void {
  if (!apiKey || apiKey === 'your-gemini-api-key-here') {
    throw new ValidationError('Please set your Gemini API key in the GEMINI_API_KEY constant');
  }

  if (apiKey.length < 10) {
    throw new ValidationError('API key appears to be invalid (too short)');
  }
}

/**
 * Validates date range in transactions
 */
export function validateDateRange(transactions: Transaction[]): void {
  const dates = transactions.map(t => new Date(t.date));
  const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
  const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));
  
  const spanDays = Math.ceil((maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  
  if (spanDays > 365) {
    throw new ValidationError('Date range too large (max 1 year)');
  }

  const now = new Date();
  const futureDate = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000)); // 30 days from now
  
  if (maxDate > futureDate) {
    throw new ValidationError('Transactions cannot be more than 30 days in the future');
  }
}
