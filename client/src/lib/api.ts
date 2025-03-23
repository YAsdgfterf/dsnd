import { ApiResponse, RecordType } from "./types";

// Static implementation that simulates API responses
export async function createSubdomain(
  subdomain: string,
  recordType: RecordType,
  recordValue: string
): Promise<ApiResponse> {
  // Add a small delay to simulate network request
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Simulate validation
  if (!subdomain || subdomain.length < 3) {
    return {
      success: false,
      error: "Subdomain must be at least 3 characters long"
    };
  }
  
  if (!recordValue) {
    return {
      success: false,
      error: `Record value is required for ${recordType} record`
    };
  }
  
  // Simulate success response
  return {
    success: true,
    message: `Subdomain ${subdomain}.beenshub.rest created successfully with ${recordType} record`,
    data: { 
      subdomain,
      record: {
        type: recordType,
        name: `${subdomain}.beenshub.rest`,
        value: recordValue
      }
    }
  };
}

export async function checkSubdomainExists(subdomain: string): Promise<boolean> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // For demonstration purposes, return false to always allow creation
  return false;
}
