import { apiRequest } from "./queryClient";
import { ApiResponse } from "./types";

export async function createSubdomain(subdomain: string): Promise<ApiResponse> {
  try {
    const response = await apiRequest("POST", "/api/subdomains", { subdomain });
    const data: ApiResponse = await response.json();
    return data;
  } catch (error) {
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message
      };
    }
    return {
      success: false,
      error: "An unknown error occurred"
    };
  }
}

export async function checkSubdomainExists(subdomain: string): Promise<boolean> {
  try {
    const response = await apiRequest("GET", `/api/subdomains/${subdomain}`);
    const data: ApiResponse = await response.json();
    return data.success && data.data?.exists;
  } catch (error) {
    return false;
  }
}
