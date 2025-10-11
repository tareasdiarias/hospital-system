import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import facturaService from '../../services/facturaService';
import pacienteService from '../../services/pacienteService';
import '../../css/Forms.css';

const FacturaForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = Boolean(id);

    const [formData, setFormData] = useState({
        idPaciente: '',
        fechaEmision: '',
        total: 0,
        estado: 'Pendiente'
    });

    const [pacientes, setPacientes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        cargarDatos();
    }, [id]);

    const cargarDatos = async () => {
        try {
            // Cargar pacientes
            const pacientesRes = await pacienteService.getAllPacientes();
            setPacientes(pacientesRes.data);

            // Si es edición, cargar factura
            if (isEdit) {
                const response = await facturaService.getById(id);
                const factura = response.data;
                setFormData({
                    idPaciente: factura.idPaciente,
                    fechaEmision: factura.fechaEmision,
                    total: factura.total,
                    estado: factura.estado
                });
            } else {
                // Para nueva factura, establecer fecha actual
                const today = new Date().toISOString().split('T')[0];
                setFormData(prev => ({ ...prev, fechaEmision: today }));
            }

            setLoading(false);
        } catch (error) {
            console.error('Error al cargar datos:', error);
            alert('Error al cargar datos');
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: name === 'total' ? parseFloat(value) || 0 : value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const dataToSend = {
                idPaciente: parseInt(formData.idPaciente),
                fechaEmision: formData.fechaEmision,
                total: parseFloat(formData.total),
                estado: formData.estado
            };

            if (isEdit) {
                await facturaService.update(id, dataToSend);
            } else {
                await facturaService.create(dataToSend);
            }
            navigate('/facturas');
        } catch (error) {
            console.error('Error al guardar factura:', error);
            alert('Error al guardar la factura');
        }
    };

    if (loading) {
        return <div className="loading">Cargando...</div>;
    }

    return (
        <div className="form-container">
            <h2>{isEdit ? 'Editar Factura' : 'Nueva Factura'}</h2>

            <form onSubmit={handleSubmit}>
                {/* Selector de Paciente con Nombre */}
                <div className="form-row">
                    <div className="form-group">
                        <label>Paciente *</label>
                        <select
                            name="idPaciente"
                            value={formData.idPaciente}
                            onChange={handleChange}
                            className="form-control"
                            required
                        >
                            <option value="">-- Seleccione un paciente --</option>
                            {pacientes.map(paciente => (
                                <option key={paciente.idPaciente} value={paciente.idPaciente}>
                                    {paciente.nombres} {paciente.apellidos}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Fecha Emisión *</label>
                        <input
                            type="date"
                            name="fechaEmision"
                            value={formData.fechaEmision}
                            onChange={handleChange}
                            className="form-control"
                            required
                        />
                    </div>
                </div>

                {/* Total */}
                <div className="form-group">
                    <label>Total (S/.) *</label>
                    <input
                        type="number"
                        name="total"
                        value={formData.total}
                        onChange={handleChange}
                        className="form-control"
                        step="0.01"
                        min="0"
                        required
                    />
                </div>

                {/* Estado */}
                <div className="form-group">
                    <label>Estado *</label>
                    <select
                        name="estado"
                        value={formData.estado}
                        onChange={handleChange}
                        className="form-control"
                        required
                    >
                        <option value="Pendiente">Pendiente</option>
                        <option value="Pagada">Pagada</option>
                        <option value="Cancelada">Cancelada</option>
                    </select>
                </div>

                {/* Botones */}
                <div className="form-actions">
                    <button type="submit" className="btn btn-success">
                        Guardar
                    </button>
                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => navigate('/facturas')}
                    >
                        Cancelar
                    </button>
                </div>
            </form>
        </div>
    );
};

export default FacturaForm;
