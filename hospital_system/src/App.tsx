import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import Login from './components/common/Login';

import PacienteList from './components/pacientes/PacienteList';
import PacienteForm from './components/pacientes/PacienteForm';
import HistoriaClinica from './components/pacientes/HistoriaClinica';

import CitaList from './components/citas/CitaList';
import CitaForm from './components/citas/CitaForm';

import MedicoList from './components/medicos/MedicoList';
import MedicoForm from './components/medicos/MedicoForm';
import EspecialidadList from './components/medicos/EspecialidadList';

import ConsultaList from './components/consultas/ConsultaList';
import ConsultaForm from './components/consultas/ConsultaForm';

import FacturaList from './components/facturas/FacturaList';
import FacturaForm from './components/facturas/FacturaForm';

import { getModulePermissions } from './utils/roleHelper';
import './css/App.css';

const isAuthenticated = () => {
    return localStorage.getItem('token') !== null;
};

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
    return isAuthenticated() ? <>{children}</> : <Navigate to="/login" replace />;
};

// Componente para proteger rutas según permisos
const ProtectedRoute = ({ children, requiredPermission }: { children: React.ReactNode; requiredPermission: keyof ReturnType<typeof getModulePermissions> }) => {
    const permissions = getModulePermissions();

    if (!permissions[requiredPermission]) {
        return (
            <div style={{
                padding: '3rem',
                textAlign: 'center',
                background: '#fff',
                borderRadius: '12px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                margin: '2rem auto',
                maxWidth: '600px'
            }}>
                <h2 style={{ color: '#e74c3c', fontSize: '2.5rem', marginBottom: '1rem' }}>
                    🚫 Acceso Denegado
                </h2>
                <p style={{ fontSize: '1.1rem', color: '#666', marginBottom: '2rem' }}>
                    No tienes permisos para acceder a este módulo.
                </p>
                <Link
                    to="/pacientes"
                    style={{
                        display: 'inline-block',
                        padding: '0.8rem 2rem',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        textDecoration: 'none',
                        borderRadius: '8px',
                        fontWeight: '600',
                        transition: 'transform 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                    ← Volver a Inicio
                </Link>
            </div>
        );
    }

    return <>{children}</>;
};

function App() {
    return (
        <Router>
            <div className="App">
                <Routes>
                    <Route path="/login" element={<Login />} />

                    <Route
                        path="/*"
                        element={
                            <PrivateRoute>
                                <Navbar />
                                <div className="main-container">
                                    <Routes>
                                        <Route path="/" element={<Navigate to="/pacientes" replace />} />

                                        {/* Pacientes */}
                                        <Route path="/pacientes" element={
                                            <ProtectedRoute requiredPermission="pacientes">
                                                <PacienteList />
                                            </ProtectedRoute>
                                        } />
                                        <Route path="/pacientes/nuevo" element={
                                            <ProtectedRoute requiredPermission="pacientes">
                                                <PacienteForm />
                                            </ProtectedRoute>
                                        } />
                                        <Route path="/pacientes/editar/:id" element={
                                            <ProtectedRoute requiredPermission="pacientes">
                                                <PacienteForm />
                                            </ProtectedRoute>
                                        } />
                                        <Route path="/pacientes/historia/:id" element={
                                            <ProtectedRoute requiredPermission="pacientes">
                                                <HistoriaClinica />
                                            </ProtectedRoute>
                                        } />

                                        {/* Citas */}
                                        <Route path="/citas" element={
                                            <ProtectedRoute requiredPermission="citas">
                                                <CitaList />
                                            </ProtectedRoute>
                                        } />
                                        <Route path="/citas/nueva" element={
                                            <ProtectedRoute requiredPermission="citas">
                                                <CitaForm />
                                            </ProtectedRoute>
                                        } />
                                        <Route path="/citas/editar/:id" element={
                                            <ProtectedRoute requiredPermission="citas">
                                                <CitaForm />
                                            </ProtectedRoute>
                                        } />

                                        {/* Médicos - Solo Admin */}
                                        <Route path="/medicos" element={
                                            <ProtectedRoute requiredPermission="medicos">
                                                <MedicoList />
                                            </ProtectedRoute>
                                        } />
                                        <Route path="/medicos/nuevo" element={
                                            <ProtectedRoute requiredPermission="medicos">
                                                <MedicoForm />
                                            </ProtectedRoute>
                                        } />
                                        <Route path="/medicos/editar/:id" element={
                                            <ProtectedRoute requiredPermission="medicos">
                                                <MedicoForm />
                                            </ProtectedRoute>
                                        } />
                                        <Route path="/especialidades" element={
                                            <ProtectedRoute requiredPermission="especialidades">
                                                <EspecialidadList />
                                            </ProtectedRoute>
                                        } />

                                        {/* Consultas - Admin y Doctor */}
                                        <Route path="/consultas" element={
                                            <ProtectedRoute requiredPermission="consultas">
                                                <ConsultaList />
                                            </ProtectedRoute>
                                        } />
                                        <Route path="/consultas/nueva" element={
                                            <ProtectedRoute requiredPermission="consultas">
                                                <ConsultaForm />
                                            </ProtectedRoute>
                                        } />
                                        <Route path="/consultas/editar/:id" element={
                                            <ProtectedRoute requiredPermission="consultas">
                                                <ConsultaForm />
                                            </ProtectedRoute>
                                        } />

                                        {/* Facturas - Solo Admin */}
                                        <Route path="/facturas" element={
                                            <ProtectedRoute requiredPermission="facturas">
                                                <FacturaList />
                                            </ProtectedRoute>
                                        } />
                                        <Route path="/facturas/nueva" element={
                                            <ProtectedRoute requiredPermission="facturas">
                                                <FacturaForm />
                                            </ProtectedRoute>
                                        } />
                                        <Route path="/facturas/editar/:id" element={
                                            <ProtectedRoute requiredPermission="facturas">
                                                <FacturaForm />
                                            </ProtectedRoute>
                                        } />
                                    </Routes>
                                </div>
                                <Footer />
                            </PrivateRoute>
                        }
                    />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
