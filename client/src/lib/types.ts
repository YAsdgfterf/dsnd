export interface FormState {
  isLoading: boolean;
  error: string | null;
  success: boolean;
  subdomain: string;
}

export interface ValidationState {
  isValid: boolean;
  message: string;
}

export interface ApiResponse {
  success: boolean;
  message?: string;
  error?: string;
  data?: any;
}
