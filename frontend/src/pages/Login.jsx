import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { axiosPublic } from '../api/axios';
import { setCredentials } from '../store/slices/authSlice';

import {
    Container,
    Box,
    Typography,
    TextField,
    Button,
    Alert,
    CircularProgress
} from '@mui/material';

const loginSchema = z.object({
    username: z.string().min(1, 'Username is required'),
    password: z.string().min(1, 'Password is required'),
});

const Login = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [loginError, setLoginError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data) => {
        setIsLoading(true);
        setLoginError(null);
        try {
            const response = await axiosPublic.post('/auth/login/', data);
            dispatch(setCredentials({
                accessToken: response.data.access,
                refreshToken: response.data.refresh,
            }));
            navigate('/');
        } catch (err) {
            setLoginError('Invalid username or password');
            console.error("Login failed", err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Container component="main" maxWidth="xs">
            <Box
                sx={{
                    marginTop: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <Typography component="h1" variant="h5">
                    KisanGat Admin Login
                </Typography>
                
                <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 1 }}>
                    <TextField
                        margin="normal"
                        fullWidth
                        id="username"
                        label="Username"
                        autoComplete="username"
                        autoFocus
                        {...register('username')}
                        error={!!errors.username}
                        helperText={errors.username?.message}
                    />
                    <TextField
                        margin="normal"
                        fullWidth
                        name="password"
                        label="Password"
                        type="password"
                        id="password"
                        autoComplete="current-password"
                        {...register('password')}
                        error={!!errors.password}
                        helperText={errors.password?.message}
                    />
                    
                    {loginError && (
                        <Alert severity="error" sx={{ mt: 2 }}>
                            {loginError}
                        </Alert>
                    )}
                    
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                        disabled={isLoading}
                    >
                        {isLoading ? <CircularProgress size={24} /> : 'Sign In'}
                    </Button>
                </Box>
            </Box>
        </Container>
    );
};

export default Login;
