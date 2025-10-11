import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import citaService from '../../services/citaService';
import pacienteService from '../../services/pacienteService';
import medicoService from '../../services/medicoService';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import '../../css/Tables.css';
import '../../css/Components.css';

const CitaList = () => {
    const [citas, setCitas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');

    const roles = JSON.parse(localStorage.getItem('roles') || '[]');
    const isAdmin = roles.includes('ROLE_ADMIN');

    useEffect(() => {
        cargarCitas();
    }, []);

    const cargarCitas = async () => {
        try {
            setLoading(true);

            const [citasRes, pacientesRes, medicosRes] = await Promise.all([
                citaService.getAllCitas(),
                pacienteService.getAllPacientes(),
                medicoService.getAllMedicos()
            ]);

            const pacientesMap = {};
            pacientesRes.data.forEach(p => {
                pacientesMap[p.idPaciente] = `${p.nombres} ${p.apellidos}`;
            });

            const medicosMap = {};
            medicosRes.data.forEach(m => {
                medicosMap[m.idMedico] = `Dr. ${m.nombres} ${m.apellidos}`;
            });

            const citasEnriquecidas = citasRes.data.map(cita => ({
                ...cita,
                nombrePaciente: pacientesMap[cita.idPaciente] || 'N/A',
                nombreMedico: medicosMap[cita.idMedico] || 'N/A'
            }));

            setCitas(citasEnriquecidas);
            setLoading(false);
        } catch (error) {
            console.error('Error al cargar citas:', error);
            setMessage('Error al cargar citas');
            setLoading(false);
        }
    };

    const eliminarCita = async (id) => {
        if (window.confirm('¿Seguro que desea eliminar esta cita?')) {
            try {
                await citaService.deleteCita(id);
                setMessage('Cita eliminada correctamente');
                cargarCitas();
            } catch (error) {
                console.error('Error al eliminar cita:', error);
                setMessage('Error al eliminar cita');
            }
        }
    };

    if (loading) {
        return <div className="loading">Cargando citas...</div>;
    }

    return (
        <div className="table-container">
            <div className="page-header">
                <h2>Gestión de Citas</h2>
                <Link to="/citas/nueva" className="btn btn-primary">
                    <FaPlus /> Nueva Cita
                </Link>
            </div>

            {message && (
                <div className={`alert ${message.includes('Error') ? 'alert-error' : 'alert-success'}`}>
                    {message}
                </div>
            )}

            <table>
                <thead>
                <tr>
                    <th>ID</th>
                    <th>PACIENTE</th>
                    <th>MÉDICO</th>
                    <th>FECHA</th>
                    <th>HORA</th>
                    <th>MOTIVO</th>
                    <th>ESTADO</th>
                    <th>ACCIONES</th>
                </tr>
                </thead>
                <tbody>
                {citas.length === 0 ? (
                    <tr>
                        <td colSpan="8" className="no-data">Sin citas registradas.</td>
                    </tr>
                ) : (
                    citas.map((cita) => (
                        <tr key={cita.idCita}>
                            <td>{cita.idCita}</td>
                            <td>{cita.nombrePaciente}</td>
                            <td>{cita.nombreMedico}</td>
                            <td>{cita.fecha}</td>
                            <td>{cita.hora}</td>
                            <td>{cita.motivo}</td>
                            <td>
                                    <span className={`estado-${cita.estado}`}>
                                        {cita.estado}
                                    </span>
                            </td>
                            <td>
                                <div className="action-buttons">
                                    <Link
                                        to={`/citas/editar/${cita.idCita}`}
                                        className="btn btn-warning"
                                    >
                                        <FaEdit />
                                    </Link>
                                    {isAdmin && (
                                        <button
                                            onClick={() => eliminarCita(cita.idCita)}
                                            className="btn btn-danger"
                                        >
                                            <FaTrash />
                                        </button>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))
                )}
                </tbody>
            </table>
        </div>
    );
};

export default CitaList;
