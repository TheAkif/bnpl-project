import API from './apiClient';

export function getAnalytics() {
    return API.get('/api/analytics/').then(res => res.data);
}
