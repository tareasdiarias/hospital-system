import api from './api.js';

const CITA_API = '/citas';

const citaService = {
    // Obtener todas las citas
    getAllCitas: () => api.get(CITA_API),

    // ⭐ Obtener cita por ID (ESTO FALTABA)
    getById: (id) => api.get(`${CITA_API}/${id}`),

    // Obtener citas por paciente
    getCitasByPaciente: (idPaciente) => api.get(`${CITA_API}/paciente/${idPaciente}`),

    // Obtener citas por médico
    getCitasByMedico: (idMedico) => api.get(`${CITA_API}/medico/${idMedico}`),

    // Obtener citas por fecha
    getCitasByFecha: (fecha) => api.get(`${CITA_API}/fecha/${fecha}`),

    // Crear nueva cita
    create: (cita) => api.post(CITA_API, cita),

    // Actualizar cita existente
    update: (id, cita) => api.put(`${CITA_API}/${id}`, cita),

    // Cambiar estado de cita
    cambiarEstado: (id, estado) => api.patch(`${CITA_API}/${id}/estado`, { estado }),

    // Eliminar cita
    delete: (id) => api.delete(`${CITA_API}/${id}`)
};

export default citaService;
