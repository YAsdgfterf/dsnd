import { ValidationState } from "./types";

export function validateSubdomain(value: string): ValidationState {
  const trimmedValue = value.trim();
  
  // Subdomain validation rules
  const subdomainRegex = /^[a-z0-9]([a-z0-9-]{1,61}[a-z0-9])?$/i;
  
  if (!trimmedValue) {
    return {
      isValid: false,
      message: "Subdomain name is required."
    };
  } else if (trimmedValue.length < 3) {
    return {
      isValid: false,
      message: "Subdomain must be at least 3 characters."
    };
  } else if (trimmedValue.length > 63) {
    return {
      isValid: false,
      message: "Subdomain must be at most 63 characters."
    };
  } else if (!subdomainRegex.test(trimmedValue)) {
    return {
      isValid: false,
      message: "Subdomain must contain only letters, numbers, and hyphens (cannot start or end with hyphen)."
    };
  }
  
  return {
    isValid: true,
    message: ""
  };
}
