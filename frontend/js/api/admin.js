/**
 * Admin API functions
 */
import api from './client.js';

export const adminApi = {
    getUsers(params = {}) {
        const query = new URLSearchParams(params).toString();
        return api.get(`/users${query ? '?' + query : ''}`);
    },

    getPendingApprovals() {
        return api.get('/users/pending-approvals');
    },

    approveUser(id) {
        return api.put(`/users/${id}/approve`);
    },

    rejectUser(id) {
        return api.put(`/users/${id}/reject`);
    },

    deleteUser(id) {
        return api.delete(`/users/${id}`);
    }
};
