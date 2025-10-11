import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FaHospital, FaUserInjured, FaCalendarAlt, FaUserMd, FaStethoscope, FaFileInvoice, FaSignOutAlt } from 'react-icons/fa';
import { getModulePermissions, getRoleName } from '../../utils/roleHelper';
import '../../css/Navbar.css';

const Navbar = () => {
    const navigate = useNavigate();
    const permissions = getModulePermissions();
    const username = localStorage.getItem('username') || 'Usuario';
    const roleName = getRoleName();

    const handleLogout = () => {
        if (window.confirm('¿Seguro que deseas cerrar sesión?')) {
            localStorage.clear();
            navigate('/login', { replace: true });
        }
    };

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <NavLink to="/" className="navbar-brand">
                    <FaHospital className="brand-icon" />
                    <h1>Hospital System</h1>
                </NavLink>

                <ul className="navbar-menu">
                    {/* Pacientes - Todos pueden ver */}
                    {permissions.pacientes && (
                        <li>
                            <NavLink to="/pacientes" className={({ isActive }) => isActive ? 'active' : ''}>
                                <FaUserInjured />
                                Pacientes
                            </NavLink>
                        </li>
                    )}

                    {/* Citas - Todos pueden ver */}
                    {permissions.citas && (
                        <li>
                            <NavLink to="/citas" className={({ isActive }) => isActive ? 'active' : ''}>
                                <FaCalendarAlt />
                                Citas
                            </NavLink>
                        </li>
                    )}

                    {/* Médicos - Solo Admin */}
                    {permissions.medicos && (
                        <li>
                            <NavLink to="/medicos" className={({ isActive }) => isActive ? 'active' : ''}>
                                <FaUserMd />
                                Médicos
                            </NavLink>
                        </li>
                    )}

                    {/* Consultas - Admin y Doctor */}
                    {permissions.consultas && (
                        <li>
                            <NavLink to="/consultas" className={({ isActive }) => isActive ? 'active' : ''}>
                                <FaStethoscope />
                                Consultas
                            </NavLink>
                        </li>
                    )}

                    {/* Facturas - Solo Admin */}
                    {permissions.facturas && (
                        <li>
                            <NavLink to="/facturas" className={({ isActive }) => isActive ? 'active' : ''}>
                                <FaFileInvoice />
                                Facturación
                            </NavLink>
                        </li>
                    )}
                </ul>

                <div className="navbar-user">
                    <span className="user-info">
                        👤 {username} ({roleName})
                    </span>
                    <button onClick={handleLogout} className="logout-btn" title="Cerrar Sesión">
                        <FaSignOutAlt /> Salir
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
