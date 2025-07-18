import { toast } from '@/components/ui/use-toast';

/**
 * Base error class for application errors
 */
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'AppError';
  }
}

/**
 * Error class for validation errors
 */
export class ValidationError extends AppError {
  constructor(message: string, public field?: string) {
    super(message, 'VALIDATION_ERROR', 400);
    this.name = 'ValidationError';
  }
}

/**
 * Error class for network errors
 */
export class NetworkError extends AppError {
  constructor(message: string = 'Erro de conexão') {
    super(message, 'NETWORK_ERROR', 0);
    this.name = 'NetworkError';
  }
}

/**
 * Error class for authentication errors
 */
export class AuthError extends AppError {
  constructor(message: string = 'Erro de autenticação') {
    super(message, 'AUTH_ERROR', 401);
    this.name = 'AuthError';
  }
}

/**
 * Error class for not found errors
 */
export class NotFoundError extends AppError {
  constructor(message: string = 'Recurso não encontrado') {
    super(message, 'NOT_FOUND', 404);
    this.name = 'NotFoundError';
  }
}

/**
 * Handles API errors and returns an appropriate AppError
 * @param error The error to handle
 * @returns An AppError instance
 */
export const handleApiError = (error: any): AppError => {
  // Check if the error is already an AppError
  if (error instanceof AppError) {
    return error;
  }

  // Check for Supabase specific errors
  if (error.code === 'PGRST116') {
    return new ValidationError('Dados inválidos fornecidos');
  }
  
  if (error.message?.includes('JWT')) {
    return new AuthError('Sessão expirada');
  }

  // Check for network errors
  if (!navigator.onLine) {
    return new NetworkError('Sem conexão com a internet');
  }

  // Check for 404 errors
  if (error.status === 404 || error.statusCode === 404) {
    return new NotFoundError(error.message || 'Recurso não encontrado');
  }
  
  // Default to a generic AppError
  return new AppError(
    error.message || 'Erro interno do servidor',
    error.code || 'UNKNOWN_ERROR',
    error.statusCode || 500
  );
};

/**
 * Shows a toast notification for an error
 * @param error The error to show
 */
export const showErrorToast = (error: Error | string): void => {
  const message = typeof error === 'string' ? error : error.message;
  
  toast({
    title: 'Erro',
    description: message || 'Ocorreu um erro inesperado',
    variant: 'destructive',
  });
};

/**
 * Logs an error to the console and optionally to an error tracking service
 * @param error The error to log
 * @param context Additional context information
 */
export const logError = (error: Error, context?: Record<string, any>): void => {
  console.error('Application error:', error, context);
  
  // Here you would integrate with an error tracking service like Sentry
  // Example: Sentry.captureException(error, { extra: context });
};

/**
 * Safely executes a function and handles any errors
 * @param fn The function to execute
 * @param errorHandler Optional custom error handler
 * @returns The result of the function or undefined if an error occurred
 */
export async function safeExecute<T>(
  fn: () => Promise<T>,
  errorHandler?: (error: AppError) => void
): Promise<T | undefined> {
  try {
    return await fn();
  } catch (error) {
    const appError = handleApiError(error);
    
    if (errorHandler) {
      errorHandler(appError);
    } else {
      showErrorToast(appError);
      logError(appError);
    }
    
    return undefined;
  }
}