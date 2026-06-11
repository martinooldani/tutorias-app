import axiosInstance from './axiosConfig.js';

async function BuscarTodos() {
    try {
        const response = await axiosInstance.get('/api/tutores');
        return response.data;
    } catch (error) {
        console.error('Error al obtener tutores:', error);
        throw error;
    }
}

export const tutoresService = { BuscarTodos };