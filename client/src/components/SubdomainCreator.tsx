import React, { useState, useEffect, FormEvent } from 'react';
import { Input } from './ui/input';
import { useToast } from './ui/use-toast';

interface FormState {
  isLoading: boolean;
  error: string | null;
  success: boolean;
  subdomain: string;
  recordType: 'A';
  recordValue: string;
}

interface ValidationState {
  isValid: boolean;
  message: string;
}

const validateSubdomain = (subdomain: string): ValidationState => {
  if (!subdomain) {
    return { isValid: false, message: 'Subdomain is required' };
  }
  if (!/^[a-z0-9-]+$/.test(subdomain)) {
    return { isValid: false, message: 'Only lowercase letters, numbers, and hyphens are allowed' };
  }
  if (subdomain.length < 1 || subdomain.length > 63) {
    return { isValid: false, message: 'Subdomain must be between 1 and 63 characters' };
  }
  return { isValid: true, message: '' };
};

const SubdomainCreator = () => {
  const { toast } = useToast();
  const [formState, setFormState] = useState<FormState>({
    isLoading: false,
    error: null,
    success: false,
    subdomain: '',
    recordType: 'A',
    recordValue: '76.76.21.21'
  });

  const [validation, setValidation] = useState<ValidationState>({
    isValid: true,
    message: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormState(prev => ({ ...prev, subdomain: value }));
    setValidation(validateSubdomain(value));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validation.isValid || formState.isLoading) {
      return;
    }

    setFormState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const apiKey = process.env.VITE_GODADDY_API_KEY;
      const apiSecret = process.env.VITE_GODADDY_API_SECRET;

      if (!apiKey || !apiSecret) {
        throw new Error('API credentials not configured');
      }

      const response = await fetch('https://api.godaddy.com/v1/domains/beenshub.lol/records', {
        method: 'PATCH',
        headers: {
          'Authorization': `sso-key ${apiKey}:${apiSecret}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify([{
          name: formState.subdomain,
          type: formState.recordType,
          data: formState.recordValue,
          ttl: 600
        }])
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create subdomain');
      }

      setFormState(prev => ({ ...prev, success: true }));
      toast({
        title: 'Success!',
        description: `Subdomain ${formState.subdomain}.beenshub.lol created successfully`
      });
    } catch (error: any) {
      setFormState(prev => ({
        ...prev,
        error: error.message || 'An unexpected error occurred'
      }));
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to create subdomain'
      });
    } finally {
      setFormState(prev => ({ ...prev, isLoading: false }));
    }
  };

  return (
    <div className="max-w-md w-full bg-white shadow-lg rounded-lg overflow-hidden">
      <div className="px-6 py-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-slate-800">Create Your Subdomain</h2>
          <p className="mt-2 text-slate-600">
            Get your custom <span className="font-medium text-primary-600">.beenshub.lol</span> subdomain in seconds
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
                  .beenshub.lol
                </span>
              </div>
              {!validation.isValid && (
                <p className="mt-2 text-sm text-red-600">{validation.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={!validation.isValid || formState.isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
            >
              {formState.isLoading ? 'Creating...' : 'Create Subdomain'}
            </button>
          </form>
        )}

        {formState.success && (
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Subdomain Created!</h3>
            <p className="mt-1 text-sm text-gray-500">
              Your subdomain {formState.subdomain}.beenshub.lol is ready to use
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubdomainCreator;