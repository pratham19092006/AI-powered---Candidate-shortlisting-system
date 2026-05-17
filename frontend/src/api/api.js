import axios from 'axios';

// Central Axios client used by every page and component.
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

const request = async (promise) => {
  const response = await promise;
  return response.data;
};

export const getCandidates = (params = {}) => request(apiClient.get('/candidates', { params }));
export const createCandidate = (payload) => request(apiClient.post('/candidates', payload));
export const updateCandidate = (id, payload) => request(apiClient.put(`/candidates/${id}`, payload));
export const deleteCandidate = (id) => request(apiClient.delete(`/candidates/${id}`));
export const matchCandidates = (payload) => request(apiClient.post('/match', payload));
export const saveCandidate = (payload) => request(apiClient.post('/match/save', payload));
export const getSavedCandidates = () => request(apiClient.get('/match/saved'));
export const removeSavedCandidate = (candidateId) => request(apiClient.delete(`/match/saved/${candidateId}`));
export const aiShortlist = (payload) => request(apiClient.post('/ai/shortlist', payload));
export const generateInterviewQuestions = (payload) => request(apiClient.post('/ai/questions', payload));

export default apiClient;
