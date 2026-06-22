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
        // FIXED: Replaced simple login container with split-screen branded layout
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>
            <Box sx={{
                display: { xs: 'none', md: 'flex' },
                width: '60%',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                p: 6,
                background: 'linear-gradient(135deg, #1E3A8A 0%, #312E81 100%)',
                position: 'relative'
            }}>
                <Box sx={{ textAlign: 'center', maxWidth: 400 }}>
                    <Box sx={{ width: 48, height: 48, borderRadius: '12px', background: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', mb: 2 }}>
                        <Typography sx={{ color: 'white', fontWeight: 'bold', fontSize: 20 }}>KG</Typography>
                    </Box>
                    <Typography sx={{ color: 'white', fontSize: '28px', fontWeight: 800 }}>
                        KisanGat
                    </Typography>
                    <Typography sx={{ fontSize: '14px', color: 'rgba(255,255,255,0.65)', mb: 4 }}>
                        Smart Dairy Management
                    </Typography>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'flex-start', textAlign: 'left' }}>
                        <Typography sx={{ color: 'white', display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box component="span" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 20, height: 20, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.2)' }}>✓</Box>
                            Daily milk collection tracking
                        </Typography>
                        <Typography sx={{ color: 'white', display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box component="span" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 20, height: 20, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.2)' }}>✓</Box>
                            Automated farmer payments
                        </Typography>
                        <Typography sx={{ color: 'white', display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box component="span" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 20, height: 20, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.2)' }}>✓</Box>
                            Real-time inventory & billing
                        </Typography>
                    </Box>
                </Box>
                <Typography sx={{ position: 'absolute', bottom: 32, fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>
                    Trusted by dairy owners across India
                </Typography>
            </Box>

            <Box sx={{
                width: { xs: '100%', md: '40%' },
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                bgcolor: '#FFFFFF',
                p: { xs: 4, sm: 8, md: 6, lg: 8 }
            }}>
                <Box sx={{ maxWidth: 400, width: '100%', mx: 'auto' }}>
                    <Typography sx={{ fontSize: '24px', fontWeight: 800, color: '#0F172A' }}>
                        Welcome back
                    </Typography>
                    <Typography sx={{ fontSize: '13px', color: '#475569', mb: '20px' }}>
                        Sign in to your dairy dashboard
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
                            sx={{
                                mt: 3, mb: 2,
                                background: 'linear-gradient(135deg, #2563EB, #4F46E5)',
                                height: '44px',
                                borderRadius: '8px',
                                fontWeight: 700,
                                textTransform: 'none'
                            }}
                            disabled={isLoading}
                        >
                            {isLoading ? <CircularProgress size={18} color="inherit" /> : 'Sign In'}
                        </Button>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
};

export default Login;
