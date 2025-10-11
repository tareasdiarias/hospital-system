import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Login: React.FC = () => {
    const [userType, setUserType] = useState('DOCTOR');
    const [documentNumber, setDocumentNumber] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const testCredentials: any = {
        'ADMIN': { dni: '12345678', password: 'admin123' },
        'DOCTOR': { dni: '87654321', password: 'doctor123' },
        'RECEPCIONISTA': { dni: '11223344', password: 'recepcionista123' }
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            navigate('/pacientes', { replace: true });
        }

        const savedDocument = localStorage.getItem('savedDocument');
        if (savedDocument) {
            setDocumentNumber(savedDocument);
            setRememberMe(true);
        }
    }, [navigate]);

    const handleUserTypeChange = (type: string) => {
        setUserType(type);
        setDocumentNumber(testCredentials[type].dni);
        setPassword(testCredentials[type].password);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch('http://localhost:9090/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    dni: documentNumber.trim(),
                    password: password.trim()
                })
            });

            if (!response.ok) {
                throw new Error('Credenciales incorrectas');
            }

            const data = await response.json();

            localStorage.setItem('token', data.token);
            localStorage.setItem('username', data.username);
            localStorage.setItem('dni', data.dni);
            localStorage.setItem('email', data.email);
            localStorage.setItem('roles', JSON.stringify(data.roles));

            if (rememberMe) {
                localStorage.setItem('savedDocument', documentNumber);
            } else {
                localStorage.removeItem('savedDocument');
            }

            const from = (location.state as any)?.from?.pathname || '/pacientes';
            navigate(from, { replace: true });

        } catch (err: any) {
            setError('DNI o contraseña incorrectos');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            height: '100vh',
            display: 'flex',
            overflow: 'hidden' // ⭐ Elimina scroll
        }}>
            {/* Lado izquierdo */}
            <div style={{
                flex: '0 0 55%',
                background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2rem'
            }}>
                <div style={{ maxWidth: '450px', textAlign: 'center' }}>
                    <h1 style={{
                        fontSize: '2.5rem',
                        marginBottom: '1rem',
                        fontWeight: '700',
                        lineHeight: '1.2',
                        color: 'white'
                    }}>
                        Hospital System
                    </h1>
                    <p style={{
                        fontSize: '1.1rem',
                        lineHeight: '1.6',
                        opacity: 0.95,
                        color: 'white'
                    }}>
                        Sistema de Gestión Hospitalaria
                    </p>
                    <div style={{ marginTop: '1.5rem', fontSize: '4rem' }}>
                        🏥
                    </div>
                </div>
            </div>

            {/* Lado derecho */}
            <div style={{
                flex: '0 0 45%',
                background: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '1.5rem',
                overflow: 'auto' // Solo si es necesario
            }}>
                <div style={{ width: '100%', maxWidth: '400px' }}>
                    {/* Logo */}
                    <div style={{ textAlign: 'right', marginBottom: '1rem' }}>
                        <span style={{
                            fontSize: '1.3rem',
                            color: '#1e3c72',
                            fontWeight: '700'
                        }}>
                            🏥 Hospital
                        </span>
                    </div>

                    <h2 style={{
                        margin: '0 0 0.3rem 0',
                        fontSize: '1.8rem',
                        fontWeight: '700',
                        color: '#333'
                    }}>
                        Iniciar sesión
                    </h2>

                    <form onSubmit={handleSubmit} style={{ marginTop: '1rem' }}>
                        {/* Perfil */}
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{
                                display: 'block',
                                marginBottom: '0.4rem',
                                fontWeight: '600',
                                color: '#333',
                                fontSize: '0.9rem'
                            }}>
                                Perfil de Usuario
                            </label>
                            <select
                                value={userType}
                                onChange={(e) => handleUserTypeChange(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    border: '1px solid #ddd',
                                    borderRadius: '8px',
                                    fontSize: '0.9rem',
                                    backgroundColor: 'white',
                                    cursor: 'pointer'
                                }}
                                disabled={loading}
                            >
                                <option value="ADMIN">👨‍💼 Administrador</option>
                                <option value="DOCTOR">👨‍⚕️ Doctor</option>
                                <option value="RECEPCIONISTA">👩‍💻 Recepcionista</option>
                            </select>
                        </div>

                        {/* DNI */}
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{
                                display: 'block',
                                marginBottom: '0.4rem',
                                fontWeight: '600',
                                color: '#333',
                                fontSize: '0.9rem'
                            }}>
                                DNI
                            </label>
                            <input
                                type="text"
                                value={documentNumber}
                                onChange={(e) => setDocumentNumber(e.target.value)}
                                placeholder="Ingrese su DNI (8 dígitos)"
                                maxLength={8}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    border: '1px solid #ddd',
                                    borderRadius: '8px',
                                    fontSize: '0.9rem',
                                    boxSizing: 'border-box'
                                }}
                                required
                                disabled={loading}
                            />
                        </div>

                        {/* Contraseña */}
                        <div style={{ marginBottom: '0.8rem' }}>
                            <label style={{
                                display: 'block',
                                marginBottom: '0.4rem',
                                fontWeight: '600',
                                color: '#333',
                                fontSize: '0.9rem'
                            }}>
                                Contraseña
                            </label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Contraseña"
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        paddingRight: '3rem',
                                        border: '1px solid #ddd',
                                        borderRadius: '8px',
                                        fontSize: '0.9rem',
                                        boxSizing: 'border-box'
                                    }}
                                    required
                                    disabled={loading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{
                                        position: 'absolute',
                                        right: '0.8rem',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        fontSize: '1.1rem'
                                    }}
                                >
                                    {showPassword ? '👁️' : '👁️‍🗨️'}
                                </button>
                            </div>
                        </div>

                        {/* ¿Olvidaste contraseña? */}
                        <div style={{ textAlign: 'right', marginBottom: '1rem' }}>
                            <a href="#" style={{
                                color: '#2196F3',
                                fontSize: '0.85rem',
                                textDecoration: 'none'
                            }}>
                                ¿Olvidaste tu contraseña?
                            </a>
                        </div>

                        {/* Checkbox */}
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    style={{ marginRight: '0.5rem', cursor: 'pointer' }}
                                />
                                <span style={{ fontSize: '0.85rem', color: '#666' }}>
                                    Recordar DNI
                                </span>
                            </label>
                        </div>

                        {/* Error */}
                        {error && (
                            <div style={{
                                padding: '0.7rem',
                                background: '#fee',
                                color: '#c33',
                                borderRadius: '8px',
                                marginBottom: '1rem',
                                fontSize: '0.85rem'
                            }}>
                                {error}
                            </div>
                        )}

                        {/* Botón */}
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                width: '100%',
                                padding: '0.9rem',
                                background: loading ? '#999' : '#2196F3',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '1rem',
                                fontWeight: '600',
                                cursor: loading ? 'not-allowed' : 'pointer'
                            }}
                        >
                            {loading ? 'Ingresando...' : 'Ingresar'}
                        </button>
                    </form>

                    {/* Credenciales */}
                    <div style={{
                        marginTop: '1.2rem',
                        padding: '0.8rem',
                        background: '#f8f9fa',
                        borderRadius: '8px',
                        fontSize: '0.8rem'
                    }}>
                        <strong>📋 Credenciales de Prueba:</strong>
                        <div style={{ marginTop: '0.4rem', color: '#666', lineHeight: '1.5' }}>
                            <div><strong>Admin:</strong> DNI: 12345678 / Pass: admin123</div>
                            <div><strong>Doctor:</strong> DNI: 87654321 / Pass: doctor123</div>
                            <div><strong>Recep:</strong> DNI: 11223344 / Pass: recepcionista123</div>
                        </div>
                        <div style={{ marginTop: '0.4rem', fontSize: '0.75rem', color: '#999' }}>
                            💡 Selecciona un perfil arriba para auto-completar
                        </div>
                    </div>

                    {/* Footer */}
                    <div style={{
                        marginTop: '1rem',
                        textAlign: 'center',
                        fontSize: '0.8rem',
                        color: '#999'
                    }}>
                        ¿No tienes cuenta? <a href="/register" style={{ color: '#2196F3', textDecoration: 'none' }}>Crear cuenta</a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
