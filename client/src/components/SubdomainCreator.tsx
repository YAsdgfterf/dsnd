import { useState, useEffect, FormEvent } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { FormState, ValidationState } from '@/lib/types';
import { validateSubdomain } from '@/lib/validation';
import { createSubdomain } from '@/lib/api';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { 
  AlertCircle, 
  CheckCircle, 
  Info, 
  Loader2 
} from 'lucide-react';

const SubdomainCreator = () => {
  const { toast } = useToast();
  
  // Form state
  const [formState, setFormState] = useState<FormState>({
    isLoading: false,
    error: null,
    success: false,
    subdomain: '',
    recordType: 'A',
    recordValue: '76.76.21.21'  // Default IP for examples
  });
  
  // Validation state
  const [validation, setValidation] = useState<ValidationState>({
    isValid: true,
    message: ''
  });
  
  // Handle input change and validation
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormState(prev => ({ ...prev, subdomain: value }));
    
    // Validate the input
    const validationResult = validateSubdomain(value);
    setValidation(validationResult);
  };
  
  // Handle form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!validation.isValid || formState.isLoading) {
      return;
    }
    
    // Set loading state
    setFormState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      // Call API to create subdomain with record type and value
      const response = await createSubdomain(
        formState.subdomain,
        formState.recordType,
        formState.recordValue
      );
      
      if (response.success) {
        // Update state on success
        setFormState(prev => ({ 
          ...prev, 
          isLoading: false, 
          success: true, 
          error: null 
        }));
      } else {
        // Handle error response
        setFormState(prev => ({ 
          ...prev, 
          isLoading: false, 
          error: response.error || 'Failed to create subdomain' 
        }));
      }
    } catch (error) {
      // Handle unexpected errors
      setFormState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'An unexpected error occurred' 
      }));
    }
  };
  
  // Reset the form to create another subdomain
  const resetForm = () => {
    setFormState({
      isLoading: false,
      error: null,
      success: false,
      subdomain: '',
      recordType: 'A',
      recordValue: '76.76.21.21'
    });
    setValidation({
      isValid: true,
      message: ''
    });
  };
  
  // Dismiss error message
  const dismissError = () => {
    setFormState(prev => ({ ...prev, error: null }));
  };
  
  return (
    <div className="max-w-md w-full bg-white shadow-lg rounded-lg overflow-hidden">
      <div className="px-6 py-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-slate-800">Create Your Subdomain</h2>
          <p className="mt-2 text-slate-600">
            Get your custom <span className="font-medium text-primary-600">.beenshub.rest</span> subdomain in seconds
          </p>
        </div>
        
        {!formState.success && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="subdomain" className="block text-sm font-medium text-slate-700">
                Subdomain Name
              </label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <Input
                  type="text"
                  id="subdomain"
                  value={formState.subdomain}
                  onChange={handleInputChange}
                  className="flex-grow block w-full min-w-0 rounded-l-md focus:ring-primary-500 focus:border-primary-500"
                  placeholder="yourdomain"
                  autoComplete="off"
                  disabled={formState.isLoading}
                />
                <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-slate-300 bg-slate-50 text-slate-500 text-sm font-mono">
                  .beenshub.rest
                </span>
              </div>
              
              {!validation.isValid && (
                <div className="mt-2 text-sm text-rose-600">
                  {validation.message}
                </div>
              )}
            </div>
            
            {/* Record Type Selection */}
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Record Type</label>
                <RadioGroup 
                  value={formState.recordType} 
                  onValueChange={(value) => setFormState(prev => ({ ...prev, recordType: value as 'A' | 'CNAME' }))}
                  className="flex gap-6"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="A" id="a-record" />
                    <Label htmlFor="a-record" className="font-normal">A Record (IP Address)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="CNAME" id="cname-record" />
                    <Label htmlFor="cname-record" className="font-normal">CNAME (Alias)</Label>
                  </div>
                </RadioGroup>
              </div>
              
              {/* Record Value Input */}
              <div>
                <label htmlFor="record-value" className="block text-sm font-medium text-slate-700">
                  {formState.recordType === 'A' ? 'IP Address' : 'Domain to Point to'}
                </label>
                <div className="mt-1">
                  <Input
                    type="text"
                    id="record-value"
                    value={formState.recordValue}
                    onChange={(e) => setFormState(prev => ({ ...prev, recordValue: e.target.value }))}
                    className="w-full"
                    placeholder={formState.recordType === 'A' ? '192.168.1.1' : 'example.com'}
                    autoComplete="off"
                    disabled={formState.isLoading}
                  />
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  {formState.recordType === 'A' 
                    ? 'Enter the IP address where your subdomain should point to' 
                    : 'Enter the full domain name this subdomain should point to'}
                </p>
              </div>
            </div>
            
            {/* Preview */}
            <div className="rounded-md bg-slate-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <Info className="h-5 w-5 text-slate-400" />
                </div>
                <div className="ml-3 flex-1 space-y-1">
                  <p className="text-sm text-slate-700">Your subdomain will be:</p>
                  <p className="text-sm font-mono text-primary-600 font-medium">
                    <span>{formState.subdomain || 'yourdomain'}</span>.beenshub.rest
                  </p>
                  <div className="pt-1 mt-1 border-t border-slate-200">
                    <p className="text-xs text-slate-600">Record: <span className="font-medium">{formState.recordType}</span></p>
                    <p className="text-xs text-slate-600">Value: <span className="font-mono font-medium">{formState.recordValue}</span></p>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <Button
                type="submit"
                className="w-full"
                disabled={!validation.isValid || formState.isLoading}
              >
                {formState.isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Subdomain'
                )}
              </Button>
            </div>
          </form>
        )}
        
        {/* Loading State - Handled by the button above */}
        
        {/* Success Message */}
        {formState.success && (
          <div className="mt-6 rounded-md bg-green-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <CheckCircle className="h-5 w-5 text-green-400" />
              </div>
              <div className="ml-3 w-full">
                <h3 className="text-sm font-medium text-green-800">Success!</h3>
                <div className="mt-2 text-sm text-green-700">
                  <p>
                    Your subdomain <span className="font-mono font-medium">{formState.subdomain}</span>.beenshub.rest has been created successfully.
                  </p>
                </div>
                
                {/* DNS Records Information */}
                <div className="mt-4 border border-green-200 rounded-md overflow-hidden">
                  <div className="bg-green-100 px-4 py-2 text-xs font-medium text-green-800">
                    DNS Record Created
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium">Name:</span>
                        <code className="bg-white px-2 py-1 rounded text-green-700 font-mono">
                          {formState.subdomain}.beenshub.rest
                        </code>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium">Type:</span>
                        <code className="bg-white px-2 py-1 rounded text-green-700 font-mono">
                          {formState.recordType}
                        </code>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium">Value:</span>
                        <code className="bg-white px-2 py-1 rounded text-green-700 font-mono">
                          {formState.recordValue}
                        </code>
                      </div>
                    </div>
                    <div className="text-xs text-green-600 border-t border-green-100 pt-2">
                      {formState.recordType === 'A' 
                        ? 'Your subdomain now points to the IP address you specified.' 
                        : 'Your subdomain now points to the domain you specified.'}
                    </div>
                  </div>
                </div>
                
                <div className="mt-4">
                  <div className="-mx-2 -my-1.5 flex">
                    <Button
                      variant="outline"
                      onClick={resetForm}
                      className="bg-green-50 px-2 py-1.5 rounded-md text-sm font-medium text-green-800 hover:bg-green-100 border-green-200"
                    >
                      Create another
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Error Message */}
        {formState.error && (
          <div className="mt-6 rounded-md bg-rose-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-rose-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-rose-800">Error creating subdomain</h3>
                <div className="mt-2 text-sm text-rose-700">
                  <p>{formState.error}</p>
                  {formState.error?.includes('403') && (
                    <div className="mt-2 text-xs border-t border-rose-200 pt-2">
                      <p><strong>Possible issue:</strong> API credentials may be invalid or expired.</p>
                      <p>Please check the Porkbun API credentials.</p>
                    </div>
                  )}
                </div>
                <div className="mt-4">
                  <div className="-mx-2 -my-1.5 flex">
                    <Button
                      variant="outline"
                      onClick={dismissError}
                      className="bg-rose-50 px-2 py-1.5 rounded-md text-sm font-medium text-rose-800 hover:bg-rose-100 border-rose-200"
                    >
                      Dismiss
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* DNS Information Panel */}
      <div className="px-6 py-4 bg-slate-50 border-t border-slate-200">
        <h3 className="text-sm font-medium text-slate-700">DNS Record Types</h3>
        <p className="mt-1 text-sm text-slate-600">
          Choose the record type based on what you want to point your subdomain to:
        </p>
        <ul className="mt-2 text-xs text-slate-600 space-y-2">
          <li className="flex items-start">
            <span className="font-medium mr-1">•</span> 
            <div>
              <strong>A Record</strong>: Points directly to an IP address
              <div className="mt-1 text-xs text-slate-500">
                Example: <code className="text-slate-700 bg-slate-200 px-1 rounded">example.beenshub.rest → 192.168.1.1</code>
              </div>
            </div>
          </li>
          <li className="flex items-start">
            <span className="font-medium mr-1">•</span> 
            <div>
              <strong>CNAME Record</strong>: Creates an alias to another domain
              <div className="mt-1 text-xs text-slate-500">
                Example: <code className="text-slate-700 bg-slate-200 px-1 rounded">example.beenshub.rest → example.com</code>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default SubdomainCreator;
