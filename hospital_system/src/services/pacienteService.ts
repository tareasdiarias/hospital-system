import api from './api';

const pacienteService = {
    // ⭐ Métodos con nombres consistentes
    getAllPacientes: async () => {
        return await api.get('/pacientes');
    },

    getPacienteById: async (id: number) => {
        return await api.get(`/pacientes/${id}`);
    },

    getPacienteByDni: async (dni: string) => {
        return await api.get(`/pacientes/dni/${dni}`);
    },

    createPaciente: async (paciente: any) => {
        return await api.post('/pacientes', paciente);
    },

    updatePaciente: async (id: number, paciente: any) => {
        return await api.put(`/pacientes/${id}`, paciente);
    },

    deletePaciente: async (id: number) => {
        return await api.delete(`/pacientes/${id}`);
    },

    // Historia Clínica
    getHistoriaClinica: async (idPaciente: number) => {
        return await api.get(`/pacientes/${idPaciente}/historia-clinica`);
    },

    // Antecedentes Médicos
    getAntecedentes: async (idHistoria: number) => {
        return await api.get(`/pacientes/historia/${idHistoria}/antecedentes`);
    },

    addAntecedente: async (idHistoria: number, antecedente: any) => {
        return await api.post(`/pacientes/historia/${idHistoria}/antecedentes`, antecedente);
    },

    // ⭐ ALIAS para compatibilidad (mantener código antiguo funcionando)
    getAll: async () => pacienteService.getAllPacientes(),
    getById: async (id: number) => pacienteService.getPacienteById(id),
    getByDni: async (dni: string) => pacienteService.getPacienteByDni(dni),
    create: async (paciente: any) => pacienteService.createPaciente(paciente),
    update: async (id: number, paciente: any) => pacienteService.updatePaciente(id, paciente),
    delete: async (id: number) => pacienteService.deletePaciente(id),
};

export default pacienteService;
