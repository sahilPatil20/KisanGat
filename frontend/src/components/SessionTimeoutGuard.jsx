import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/material';
import { logout } from '../store/slices/authSlice';

const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
const WARNING_TIME_MS = 2 * 60 * 1000; // 2 minutes warning

export default function SessionTimeoutGuard({ children }) {
  const [showWarning, setShowWarning] = useState(false);
  const timeoutRef = useRef(null);
  const warningRef = useRef(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const resetTimers = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (warningRef.current) clearTimeout(warningRef.current);
    setShowWarning(false);

    // Set warning timer (28 minutes)
    warningRef.current = setTimeout(() => {
      setShowWarning(true);
    }, SESSION_TIMEOUT_MS - WARNING_TIME_MS);

    // Set absolute logout timer (30 minutes)
    timeoutRef.current = setTimeout(() => {
      handleLogout();
    }, SESSION_TIMEOUT_MS);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const handleStayLoggedIn = () => {
    resetTimers();
  };

  useEffect(() => {
    // Events to track user activity
    const events = ['mousemove', 'keydown', 'click', 'scroll'];
    
    const activityHandler = () => {
      if (!showWarning) {
        resetTimers();
      }
    };

    events.forEach(event => {
      window.addEventListener(event, activityHandler);
    });

    // Initial timer start
    resetTimers();

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, activityHandler);
      });
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (warningRef.current) clearTimeout(warningRef.current);
    };
  }, [showWarning]);

  return (
    <>
      {children}
      <Dialog open={showWarning} disableEscapeKeyDown>
        <DialogTitle sx={{ bgcolor: 'error.main', color: 'white' }}>Session Timeout Warning</DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Typography>
            Your session will expire in 2 minutes due to inactivity. 
            Do you want to stay logged in?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleLogout} color="inherit">Logout Now</Button>
          <Button onClick={handleStayLoggedIn} variant="contained" color="primary">Stay Logged In</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
