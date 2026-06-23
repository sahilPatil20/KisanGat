import axios from 'axios';
import store from '../store';
import { logout, setCredentials } from '../store/slices/authSlice';

const API_ROOT = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api').replace(/\/$/, '');
const BASE_URL = `${API_ROOT}/v1`;

export const axiosPrivate = axios.create({
    baseURL: BASE_URL,
    headers: { 'Content-Type': 'application/json' },
});

export const axiosPublic = axios.create({
    baseURL: BASE_URL,
    headers: { 'Content-Type': 'application/json' },
});

axiosPrivate.interceptors.request.use(
    (config) => {
        const token = store.getState().auth.accessToken;
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

axiosPrivate.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                const refreshToken = store.getState().auth.refreshToken;
                const response = await axiosPublic.post('/auth/refresh/', {
                    refresh: refreshToken
                });
                store.dispatch(setCredentials({
                    accessToken: response.data.access,
                    refreshToken: response.data.refresh || refreshToken
                }));
                originalRequest.headers['Authorization'] = `Bearer ${response.data.access}`;
                return axiosPrivate(originalRequest);
            } catch (err) {
                store.dispatch(logout());
                window.location.href = '/login';
                return Promise.reject(err);
            }
        }
        return Promise.reject(error);
    }
);
