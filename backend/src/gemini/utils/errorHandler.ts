/**
 * Error handling utilities for the AI analysis module
 */

export class AnalysisError extends Error {
  constructor(message: string, public code: string, public originalError?: Error) {
    super(message);
    this.name = 'AnalysisError';
  }
}

export class ValidationError extends AnalysisError {
  constructor(message: string, public field?: string) {
    super(message, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}

export class GeminiAPIError extends AnalysisError {
  constructor(message: string, public statusCode?: number, originalError?: Error) {
    super(message, 'GEMINI_API_ERROR', originalError);
    this.name = 'GeminiAPIError';
  }
}

export function handleError(error: unknown): AnalysisError {
  if (error instanceof AnalysisError) {
    return error;
  }

  if (error instanceof Error) {
    return new AnalysisError(
      error.message,
      'UNKNOWN_ERROR',
      error
    );
  }

  return new AnalysisError(
    'An unknown error occurred',
    'UNKNOWN_ERROR'
  );
}

export function logError(error: AnalysisError, context?: string): void {
  const timestamp = new Date().toISOString();
  const contextStr = context ? ` [${context}]` : '';
  
  console.error(`[${timestamp}]${contextStr} ${error.name}: ${error.message}`);
  
  if (error.originalError) {
    console.error('Original error:', error.originalError);
  }
  
  if (error.code) {
    console.error('Error code:', error.code);
  }
}
