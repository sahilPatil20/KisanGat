import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    accessToken: localStorage.getItem('accessToken') || null,
    refreshToken: localStorage.getItem('refreshToken') || null,
    isAuthenticated: !!localStorage.getItem('accessToken'),
    user: null,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setCredentials: (state, action) => {
            state.accessToken = action.payload.accessToken;
            state.refreshToken = action.payload.refreshToken;
            state.isAuthenticated = true;
            localStorage.setItem('accessToken', action.payload.accessToken);
            localStorage.setItem('refreshToken', action.payload.refreshToken);
        },
        logout: (state) => {
            state.accessToken = null;
            state.refreshToken = null;
            state.isAuthenticated = false;
            state.user = null;
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
        },
        setUser: (state, action) => {
            state.user = action.payload;
        },
    },
});

export const { setCredentials, logout, setUser } = authSlice.actions;
export default authSlice.reducer;
