
export const config = {
  isDebugMode: import.meta.env.VITE_DEBUG_MODE === 'true',
  apiEndpoint: import.meta.env.VITE_API_ENDPOINT || 'https://api.beenshub.lol'
};
