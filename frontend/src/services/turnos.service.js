import axiosInstance from './axiosConfig.js';

async function BuscarTodos(params) {
    try {
        const response = await axiosInstance.get('/api/turnos', { params });
        return response.data;
    } catch (error) {
        console.error('Error al obtener turnos:', error);
        throw error;
    }
}

async function BuscarUno(id) {
    try {
        const response = await axiosInstance.get(`/api/turnos/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error al obtener turno:', error);
        throw error;
    }
}

async function BuscarHistorial(id) {
    try {
        const response = await axiosInstance.get(`/api/turnos/${id}/historial`);
        return response.data;
    } catch (error) {
        console.error('Error al obtener historial:', error);
        throw error;
    }
}

async function BuscarResumen() {
    try {
        const response = await axiosInstance.get('/api/turnos/resumen');
        return response.data;
    } catch (error) {
        console.error('Error al obtener resumen:', error);
        throw error;
    }
}

async function Grabar(turno) {
    if (!turno.id) {
        const response = await axiosInstance.post('/api/turnos', turno);
        return response.data;
    } else {
        const response = await axiosInstance.put(`/api/turnos/${turno.id}`, turno);
        return response.data;
    }
}

async function Cancelar(id) {
    const response = await axiosInstance.patch(`/api/turnos/${id}/cancelar`);
    return response.data;
}

async function Confirmar(id) {
    const response = await axiosInstance.patch(`/api/turnos/${id}/confirmar`);
    return response.data;
}

async function Realizar(id) {
    const response = await axiosInstance.patch(`/api/turnos/${id}/realizar`);
    return response.data;
}

export const turnosService = {
    BuscarTodos,
    BuscarUno,
    BuscarHistorial,
    BuscarResumen,
    Grabar,
    Cancelar,
    Confirmar,
    Realizar
};