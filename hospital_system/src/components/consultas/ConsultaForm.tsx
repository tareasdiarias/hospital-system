import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import consultaService from '../../services/consultaService';
import citaService from '../../services/citaService';
import pacienteService from '../../services/pacienteService';
import medicoService from '../../services/medicoService';
import '../../css/Forms.css';

const ConsultaForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = Boolean(id);

    // ⭐ Verificar rol del usuario
    const roles = JSON.parse(localStorage.getItem('roles') || '[]');
    const isDoctor = roles.includes('ROLE_DOCTOR');
    const canAddConsulta = !isDoctor; // Solo NO-DOCTOR puede agregar

    const [formData, setFormData] = useState({
        idCita: '',
        motivoConsulta: ''
    });

    const [citasConNombres, setCitasConNombres] = useState([]);
    const [citaSeleccionada, setCitaSeleccionada] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        cargarDatos();
    }, [id]);

    const cargarDatos = async () => {
        try {
            const [citasRes, pacientesRes, medicosRes] = await Promise.all([
                citaService.getAllCitas(),
                pacienteService.getAllPacientes(),
                medicoService.getAllMedicos()
            ]);

            const pacientesMap = new Map();
            pacientesRes.data.forEach(p => {
                pacientesMap.set(p.idPaciente, `${p.nombres} ${p.apellidos}`);
            });

            const medicosMap = new Map();
            medicosRes.data.forEach(m => {
                medicosMap.set(m.idMedico, `Dr. ${m.nombres} ${m.apellidos}`);
            });

            const citasConInfo = citasRes.data.map(c => ({
                ...c,
                nombrePaciente: pacientesMap.get(c.idPaciente) || 'Sin paciente',
                nombreMedico: medicosMap.get(c.idMedico) || 'Sin médico',
                label: `${c.fecha} - ${c.hora} | ${pacientesMap.get(c.idPaciente)} con ${medicosMap.get(c.idMedico)}`
            }));

            setCitasConNombres(citasConInfo);

            if (isEdit) {
                const response = await consultaService.getById(id);
                const consulta = response.data;
                const cita = citasConInfo.find(c => c.idCita === consulta.idCita);

                setFormData({
                    idCita: consulta.idCita,
                    motivoConsulta: consulta.motivoConsulta
                });
                setCitaSeleccionada(cita);
            }

            setLoading(false);
        } catch (error) {
            console.error('Error al cargar datos:', error);
            setLoading(false);
        }
    };

    const handleCitaChange = (e) => {
        const idCita = e.target.value;
        const cita = citasConNombres.find(c => c.idCita === parseInt(idCita));

        setFormData({
            ...formData,
            idCita: idCita,
            motivoConsulta: cita?.motivo || formData.motivoConsulta
        });
        setCitaSeleccionada(cita);
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // ⭐ Validar si puede agregar consultas
        if (!canAddConsulta) {
            alert('Solo los recepcionistas pueden agregar consultas');
            return;
        }

        try {
            const dataToSend = {
                idCita: parseInt(formData.idCita),
                motivoConsulta: formData.motivoConsulta
            };

            if (isEdit) {
                await consultaService.update(id, dataToSend);
            } else {
                await consultaService.create(dataToSend);
            }
            navigate('/consultas');
        } catch (error) {
            console.error('Error al guardar consulta:', error);
            alert('Error al guardar la consulta');
        }
    };

    if (loading) {
        return <div className="loading">Cargando...</div>;
    }

    return (
        <div className="form-container">
            <h2>{isEdit ? 'Editar Consulta' : 'Nueva Consulta'}</h2>

            {/* ⭐ MENSAJE DE ADVERTENCIA SI ES DOCTOR */}
            {isDoctor && (
                <div className="alert-warning">
                    <i className="fas fa-info-circle"></i>
                    Solo los recepcionistas pueden agregar consultas.
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Seleccionar Cita *</label>
                    <select
                        name="idCita"
                        value={formData.idCita}
                        onChange={handleCitaChange}
                        className="form-control"
                        required
                        disabled={isDoctor}
                    >
                        <option value="">-- Seleccione una cita --</option>
                        {citasConNombres.map(cita => (
                            <option key={cita.idCita} value={cita.idCita}>
                                {cita.label}
                            </option>
                        ))}
                    </select>
                </div>

                {citaSeleccionada && (
                    <div className="info-box">
                        <div className="form-row">
                            <div className="form-group">
                                <label>Paciente</label>
                                <input
                                    type="text"
                                    value={citaSeleccionada.nombrePaciente}
                                    className="form-control"
                                    readOnly
                                    disabled
                                />
                            </div>
                            <div className="form-group">
                                <label>Médico</label>
                                <input
                                    type="text"
                                    value={citaSeleccionada.nombreMedico}
                                    className="form-control"
                                    readOnly
                                    disabled
                                />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Fecha</label>
                                <input
                                    type="text"
                                    value={citaSeleccionada.fecha}
                                    className="form-control"
                                    readOnly
                                    disabled
                                />
                            </div>
                            <div className="form-group">
                                <label>Hora</label>
                                <input
                                    type="text"
                                    value={citaSeleccionada.hora}
                                    className="form-control"
                                    readOnly
                                    disabled
                                />
                            </div>
                        </div>
                    </div>
                )}

                <div className="form-group">
                    <label>Motivo Consulta *</label>
                    <textarea
                        name="motivoConsulta"
                        value={formData.motivoConsulta}
                        onChange={handleChange}
                        className="form-control"
                        rows="4"
                        placeholder="Ingrese el motivo de la consulta"
                        required
                        disabled={isDoctor}
                    />
                </div>

                <div className="form-actions">
                    <button
                        type="submit"
                        className="btn btn-success"
                        disabled={isDoctor}
                    >
                        Guardar
                    </button>
                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => navigate('/consultas')}
                    >
                        Cancelar
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ConsultaForm;
