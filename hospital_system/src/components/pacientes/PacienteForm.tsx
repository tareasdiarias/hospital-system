import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import pacienteService from '../../services/pacienteService';
import '../../css/Forms.css';

const PacienteForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = Boolean(id);

    // ⭐ Verificar rol del usuario
    const roles = JSON.parse(localStorage.getItem('roles') || '[]');
    const isDoctor = roles.includes('ROLE_DOCTOR');
    const canAddPaciente = !isDoctor; // Solo NO-DOCTOR puede agregar

    const [formData, setFormData] = useState({
        dni: '',
        nombres: '',
        apellidos: '',
        fechaNacimiento: '',
        sexo: 'Masculino',
        direccion: '',
        telefono: '',
        correo: ''
    });

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isEdit) {
            cargarPaciente();
        } else {
            setLoading(false);
        }
    }, [id]);

    const cargarPaciente = async () => {
        try {
            const response = await pacienteService.getById(id);
            setFormData(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error al cargar paciente:', error);
            alert('Error al cargar paciente');
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

        // ⭐ Validar si puede agregar pacientes
        if (!canAddPaciente) {
            alert('Los doctores no pueden agregar pacientes. Solo recepcionistas.');
            return;
        }

        try {
            if (isEdit) {
                await pacienteService.update(id, formData);
            } else {
                await pacienteService.create(formData);
            }
            navigate('/pacientes');
        } catch (error) {
            console.error('Error al guardar paciente:', error);
            alert('Error al guardar paciente');
        }
    };

    if (loading) {
        return <div className="loading">Cargando...</div>;
    }

    return (
        <div className="form-container">
            <h2>{isEdit ? 'Editar Paciente' : 'Nuevo Paciente'}</h2>

            {/* ⭐ MENSAJE DE ADVERTENCIA SI ES DOCTOR */}
            {isDoctor && (
                <div className="alert-warning">
                    <i className="fas fa-info-circle"></i>
                    Solo los recepcionistas pueden agregar pacientes.
                </div>
            )}

            <form onSubmit={handleSubmit}>
                {/* DNI y Nombres */}
                <div className="form-row">
                    <div className="form-group">
                        <label>DNI *</label>
                        <input
                            type="text"
                            name="dni"
                            value={formData.dni}
                            onChange={handleChange}
                            className="form-control"
                            required
                            disabled={isDoctor}
                        />
                    </div>
                    <div className="form-group">
                        <label>Nombres *</label>
                        <input
                            type="text"
                            name="nombres"
                            value={formData.nombres}
                            onChange={handleChange}
                            className="form-control"
                            required
                            disabled={isDoctor}
                        />
                    </div>
                </div>

                {/* Apellidos */}
                <div className="form-group">
                    <label>Apellidos *</label>
                    <input
                        type="text"
                        name="apellidos"
                        value={formData.apellidos}
                        onChange={handleChange}
                        className="form-control"
                        required
                        disabled={isDoctor}
                    />
                </div>

                {/* Fecha Nacimiento y Sexo */}
                <div className="form-row">
                    <div className="form-group">
                        <label>Fecha de Nacimiento *</label>
                        <input
                            type="date"
                            name="fechaNacimiento"
                            value={formData.fechaNacimiento}
                            onChange={handleChange}
                            className="form-control"
                            required
                            disabled={isDoctor}
                        />
                    </div>
                    <div className="form-group">
                        <label>Sexo *</label>
                        <select
                            name="sexo"
                            value={formData.sexo}
                            onChange={handleChange}
                            className="form-control"
                            required
                            disabled={isDoctor}
                        >
                            <option value="Masculino">Masculino</option>
                            <option value="Femenino">Femenino</option>
                        </select>
                    </div>
                </div>

                {/* Dirección */}
                <div className="form-group">
                    <label>Dirección</label>
                    <input
                        type="text"
                        name="direccion"
                        value={formData.direccion}
                        onChange={handleChange}
                        className="form-control"
                        disabled={isDoctor}
                    />
                </div>

                {/* Teléfono y Correo */}
                <div className="form-row">
                    <div className="form-group">
                        <label>Teléfono</label>
                        <input
                            type="tel"
                            name="telefono"
                            value={formData.telefono}
                            onChange={handleChange}
                            className="form-control"
                            disabled={isDoctor}
                        />
                    </div>
                    <div className="form-group">
                        <label>Correo</label>
                        <input
                            type="email"
                            name="correo"
                            value={formData.correo}
                            onChange={handleChange}
                            className="form-control"
                            disabled={isDoctor}
                        />
                    </div>
                </div>

                {/* Botones */}
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
                        onClick={() => navigate('/pacientes')}
                    >
                        Cancelar
                    </button>
                </div>
            </form>
        </div>
    );
};

export default PacienteForm;
