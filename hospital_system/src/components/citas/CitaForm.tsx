import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import citaService from '../../services/citaService';
import pacienteService from '../../services/pacienteService';
import medicoService from '../../services/medicoService';
import '../../css/Forms.css';

const CitaForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = Boolean(id);

    // ⭐ Verificar rol del usuario
    const roles = JSON.parse(localStorage.getItem('roles') || '[]');
    const isDoctor = roles.includes('ROLE_DOCTOR');

    // ⭐ Doctor puede EDITAR pero NO CREAR
    const canCreate = !isDoctor; // Solo NO-DOCTOR puede crear
    const canEdit = true; // Todos pueden editar

    const [formData, setFormData] = useState({
        idPaciente: '',
        idMedico: '',
        fecha: '',
        hora: '',
        motivo: '',
        estado: 'activa'
    });

    const [pacientes, setPacientes] = useState([]);
    const [medicos, setMedicos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        cargarDatos();
    }, [id]);

    const cargarDatos = async () => {
        try {
            const [pacientesRes, medicosRes] = await Promise.all([
                pacienteService.getAllPacientes(),
                medicoService.getAllMedicos()
            ]);

            setPacientes(pacientesRes.data);
            setMedicos(medicosRes.data);

            if (isEdit) {
                const response = await citaService.getById(id);
                setFormData(response.data);
            }

            setLoading(false);
        } catch (error) {
            console.error('Error al cargar datos:', error);
            alert('Error al cargar datos');
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // ⭐ Validar si puede crear (solo si NO es edición)
        if (!isEdit && !canCreate) {
            alert('Solo los recepcionistas o administradores pueden crear citas.');
            return;
        }

        try {
            const dataToSend = {
                ...formData,
                idPaciente: parseInt(formData.idPaciente),
                idMedico: parseInt(formData.idMedico)
            };

            if (isEdit) {
                await citaService.update(id, dataToSend);
            } else {
                await citaService.create(dataToSend);
            }
            navigate('/citas');
        } catch (error) {
            console.error('Error al guardar cita:', error);
            alert('Error al guardar cita');
        }
    };

    if (loading) {
        return <div className="loading">Cargando...</div>;
    }

    return (
        <div className="form-container">
            <h2>{isEdit ? 'Editar Cita' : 'Nueva Cita'}</h2>

            {/* ⭐ MENSAJE DE ADVERTENCIA SOLO SI ES CREAR Y ES DOCTOR */}
            {!isEdit && isDoctor && (
                <div className="alert-warning">
                    <i className="fas fa-info-circle"></i>
                    Solo los recepcionistas o administradores pueden crear citas.
                </div>
            )}

            <form onSubmit={handleSubmit}>
                {/* Paciente */}
                <div className="form-group">
                    <label>Paciente (DNI) *</label>
                    <select
                        name="idPaciente"
                        value={formData.idPaciente}
                        onChange={handleChange}
                        className="form-control"
                        required
                        disabled={!isEdit && isDoctor}
                    >
                        <option value="">-- Seleccione un paciente --</option>
                        {pacientes.map(paciente => (
                            <option key={paciente.idPaciente} value={paciente.idPaciente}>
                                {paciente.dni} - {paciente.nombres} {paciente.apellidos}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Médico */}
                <div className="form-group">
                    <label>Médico *</label>
                    <select
                        name="idMedico"
                        value={formData.idMedico}
                        onChange={handleChange}
                        className="form-control"
                        required
                        disabled={!isEdit && isDoctor}
                    >
                        <option value="">-- Seleccione un médico --</option>
                        {medicos.map(medico => (
                            <option key={medico.idMedico} value={medico.idMedico}>
                                Dr. {medico.nombres} {medico.apellidos}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Fecha y Hora */}
                <div className="form-row">
                    <div className="form-group">
                        <label>Fecha *</label>
                        <input
                            type="date"
                            name="fecha"
                            value={formData.fecha}
                            onChange={handleChange}
                            className="form-control"
                            required
                            disabled={!isEdit && isDoctor}
                        />
                    </div>
                    <div className="form-group">
                        <label>Hora *</label>
                        <input
                            type="time"
                            name="hora"
                            value={formData.hora}
                            onChange={handleChange}
                            className="form-control"
                            required
                            disabled={!isEdit && isDoctor}
                        />
                    </div>
                </div>

                {/* Motivo */}
                <div className="form-group">
                    <label>Motivo *</label>
                    <textarea
                        name="motivo"
                        value={formData.motivo}
                        onChange={handleChange}
                        className="form-control"
                        rows="3"
                        required
                        disabled={!isEdit && isDoctor}
                    />
                </div>

                {/* Estado */}
                <div className="form-group">
                    <label>Estado</label>
                    <select
                        name="estado"
                        value={formData.estado}
                        onChange={handleChange}
                        className="form-control"
                        disabled={!isEdit && isDoctor}
                    >
                        <option value="activa">Activa</option>
                        <option value="cancelada">Cancelada</option>
                        <option value="completada">Completada</option>
                    </select>
                </div>

                {/* Botones */}
                <div className="form-actions">
                    <button
                        type="submit"
                        className="btn btn-success"
                        disabled={!isEdit && isDoctor}
                    >
                        Guardar
                    </button>
                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => navigate('/citas')}
                    >
                        Cancelar
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CitaForm;
