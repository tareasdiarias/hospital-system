// src/services/authService.ts
const API_URL = 'http://localhost:9090/api/auth';

interface LoginResponse {
    token: string;
    username: string;
    roles: string[];
    message: string;
}

export const login = async (username: string, password: string): Promise<LoginResponse> => {
    const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error de autenticación');
    }

    const data: LoginResponse = await response.json();

    // ⭐ Guardar en localStorage
    localStorage.setItem('token', data.token);
    localStorage.setItem('username', data.username);
    localStorage.setItem('roles', JSON.stringify(data.roles));

    return data;
};

export const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('roles');
    window.location.href = '/login';
};

export const getToken = (): string | null => {
    return localStorage.getItem('token');
};

export const getUsername = (): string | null => {
    return localStorage.getItem('username');
};

export const getRoles = (): string[] => {
    const roles = localStorage.getItem('roles');
    return roles ? JSON.parse(roles) : [];
};

export const hasRole = (role: string): boolean => {
    const roles = getRoles();
    return roles.includes(`ROLE_${role.toUpperCase()}`);
};

export const isAuthenticated = (): boolean => {
    return getToken() !== null;
};

export class getUser {
}