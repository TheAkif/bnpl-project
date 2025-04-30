import axios from 'axios';

const API = axios.create({
    baseURL: 'http://127.0.0.1:8000',
    headers: {
        'Content-Type': 'application/json',
    },
});

API.interceptors.request.use(config => {
    const token = localStorage.getItem('bnpl_access');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export async function getPlans() {
    const resp = await API.get('/api/plans/');
    return resp.data;
}

export async function createPlan({ customer_email, total_amount, num_installments, start_date }) {
    const resp = await API.post('/api/plans/', {
        customer_email, total_amount, num_installments, start_date
    });
    return resp.data;
}

export async function payInstallment(installmentId) {
    const resp = await API.post(`/api/installments/${installmentId}/pay/`);
    return resp.data;
}
