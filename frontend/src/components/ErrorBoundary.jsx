import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import { ErrorOutline as ErrorIcon } from '@mui/icons-material';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', minHeight: '400px' }}>
          <Paper sx={{ p: 5, textAlign: 'center', maxWidth: 500 }}>
            <ErrorIcon color="error" sx={{ fontSize: 60, mb: 2 }} />
            <Typography variant="h5" color="error" gutterBottom>
              Something went wrong while loading this module.
            </Typography>
            <Typography color="textSecondary" sx={{ mb: 4 }}>
              {this.state.error?.toString() || 'An unexpected error occurred.'}
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
              <Button variant="outlined" onClick={() => window.history.back()}>
                Go Back
              </Button>
              <Button variant="contained" onClick={() => window.location.reload()}>
                Retry
              </Button>
            </Box>
          </Paper>
        </Box>
      );
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;
