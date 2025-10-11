import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import consultaService from '../../services/consultaService';
import pacienteService from '../../services/pacienteService';
import medicoService from '../../services/medicoService';
import citaService from '../../services/citaService';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import '../../css/Tables.css';
import '../../css/Components.css';

const ConsultaList = () => {
    const [consultas, setConsultas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');

    useEffect(() => {
        cargarConsultas();
    }, []);

    const cargarConsultas = async () => {
        try {
            const [consultasRes, pacientesRes, medicosRes, citasRes] = await Promise.all([
                consultaService.getAll(),
                pacienteService.getAllPacientes(),
                medicoService.getAllMedicos(),
                citaService.getAllCitas()
            ]);

            const pacientesMap = new Map();
            pacientesRes.data.forEach(p => {
                pacientesMap.set(p.idPaciente, `${p.nombres} ${p.apellidos}`);
            });

            const medicosMap = new Map();
            medicosRes.data.forEach(m => {
                medicosMap.set(m.idMedico, `Dr. ${m.nombres} ${m.apellidos}`);
            });

            const citasMap = new Map();
            citasRes.data.forEach(c => {
                citasMap.set(c.idCita, c);
            });

            const consultasEnriquecidas = consultasRes.data.map(consulta => {
                const cita = citasMap.get(consulta.idCita) || {};
                return {
                    ...consulta,
                    nombrePaciente: pacientesMap.get(cita.idPaciente) || 'Sin asignar',
                    nombreMedico: medicosMap.get(cita.idMedico) || 'Sin asignar',
                    fecha: cita.fecha || 'N/A',
                    hora: cita.hora || 'N/A',
                    motivo: cita.motivo || 'Sin motivo'
                };
            });

            setConsultas(consultasEnriquecidas);
            setLoading(false);
        } catch (error) {
            setMessage('Error al cargar consultas');
            setLoading(false);
        }
    };

    const eliminarConsulta = async (id) => {
        if (window.confirm('¿Seguro que desea eliminar esta consulta?')) {
            try {
                await consultaService.delete(id);
                setMessage('Consulta eliminada correctamente');
                cargarConsultas();
            } catch (error) {
                setMessage('Error al eliminar consulta');
            }
        }
    };

    if (loading) {
        return <div className="loading">Cargando consultas...</div>;
    }

    return (
        <div className="table-container">
            <div className="page-header">
                <h2>Gestión de Consultas</h2>
                <Link to="/consultas/nueva" className="btn btn-primary">
                    <FaPlus /> Nueva Consulta
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
                    <th>PACIENTE</th>
                    <th>MÉDICO</th>
                    <th>FECHA</th>
                    <th>HORA</th>
                    <th>MOTIVO</th>
                    <th>ACCIONES</th>
                </tr>
                </thead>
                <tbody>
                {consultas.length === 0 ? (
                    <tr>
                        <td colSpan="6" className="no-data">Sin consultas registradas.</td>
                    </tr>
                ) : (
                    consultas.map((consulta) => (
                        <tr key={consulta.idConsulta}>
                            <td>{consulta.nombrePaciente}</td>
                            <td>{consulta.nombreMedico}</td>
                            <td>{consulta.fecha}</td>
                            <td>{consulta.hora}</td>
                            <td>{consulta.motivo}</td>
                            <td>
                                <div className="action-buttons">
                                    <Link to={`/consultas/editar/${consulta.idConsulta}`} className="btn btn-warning">
                                        <FaEdit />
                                    </Link>
                                    <button onClick={() => eliminarConsulta(consulta.idConsulta)} className="btn btn-danger">
                                        <FaTrash />
                                    </button>
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

export default ConsultaList;
