import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
const API_BASE_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, '');

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    },
    withCredentials: true
});

// Request interceptor for debugging and auth
api.interceptors.request.use(
    (config) => {
        // Add auth token from localStorage if available
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        console.log('📤 API Request:', config.method.toUpperCase(), config.url);
        return config;
    },
    (error) => {
        console.error('❌ Request Error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor for debugging
api.interceptors.response.use(
    (response) => {
        console.log('✅ API Response:', response.status, response.config.url);
        return response;
    },
    (error) => {
        console.error('❌ API Error:', error.response?.status, error.message);
        return Promise.reject(error);
    }
);

export const normalizeApiError = (error, fallbackMessage = 'Request failed. Please try again.') => {
    const status = error?.response?.status;
    const serverMessage = error?.response?.data?.error || error?.response?.data?.message;
    const rawMessage = serverMessage || error?.message || fallbackMessage;

    if (!error?.response || rawMessage?.toLowerCase?.().includes('network error')) {
        return {
            title: 'Backend Offline',
            message: `Cannot reach the server at ${API_BASE_ORIGIN}. Please ensure backend is running on port 5000.`
        };
    }

    if (status === 401 || status === 403) {
        return {
            title: 'Unauthorized',
            message: serverMessage || 'Your credentials were rejected. Please verify email and password.'
        };
    }

    if (status >= 500) {
        return {
            title: 'Server Error',
            message: serverMessage || 'The server encountered an internal error. Please try again shortly.'
        };
    }

    return {
        title: 'Request Failed',
        message: rawMessage
    };
};

export default api;
export { API_BASE_URL };
