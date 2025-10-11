import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import pacienteService from '../../services/pacienteService';
import '../../css/Tables.css';
import '../../css/Forms.css';

const HistoriaClinica = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [historia, setHistoria] = useState(null);
    const [antecedentes, setAntecedentes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [nuevoAntecedente, setNuevoAntecedente] = useState({
        tipo: 'alergias',
        descripcion: '',
    });

    // ⭐ NUEVO: Verificar si el usuario es DOCTOR
    const roles = JSON.parse(localStorage.getItem('roles') || '[]');
    const isDoctor = roles.includes('ROLE_DOCTOR');

    useEffect(() => {
        cargarHistoria();
    }, [id]);

    const cargarHistoria = async () => {
        try {
            const response = await pacienteService.getHistoriaClinica(id);
            if (response.data) {
                setHistoria(response.data);
                const antecedentesResp = await pacienteService.getAntecedentes(response.data.idHistoria);
                setAntecedentes(antecedentesResp.data);
            }
            setLoading(false);
        } catch (error) {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNuevoAntecedente({ ...nuevoAntecedente, [name]: value });
    };

    const agregarAntecedente = async (e) => {
        e.preventDefault();
        try {
            await pacienteService.addAntecedente(historia.idHistoria, nuevoAntecedente);
            setNuevoAntecedente({ tipo: 'alergias', descripcion: '' });
            setShowForm(false);
            cargarHistoria();
        } catch (error) {
            console.error('Error al agregar antecedente', error);
        }
    };

    if (loading) {
        return <div className="loading">Cargando historia clínica...</div>;
    }

    if (!historia) {
        return (
            <div className="alert alert-info mb-4">
                No se encontró historia clínica para este paciente.
            </div>
        );
    }

    return (
        <div className="table-container">
            <div className="page-header">
                <h2>Historia Clínica - ID: {historia.idHistoria}</h2>
            </div>

            <p><strong>Fecha Apertura:</strong> {historia.fechaApertura}</p>
            <p><strong>Observaciones:</strong> {historia.observaciones}</p>

            {/* ⭐ BOTÓN: Solo visible para DOCTOR */}
            {isDoctor && (
                <button
                    className="btn btn-primary"
                    onClick={() => setShowForm(!showForm)}
                >
                    {showForm ? 'Cancelar' : 'Agregar Antecedente'}
                </button>
            )}

            {/* ⭐ MENSAJE: Visible para Admin y Recepcionista */}
            {!isDoctor && (
                <div style={{
                    padding: '1rem',
                    background: '#fff3cd',
                    border: '1px solid #ffc107',
                    borderRadius: '8px',
                    color: '#856404',
                    marginBottom: '1rem',
                    marginTop: '1rem'
                }}>
                    ℹ️ Solo los doctores pueden agregar antecedentes médicos.
                </div>
            )}

            {/* ⭐ FORMULARIO: Solo visible si es DOCTOR y showForm es true */}
            {isDoctor && showForm && (
                <form className="form-container" onSubmit={agregarAntecedente}>
                    <div className="form-group">
                        <label>Tipo</label>
                        <select
                            name="tipo"
                            value={nuevoAntecedente.tipo}
                            onChange={handleInputChange}
                            className="form-control"
                        >
                            <option value="alergias">Alergias</option>
                            <option value="enfermedades previas">Enfermedades Previas</option>
                            <option value="cirugías">Cirugías</option>
                            <option value="otros">Otros</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Descripción</label>
                        <textarea
                            name="descripcion"
                            value={nuevoAntecedente.descripcion}
                            onChange={handleInputChange}
                            className="form-control"
                            required
                            rows="4"
                        />
                    </div>

                    <button type="submit" className="btn btn-success">
                        Guardar Antecedente
                    </button>
                </form>
            )}

            <table>
                <thead>
                <tr>
                    <th>ID</th>
                    <th>Tipo</th>
                    <th>Descripción</th>
                </tr>
                </thead>
                <tbody>
                {antecedentes.length === 0 && (
                    <tr>
                        <td colSpan="3" className="no-data">
                            Sin antecedentes médicos registrados.
                        </td>
                    </tr>
                )}
                {antecedentes.map((ant) => (
                    <tr key={ant.idAntecedente}>
                        <td>{ant.idAntecedente}</td>
                        <td>{ant.tipo}</td>
                        <td>{ant.descripcion}</td>
                    </tr>
                ))}
                </tbody>
            </table>

            <button className="btn btn-secondary mt-4" onClick={() => navigate('/pacientes')}>
                Volver a Pacientes
            </button>
        </div>
    );
};

export default HistoriaClinica;
