import axiosInstance from './axiosConfig.js';

async function login(email, password) {
    const response = await axiosInstance.post('/api/auth/login', { email, password });
    return response.data;
}

async function register(nombre, email, password) {
    const response = await axiosInstance.post('/api/auth/register', { nombre, email, password });
    return response.data;
}

async function logout() {
    await axiosInstance.post('/api/auth/logout');
}

export const authService = { login, register, logout };