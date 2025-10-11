// src/services/api.ts
import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:9090/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// ⭐ INTERCEPTOR: Agregar token a TODAS las peticiones
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            console.log('✅ Token agregado a:', config.method?.toUpperCase(), config.url);
            console.log('🔑 Token:', token.substring(0, 50) + '...');
        } else {
            console.warn('⚠️ NO HAY TOKEN en localStorage');
        }

        return config;
    },
    (error) => {
        console.error('❌ Error en request interceptor:', error);
        return Promise.reject(error);
    }
);

// ⭐ INTERCEPTOR: Manejar errores 401/403
api.interceptors.response.use(
    (response) => {
        console.log('✅ Respuesta exitosa:', response.status, response.config.url);
        return response;
    },
    (error) => {
        console.error('❌ Error en response:', error.response?.status, error.config?.url);

        if (error.response?.status === 401) {
            console.error('🚫 401 UNAUTHORIZED - Token inválido o expirado');
            console.log('📦 Response data:', error.response?.data);
            console.log('🔄 Redirigiendo al login...');

            localStorage.clear();
            window.location.href = '/login';
        }

        if (error.response?.status === 403) {
            console.error('🚫 403 FORBIDDEN - Sin permisos');
            console.log('📦 Response data:', error.response?.data);
        }

        return Promise.reject(error);
    }
);

export default api;
