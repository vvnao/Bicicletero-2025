import axios from './root.service.js';

export const ReviewService = {
    getPending: async () => {
        const { data } = await axios.get('/reviews/pending');
        return data;
    },

    approveUser: async (id) => {
        const { data } = await axios.post(`/reviews/approve/${id}`);
        return data;
    },

    rejectUser: async (id, comment) => {
        const { data } = await axios.post(`/reviews/reject/${id}`, { comment });
        return data;
    },

    getHistory: async () => {
        const { data } = await axios.get('/reviews/history');
        return data;
    },

    filterHistory: async (status) => {
        const { data } = await axios.get(`/reviews/history/filter?action=${status}`);
        return data;
    },

    deleteReview: async (id) => {
        const { data } = await axios.delete(`/reviews/history/${id}`);
        return data;
    },

    updateStatus: async (id, newStatus, comment) => {
        const { data } = await axios.put(`/reviews/history/${id}/status`, {
            newStatus,
            comment,
        });
        return data;
    },
};
