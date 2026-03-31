/**
 * API Response Utilities
 *
 * Handles the standardized backend response format:
 * Success: { success: true, message: "...", data: {...} }
 * Error: { success: false, error: "...", message: "...", details: {...} }
 */

interface SuccessResponse<T> {
  success: true;
  message: string;
  data: T;
}

interface ErrorResponse {
  success: false;
  error: string;
  message: string;
  details?: Record<string, unknown>;
}

type BackendResponse<T> = SuccessResponse<T> | ErrorResponse;

/**
 * Extracts data from a SuccessResponse, throwing on ErrorResponse
 *
 * @param response - The backend response object
 * @param errorMessage - Custom error message (optional)
 * @returns The data payload from SuccessResponse
 * @throws Error with backend message if response is ErrorResponse
 *
 * @example
 * const res = await api.get('/auth/me/');
 * const user = unwrapResponse<User>(res.data); // Returns User object
 */
export function unwrapResponse<T>(
  response: BackendResponse<T>,
  errorMessage?: string
): T {
  if (response.success) {
    return response.data;
  }

  // Extract error details for better debugging
  const errorDetails = response.details
    ? `\nDetails: ${JSON.stringify(response.details, null, 2)}`
    : '';

  throw new Error(
    errorMessage || response.message || `Request failed: ${response.error}${errorDetails}`
  );
}

/**
 * Safely extracts data from a response, returning null on error
 *
 * @param response - The backend response object
 * @returns The data payload or null if ErrorResponse
 *
 * @example
 * const res = await api.get('/preferences/');
 * const prefs = unwrapResponseOrNull<Preferences>(res.data);
 * if (prefs) { ... }
 */
export function unwrapResponseOrNull<T>(
  response: BackendResponse<T>
): T | null {
  try {
    return unwrapResponse(response);
  } catch {
    return null;
  }
}

/**
 * Extracts error message from an axios error object
 *
 * @param error - The error from axios catch block
 * @returns User-friendly error message
 *
 * @example
 * try {
 *   await authAPI.login(username, password);
 * } catch (err) {
 *   const message = getErrorMessage(err);
 *   setError(message);
 * }
 */
export function getErrorMessage(error: unknown): string {
  // Axios error with response
  const axiosError = error as {
    response?: {
      status?: number;
      data?: ErrorResponse;
    };
  };

  if (axiosError.response?.data) {
    const { data } = axiosError.response;

    // Check if it's our standardized ErrorResponse format
    if (!data.success && data.message) {
      return data.message;
    }

    // Check for error field
    if (data.error) {
      return data.error;
    }
  }

  // Network errors
  if (error instanceof Error) {
    if (error.message.includes('Network Error')) {
      return 'Network error. Please check your connection.';
    }
    if (error.message.includes('timeout')) {
      return 'Request timed out. Please try again.';
    }
    return error.message;
  }

  return 'An unexpected error occurred. Please try again.';
}

/**
 * Checks if an error is a specific error type from backend
 *
 * @param error - The error from axios catch block
 * @param errorType - The error type to check (e.g., 'validation_error', 'not_found')
 * @returns True if error matches the type
 *
 * @example
 * try {
 *   await api.post('/playlist/', data);
 * } catch (err) {
 *   if (isErrorType(err, 'validation_error')) {
 *     // Handle validation errors
 *   }
 * }
 */
export function isErrorType(error: unknown, errorType: string): boolean {
  const axiosError = error as {
    response?: {
      data?: ErrorResponse;
    };
  };

  return axiosError.response?.data?.error === errorType;
}

/**
 * Extracts validation error details from a ValidationErrorResponse
 *
 * @param error - The error from axios catch block
 * @returns Object mapping field names to error messages, or null
 *
 * @example
 * try {
 *   await api.post('/auth/register/', { username, password });
 * } catch (err) {
 *   const validationErrors = getValidationErrors(err);
 *   if (validationErrors) {
 *     setFieldErrors(validationErrors); // { username: 'This field is required.' }
 *   }
 * }
 */
export function getValidationErrors(
  error: unknown
): Record<string, string> | null {
  const axiosError = error as {
    response?: {
      data?: ErrorResponse;
    };
  };

  if (
    axiosError.response?.data?.error === 'validation_error' &&
    axiosError.response.data.details
  ) {
    const details = axiosError.response.data.details as Record<
      string,
      string | string[]
    >;

    // Convert array errors to strings
    const formatted: Record<string, string> = {};
    for (const [field, message] of Object.entries(details)) {
      formatted[field] = Array.isArray(message) ? message[0] : message;
    }

    return formatted;
  }

  return null;
}
