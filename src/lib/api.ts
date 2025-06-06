
const BACKEND_BASE_URL = 'https://invoicecraft-backend.onrender.com'; 
//const BACKEND_BASE_URL = 'http://localhost:5000';

export async function checkBackendConnection(): Promise<boolean> {
  const url = `${BACKEND_BASE_URL}/api/status`;

  try {
      console.log(`Attempting to connect to backend at: ${url}`);
      const response = await fetch(url, {
          method: 'GET',
      });

      if (response.ok) {
          const data = await response.json();
          console.log("Backend Connection Successful:", data.message);
          return true;
      } else {
          let errorBodyText = '';
          try {
            errorBodyText = await response.text();
          } catch (e) { /* ignore if reading body fails */ }
          console.error(`Backend Connection Failed to ${url}: Status ${response.status} - ${response.statusText}. Response body: ${errorBodyText}`);
          return false;
      }
  } catch (error: any) {
      console.error(`Network Error: Could not connect to ${url}. Details:`, error.message || error);
      if (error.cause) { // Some fetch errors might have a 'cause' property
        console.error('Cause:', error.cause);
      }
      return false;
  }
}

export async function securedApiCall<T>(
    endpoint: string,
    options?: RequestInit // This is the correct way to pass fetch options
  ): Promise<T | null> {
    const url = `${BACKEND_BASE_URL}${endpoint}`;
    console.log(`FRONTEND DEBUG: Making API call to: ${url}`);
    console.log(`FRONTEND DEBUG: Request options:`, options); // Log options to debug
  
    try {
      
      const response = await fetch(url, options); // Pass the options object directly
   if (!response.ok) {
        let errorData: any = {};
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            errorData = await response.json().catch(() => ({}));
        } else {
            errorData.message = response.statusText;
        }

        console.error(`API Error (${response.status}):`, errorData);
        // Prioritize specific error message from backend, then generic message, then statusText
        const errorMessage = errorData.error || errorData.message || response.statusText;
        throw new Error(`API call failed: ${errorMessage}`);
      }
  const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      return data as T;
    } else {
      return null as T; // or `return undefined as T;`
    }
  } catch (error: any) {
    console.error('Error during API call:', error);
    throw error;
  }
  }