import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import RutaProtegida from './components/layout/RutaProtegida.jsx';
import Navbar from './components/layout/Navbar.jsx';
import Login from './components/Login.jsx';
import Register from './components/Register.jsx';
import ListaTurnos from './components/turnos/ListaTurnos.jsx';
import DetalleTurno from './components/turnos/DetalleTurno.jsx';
import FormularioTurno from './components/turnos/FormularioTurno.jsx';
import ResumenAdmin from './components/admin/ResumenAdmin.jsx';
import Error404 from './components/Error404.jsx';

function Layout({ children }) {
    return (
        <>
            <Navbar />
            <main className="page">
                {children}
            </main>
        </>
    );
}

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    {/* Rutas públicas */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    {/* Redirigir raíz a turnos */}
                    <Route path="/" element={<Navigate to="/turnos" replace />} />

                    {/* Rutas protegidas — cualquier usuario autenticado */}
                    <Route path="/turnos" element={
                        <RutaProtegida>
                            <Layout><ListaTurnos /></Layout>
                        </RutaProtegida>
                    } />

                    <Route path="/turnos/:id" element={
                        <RutaProtegida>
                            <Layout><DetalleTurno /></Layout>
                        </RutaProtegida>
                    } />

                    {/* Solo estudiante y admin pueden crear/editar */}
                    <Route path="/turnos/nuevo" element={
                        <RutaProtegida roles={['estudiante', 'admin']}>
                            <Layout><FormularioTurno /></Layout>
                        </RutaProtegida>
                    } />

                    <Route path="/turnos/:id/editar" element={
                        <RutaProtegida roles={['estudiante', 'tutor', 'admin']}>
                            <Layout><FormularioTurno /></Layout>
                        </RutaProtegida>
                    } />

                    {/* Solo admin */}
                    <Route path="/admin/resumen" element={
                        <RutaProtegida roles={['admin']}>
                            <Layout><ResumenAdmin /></Layout>
                        </RutaProtegida>
                    } />

                    {/* 404 — siempre al final */}
                    <Route path="*" element={<Error404 />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;