import { apiRequest } from "./queryClient";
import { ApiResponse, RecordType } from "./types";
import axios from 'axios';
import type { InsertSubdomain } from '@shared/schema';

const API_ENDPOINT = 'http://0.0.0.0:5000';

// Client-side validation of record values
const validateRecordValue = (recordType: RecordType, recordValue: string): string | null => {
  if (!recordValue) {
    return `Record value is required for ${recordType} record`;
  }

  if (recordType === 'A') {
    // Simple IP validation
    const ipPattern = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    if (!ipPattern.test(recordValue)) {
      return "Invalid IP address format. Please use format like 192.168.1.1";
    }
  } else if (recordType === 'CNAME') {
    // Simple domain validation
    const domainPattern = /^([a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
    if (!domainPattern.test(recordValue)) {
      return "Invalid domain format. Please use format like example.com";
    }
  }

  return null; // No validation errors
};

// Create a subdomain with the Porkbun API
export async function createSubdomain(
  subdomain: string,
  recordType: 'A' | 'CNAME',
  recordValue: string
): Promise<ApiResponse> {
  try {
    const response = await axios.post(`${API_ENDPOINT}/subdomains`, {
      subdomain,
      recordType,
      recordValue
    });
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      return error.response.data;
    }
    return {
      success: false,
      error: error.message || 'Failed to create subdomain'
    };
  }
}

// Check if a subdomain already exists
export async function checkSubdomainExists(subdomain: string): Promise<boolean> {
  try {
    const response = await apiRequest("GET", `/api/subdomains/${subdomain}`);
    const data: ApiResponse = await response.json();
    return data.success && data.data?.exists;
  } catch (error) {
    return false;
  }
}