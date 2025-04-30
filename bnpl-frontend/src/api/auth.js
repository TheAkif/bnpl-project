import axios from 'axios';

const API = axios.create({
    baseURL: 'http://127.0.0.1:8000',
    headers: {
        'Content-Type': 'application/json',
    },
});

export async function login(username, password) {
    const resp = await API.post('/api/login/', { username, password });
    return resp.data;
}

export function saveAuth({ access, refresh, user }) {
    localStorage.setItem('bnpl_access', access);
    localStorage.setItem('bnpl_refresh', refresh);
    localStorage.setItem('bnpl_user', JSON.stringify(user));
}

export async function signup({ username, email, role, first_name, last_name, password }) {
    const resp = await API.post('/api/signup/', {
        username, email, role, first_name, last_name, password
    });
    return resp.data;
}
