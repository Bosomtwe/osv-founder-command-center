import axios from 'axios';

// Create the axios instance
const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api/',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor for CSRF tokens
api.interceptors.request.use((config) => {
    const getCookie = (name) => {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    };

    const csrfToken = getCookie('csrftoken');
    const method = config.method.toLowerCase();
    
    // Add CSRF token for state-changing requests
    if (csrfToken && ['post', 'put', 'patch', 'delete'].includes(method)) {
        config.headers['X-CSRFToken'] = csrfToken;
    }
    
    return config;
}, (error) => {
    return Promise.reject(error);
});

// Response interceptor for handling authentication errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Unauthorized - clear local storage
            localStorage.removeItem('user');
            localStorage.removeItem('isAuthenticated');
        }
        return Promise.reject(error);
    }
);

// Authentication functions
export const authAPI = {
    // Get CSRF token
    getCSRFToken: async () => {
        try {
            const response = await api.get('api/auth/csrf/');
            console.log('CSRF token obtained');
            return response.data.csrfToken;
        } catch (error) {
            console.error('Failed to get CSRF token:', error);
            throw error;
        }
    },
    
    // Login
    login: async (username, password) => {
        try {
            // Get CSRF token first
            await authAPI.getCSRFToken();
            
            // Then login
            const response = await api.post('auth/login/', { username, password });
            
            // Store user data
            if (response.data.user) {
                localStorage.setItem('user', JSON.stringify(response.data.user));
                localStorage.setItem('isAuthenticated', 'true');
            }
            
            return response.data;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    },
    
    // Logout
    logout: async () => {
        try {
            await api.post('auth/logout/');
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            // Always clear local storage
            localStorage.removeItem('user');
            localStorage.removeItem('isAuthenticated');
        }
    },
    
    // Check authentication
    checkAuth: async () => {
        try {
            const response = await api.get('api/auth/check/');
            if (response.data.authenticated && response.data.user) {
                localStorage.setItem('user', JSON.stringify(response.data.user));
                localStorage.setItem('isAuthenticated', 'true');
                return response.data;
            } else {
                throw new Error('Not authenticated');
            }
        } catch (error) {
            localStorage.removeItem('user');
            localStorage.removeItem('isAuthenticated');
            throw error;
        }
    },
};

export default api;