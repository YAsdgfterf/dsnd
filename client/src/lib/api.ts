
import axios from 'axios';
import { ApiResponse } from "./types";

const apiRequest = axios.create({
  baseURL: '/',
  timeout: 10000,
});

export async function createSubdomain(
  subdomain: string,
  recordType: string,
  recordValue: string
): Promise<ApiResponse> {
  try {
    const response = await apiRequest.post('/api/subdomains', {
      subdomain,
      recordType,
      recordValue
    });

    return response.data;
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.error || error.message || "Failed to create subdomain"
    };
  }
}
