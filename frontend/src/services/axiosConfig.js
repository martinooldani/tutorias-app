import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000';

const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true  // para que envíe la cookie del refresh token
});

// Interceptor de solicitud — agrega el Bearer token automáticamente
axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Interceptor de respuesta — manejo global de errores
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('Error en la solicitud:', error.message);
        return Promise.reject(error);
    }
);

export default axiosInstance;