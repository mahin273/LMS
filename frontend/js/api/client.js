/**
 * API Client - Handles all HTTP requests to the backend
 */
const API_BASE_URL = 'http://localhost:5000/api';

class ApiClient {
    constructor() {
        this.baseUrl = API_BASE_URL;
    }

    getToken() {
        return localStorage.getItem('accessToken');
    }

    setTokens(accessToken, refreshToken) {
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
    }

    clearTokens() {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const headers = {
            ...options.headers,
        };

        // Always add token first
        const token = this.getToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        // Handle FormData (file uploads)
        if (options.body instanceof FormData) {
            // Let browser set Content-Type with boundary
        } else if (options.method && options.method !== 'GET' && options.method !== 'DELETE') {
            headers['Content-Type'] = 'application/json';
        } else if (!options.method || options.method === 'POST' || options.method === 'PUT') {
            headers['Content-Type'] = 'application/json';
        }

        const config = {
            ...options,
            headers,
            body: options.body instanceof FormData
                ? options.body
                : options.body ? JSON.stringify(options.body) : undefined,
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                // Handle token expiry
                if (response.status === 401 && data.error?.message?.includes('expired')) {
                    const refreshed = await this.refreshToken();
                    if (refreshed) {
                        return this.request(endpoint, options);
                    }
                    this.clearTokens();
                    window.location.href = '/pages/login.html';
                }
                throw new Error(data.error?.message || 'Request failed');
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    async refreshToken() {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) return false;

        try {
            const response = await fetch(`${this.baseUrl}/auth/refresh`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refreshToken }),
            });

            if (response.ok) {
                const data = await response.json();
                this.setTokens(data.data.tokens.accessToken, data.data.tokens.refreshToken);
                return true;
            }
            return false;
        } catch {
            return false;
        }
    }

    get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    }

    post(endpoint, body) {
        return this.request(endpoint, { method: 'POST', body });
    }

    put(endpoint, body) {
        return this.request(endpoint, { method: 'PUT', body });
    }

    delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }

    upload(endpoint, formData) {
        return this.request(endpoint, { method: 'POST', body: formData });
    }
}

const api = new ApiClient();
export default api;
