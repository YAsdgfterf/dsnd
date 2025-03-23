import { apiRequest } from "./queryClient";
import { ApiResponse, RecordType } from "./types";

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
  recordType: RecordType,
  recordValue: string
): Promise<ApiResponse> {
  try {
    // Perform client-side validation first
    if (!subdomain || subdomain.length < 3) {
      return {
        success: false,
        error: "Subdomain must be at least 3 characters long"
      };
    }
    
    const validationError = validateRecordValue(recordType, recordValue);
    if (validationError) {
      return {
        success: false,
        error: validationError
      };
    }
    
    // Send request to server API
    const response = await apiRequest("POST", "/api/subdomains", { 
      subdomain,
      recordType,
      recordValue
    });
    
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
