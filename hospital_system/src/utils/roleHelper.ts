// src/utils/roleHelper.ts

export const ROLES = {
    ADMIN: 'ROLE_ADMIN',
    DOCTOR: 'ROLE_DOCTOR',
    RECEPCIONISTA: 'ROLE_RECEPCIONISTA'
};

export const getUserRoles = (): string[] => {
    const rolesString = localStorage.getItem('roles');
    if (!rolesString) return [];
    try {
        return JSON.parse(rolesString);
    } catch {
        return [];
    }
};

export const hasRole = (role: string): boolean => {
    const roles = getUserRoles();
    return roles.includes(role);
};

export const hasAnyRole = (allowedRoles: string[]): boolean => {
    const userRoles = getUserRoles();
    return allowedRoles.some(role => userRoles.includes(role));
};

export const getModulePermissions = () => {
    const roles = getUserRoles();

    const permissions = {
        pacientes: false,
        citas: false,
        medicos: false,
        consultas: false,
        facturas: false,
        especialidades: false
    };

    // Admin puede ver TODO
    if (roles.includes(ROLES.ADMIN)) {
        return {
            pacientes: true,
            citas: true,
            medicos: true,
            consultas: true,
            facturas: true,
            especialidades: true
        };
    }

    // Doctor puede ver pacientes, citas y consultas
    if (roles.includes(ROLES.DOCTOR)) {
        permissions.pacientes = true;
        permissions.citas = true;
        permissions.consultas = true;
    }

    // Recepcionista puede ver pacientes y citas
    if (roles.includes(ROLES.RECEPCIONISTA)) {
        permissions.pacientes = true;
        permissions.citas = true;
    }

    return permissions;
};

export const getRoleName = (): string => {
    const roles = getUserRoles();
    if (roles.includes(ROLES.ADMIN)) return 'Admin';
    if (roles.includes(ROLES.DOCTOR)) return 'Doctor';
    if (roles.includes(ROLES.RECEPCIONISTA)) return 'Recepcionista';
    return 'Usuario';
};
