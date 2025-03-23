import { ApiResponse, RecordType } from "./types";

// Load the stored subdomains from localStorage
const getStoredSubdomains = (): Record<string, any>[] => {
  try {
    const stored = localStorage.getItem('beenshub_subdomains');
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.error('Failed to read from localStorage:', e);
    return [];
  }
};

// Save subdomains to localStorage
const saveSubdomain = (subdomain: string, recordType: RecordType, recordValue: string) => {
  try {
    const subdomains = getStoredSubdomains();
    subdomains.push({
      id: Date.now(),
      subdomain,
      recordType, 
      recordValue,
      createdAt: new Date().toISOString()
    });
    localStorage.setItem('beenshub_subdomains', JSON.stringify(subdomains));
  } catch (e) {
    console.error('Failed to save to localStorage:', e);
  }
};

// Create a subdomain with the Porkbun API
export async function createSubdomain(
  subdomain: string,
  recordType: RecordType,
  recordValue: string
): Promise<ApiResponse> {
  // Add a small delay to simulate network request
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Basic validation
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
  
  // Validate record value format
  if (recordType === 'A') {
    // Simple IP validation
    const ipPattern = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    if (!ipPattern.test(recordValue)) {
      return {
        success: false,
        error: "Invalid IP address format. Please use format like 192.168.1.1"
      };
    }
  } else if (recordType === 'CNAME') {
    // Simple domain validation
    const domainPattern = /^([a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
    if (!domainPattern.test(recordValue)) {
      return {
        success: false,
        error: "Invalid domain format. Please use format like example.com"
      };
    }
  }
  
  // Check if subdomain already exists
  if (await checkSubdomainExists(subdomain)) {
    return {
      success: false,
      error: `Subdomain '${subdomain}' is already taken. Please choose another name.`
    };
  }
  
  // Save the subdomain to localStorage
  saveSubdomain(subdomain, recordType, recordValue);
  
  // Return success response
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

// Check if a subdomain already exists
export async function checkSubdomainExists(subdomain: string): Promise<boolean> {
  // Add a small delay to simulate network request
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Check in localStorage
  const subdomains = getStoredSubdomains();
  return subdomains.some(entry => entry.subdomain.toLowerCase() === subdomain.toLowerCase());
}

// Get all created subdomains
export async function getAllSubdomains(): Promise<any[]> {
  // Add a small delay to simulate network request
  await new Promise(resolve => setTimeout(resolve, 600));
  
  return getStoredSubdomains();
}
