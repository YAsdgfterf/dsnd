import { apiRequest } from "./queryClient";
import { ApiResponse, RecordType } from "./types";

// Static DNS record configuration
const DNS_RECORDS = {
  'demo': { type: 'A', value: '76.76.21.21' },
  'blog': { type: 'CNAME', value: 'example.com' }
};

// Client-side validation of record values
//This function is no longer needed in the static context.


// Create a subdomain with the Porkbun API
export async function createSubdomain(
  subdomain: string,
  recordType: string,
  recordValue: string
) {
  // Validate subdomain format
  const subdomainRegex = /^[a-z0-9][a-z0-9-]*[a-z0-9]$/;
  if (!subdomainRegex.test(subdomain)) {
    return {
      success: false,
      error: "Invalid subdomain format"
    };
  }

  // Check if subdomain exists
  if (DNS_RECORDS[subdomain]) {
    return {
      success: false,
      error: "Subdomain already exists"
    };
  }

  // Add new record
  DNS_RECORDS[subdomain] = {
    type: recordType,
    value: recordValue
  };

  return {
    success: true,
    message: `Subdomain ${subdomain}.beenshub.lol created successfully`,
    data: {
      subdomain,
      record: {
        type: recordType,
        name: `${subdomain}.beenshub.lol`,
        value: recordValue
      }
    }
  };
}

// Check if a subdomain already exists
//This function is no longer needed in the static context.