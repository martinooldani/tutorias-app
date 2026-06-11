import { createContext, useState, useContext } from 'react';
import { authService } from '../services/auth.service.js';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [usuario, setUsuario] = useState(() => {
        // Persistir sesión al recargar la página
        const guardado = localStorage.getItem('usuario');
        return guardado ? JSON.parse(guardado) : null;
    });

    async function login(email, password) {
        const data = await authService.login(email, password);
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('usuario', JSON.stringify(data.usuario));
        setUsuario(data.usuario);
        return data;
    }

    async function logout() {
        try {
            await authService.logout();
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
        } finally {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('usuario');
            setUsuario(null);
        }
    }

    return (
        <AuthContext.Provider value={{ usuario, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}