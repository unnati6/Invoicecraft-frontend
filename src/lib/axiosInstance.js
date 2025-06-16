import axios from 'axios';

//export const BASE_URL = 'http://localhost:5000/api';
export const BASE_URL = 'https://invoicecraft-backend.onrender.com/api';

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  // REMOVE default 'Content-Type' here, let Axios handle it based on payload
  // headers: {
  //   'Content-Type': 'application/json', // <--- Remove this default
  // },
});

// Request Interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('supabase_access_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    // ✅ IMPORTANT: If the data payload is FormData, we must ensure
    // the Content-Type header is NOT set to 'application/json'.
    // Axios will automatically set it to 'multipart/form-data' if not explicitly set.
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type']; // Remove the Content-Type header
    } else {
      // For non-FormData requests (like JSON bodies), ensure Content-Type is application/json
      // This handles cases where you might be sending JSON data in other requests.
      if (!config.headers['Content-Type']) { // Only set if not already set by other means
        config.headers['Content-Type'] = 'application/json';
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor (optional, for handling 401/403 globally)
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      console.error('Authentication error: Token expired or invalid. Logging out...');
      localStorage.removeItem('supabase_access_token');
      localStorage.removeItem('user_id');
      window.location.href = '/login'; // Redirect to login page
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
