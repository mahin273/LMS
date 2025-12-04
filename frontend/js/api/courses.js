/**
 * Courses API functions
 */
import api from './client.js';

export const coursesApi = {
    getAll(params = {}) {
        const query = new URLSearchParams(params).toString();
        return api.get(`/courses${query ? '?' + query : ''}`);
    },

    getById(id) {
        return api.get(`/courses/${id}`);
    },

    create(data) {
        return api.post('/courses', data);
    },

    update(id, data) {
        return api.put(`/courses/${id}`, data);
    },

    delete(id) {
        return api.delete(`/courses/${id}`);
    },

    enroll(id) {
        return api.post(`/courses/${id}/enroll`);
    },

    getEnrolled() {
        return api.get('/courses/enrolled');
    },

    getTeaching() {
        return api.get('/courses/teaching');
    },

    getProgress(id) {
        return api.get(`/courses/${id}/progress`);
    },

    getLessons(courseId) {
        return api.get(`/courses/${courseId}/lessons`);
    },

    getAssignments(courseId) {
        return api.get(`/courses/${courseId}/assignments`);
    }
};

export const lessonsApi = {
    getById(id) {
        return api.get(`/lessons/${id}`);
    },

    create(courseId, data) {
        return api.post(`/courses/${courseId}/lessons`, data);
    },

    update(id, data) {
        return api.put(`/lessons/${id}`, data);
    },

    delete(id) {
        return api.delete(`/lessons/${id}`);
    },

    complete(id) {
        return api.post(`/lessons/${id}/complete`);
    }
};

export const assignmentsApi = {
    getById(id) {
        return api.get(`/assignments/${id}`);
    },

    create(courseId, formData) {
        return api.upload(`/courses/${courseId}/assignments`, formData);
    },

    submit(id, formData) {
        return api.upload(`/assignments/${id}/submit`, formData);
    },

    getSubmissions(id) {
        return api.get(`/assignments/${id}/submissions`);
    },

    gradeSubmission(submissionId, data) {
        return api.put(`/submissions/${submissionId}/grade`, data);
    }
};
