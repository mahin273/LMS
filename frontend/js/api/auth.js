/**
 * Auth API functions
 */
import api from './client.js';

export const authApi = {
    async register(data) {
        const response = await api.post('/auth/register', data);
        if (response.success) {
            api.setTokens(response.data.tokens.accessToken, response.data.tokens.refreshToken);
            localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        return response;
    },

    async login(email, password) {
        const response = await api.post('/auth/login', { email, password });
        if (response.success) {
            api.setTokens(response.data.tokens.accessToken, response.data.tokens.refreshToken);
            localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        return response;
    },

    async logout() {
        try {
            await api.post('/auth/logout');
        } finally {
            api.clearTokens();
            window.location.href = '/pages/login.html';
        }
    },

    getUser() {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    },

    isAuthenticated() {
        return !!api.getToken();
    },

    async getProfile() {
        return api.get('/users/me');
    },

    async updateProfile(data) {
        return api.put('/users/me', data);
    },

    async getMyBadges() {
        return api.get('/users/me/badges');
    }
};
