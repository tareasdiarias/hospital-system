import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import facturaService from '../../services/facturaService';
import pacienteService from '../../services/pacienteService';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import '../../css/Tables.css';
import '../../css/Components.css';

const FacturaList = () => {
    const [facturas, setFacturas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');

    const roles = JSON.parse(localStorage.getItem('roles') || '[]');
    const isAdmin = roles.includes('ROLE_ADMIN');

    useEffect(() => {
        cargarFacturas();
    }, []);

    const cargarFacturas = async () => {
        try {
            setLoading(true);

            const [facturasRes, pacientesRes] = await Promise.all([
                facturaService.getAll(),
                pacienteService.getAllPacientes()
            ]);

            // Crear mapa de pacientes
            const pacientesMap = new Map();
            pacientesRes.data.forEach(p => {
                pacientesMap.set(p.idPaciente, `${p.nombres} ${p.apellidos}`);
            });

            // Enriquecer facturas con nombres
            const facturasConNombres = facturasRes.data.map(factura => ({
                ...factura,
                nombrePaciente: pacientesMap.get(factura.idPaciente) || 'Sin paciente'
            }));

            setFacturas(facturasConNombres);
            setLoading(false);
        } catch (error) {
            console.error('Error al cargar facturas:', error);
            setMessage('Error al cargar facturas');
            setLoading(false);
        }
    };

    const eliminarFactura = async (id) => {
        if (window.confirm('¿Seguro que desea eliminar esta factura?')) {
            try {
                await facturaService.delete(id);
                setMessage('Factura eliminada correctamente');
                setTimeout(() => setMessage(''), 3000);
                cargarFacturas();
            } catch (error) {
                console.error('Error al eliminar factura:', error);
                setMessage('Error al eliminar factura');
            }
        }
    };

    if (loading) {
        return <div className="loading">Cargando facturas...</div>;
    }

    return (
        <div className="table-container">
            <div className="page-header">
                <h2>Gestión de Facturas</h2>
                <Link to="/facturas/nueva" className="btn btn-primary">
                    <FaPlus /> Nueva Factura
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
                    <th>FECHA EMISIÓN</th>
                    <th>TOTAL S/.</th>
                    <th>ESTADO</th>
                    <th>ACCIONES</th>
                </tr>
                </thead>
                <tbody>
                {facturas.length === 0 ? (
                    <tr>
                        <td colSpan="6" className="no-data">
                            Sin facturas registradas.
                        </td>
                    </tr>
                ) : (
                    facturas.map((factura) => (
                        <tr key={factura.idFactura}>
                            <td>{factura.idFactura}</td>
                            <td>{factura.nombrePaciente}</td>
                            <td>{factura.fechaEmision}</td>
                            <td>{factura.total.toFixed(2)}</td>
                            <td>
                                    <span className={`estado-${factura.estado.toLowerCase()}`}>
                                        {factura.estado}
                                    </span>
                            </td>
                            <td>
                                <div className="action-buttons">
                                    <Link
                                        to={`/facturas/editar/${factura.idFactura}`}
                                        className="btn btn-warning"
                                    >
                                        <FaEdit />
                                    </Link>
                                    {isAdmin && (
                                        <button
                                            onClick={() => eliminarFactura(factura.idFactura)}
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

export default FacturaList;
