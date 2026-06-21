import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Divider,
  Snackbar,
  Card,
  CardContent,
} from '@mui/material';
import { axiosPrivate } from '../../api/axios';

export default function Profile() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  
  // Profile Form State
  const [profileForm, setProfileForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
  });
  const [profileSubmitting, setProfileSubmitting] = useState(false);
  const [profileError, setProfileError] = useState('');
  
  // Password Form State
  const [passwordForm, setPasswordForm] = useState({
    old_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [passwordSubmitting, setPasswordSubmitting] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await axiosPrivate.get('/profile/');
      setProfile(response.data);
      setProfileForm({
        first_name: response.data.account.first_name || '',
        last_name: response.data.account.last_name || '',
        email: response.data.account.email || '',
      });
    } catch (err) {
      console.error('Failed to fetch profile', err);
      setProfileError('Failed to load profile data.');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileChange = (e) => {
    setProfileForm({ ...profileForm, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
  };

  const submitProfile = async (e) => {
    e.preventDefault();
    setProfileSubmitting(true);
    setProfileError('');
    try {
      await axiosPrivate.put('/profile/', profileForm);
      setToastMessage('Profile updated successfully!');
      fetchProfile();
    } catch (err) {
      console.error('Failed to update profile', err);
      setProfileError('Failed to update profile.');
    } finally {
      setProfileSubmitting(false);
    }
  };

  const submitPassword = async (e) => {
    e.preventDefault();
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setPasswordError('New passwords do not match.');
      return;
    }
    if (passwordForm.new_password.length < 8) {
      setPasswordError('Password must be at least 8 characters long.');
      return;
    }

    setPasswordSubmitting(true);
    setPasswordError('');
    try {
      await axiosPrivate.post('/auth/change-password/', {
        old_password: passwordForm.old_password,
        new_password: passwordForm.new_password
      });
      setToastMessage('Password changed successfully!');
      setPasswordForm({ old_password: '', new_password: '', confirm_password: '' });
    } catch (err) {
      console.error('Failed to change password', err);
      if (err.response?.data?.old_password) {
        setPasswordError('Incorrect current password.');
      } else {
        setPasswordError('Failed to change password. Please check requirements.');
      }
    } finally {
      setPasswordSubmitting(false);
    }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}><CircularProgress /></Box>;

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" mb={3}>Profile</Typography>

      <Grid container spacing={3}>
        {/* Account Information & Dairy Info */}
        <Grid item xs={12} md={6}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>Account Information</Typography>
              <Divider sx={{ mb: 2 }} />
              
              {profileError && <Alert severity="error" sx={{ mb: 2 }}>{profileError}</Alert>}

              <form onSubmit={submitProfile}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField 
                      fullWidth 
                      label="Username" 
                      value={profile?.account?.username || ''} 
                      disabled 
                      variant="filled"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField 
                      fullWidth 
                      label="Role" 
                      value={profile?.account?.role || ''} 
                      disabled 
                      variant="filled"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField 
                      fullWidth 
                      label="First Name" 
                      name="first_name"
                      value={profileForm.first_name} 
                      onChange={handleProfileChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField 
                      fullWidth 
                      label="Last Name" 
                      name="last_name"
                      value={profileForm.last_name} 
                      onChange={handleProfileChange}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField 
                      fullWidth 
                      label="Email" 
                      name="email"
                      type="email"
                      value={profileForm.email} 
                      onChange={handleProfileChange}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button type="submit" variant="contained" color="primary" disabled={profileSubmitting}>
                      {profileSubmitting ? 'Saving...' : 'Update Profile'}
                    </Button>
                  </Grid>
                </Grid>
              </form>

              <Box mt={4}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>Dairy Information (Read-Only)</Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="textSecondary">Dairy Name</Typography>
                    <Typography variant="body1">{profile?.dairy?.dairy_name || 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="textSecondary">Owner Name</Typography>
                    <Typography variant="body1">{profile?.dairy?.owner_name || 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="textSecondary">Phone</Typography>
                    <Typography variant="body1">{profile?.dairy?.phone || 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="textSecondary">GST Number</Typography>
                    <Typography variant="body1">{profile?.dairy?.gst_number || 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="textSecondary">Address</Typography>
                    <Typography variant="body1">{profile?.dairy?.address || 'N/A'}</Typography>
                  </Grid>
                </Grid>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Security Section */}
        <Grid item xs={12} md={6}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>Security</Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Typography variant="subtitle1" fontWeight="bold" mb={2}>Change Password</Typography>
              {passwordError && <Alert severity="error" sx={{ mb: 2 }}>{passwordError}</Alert>}

              <form onSubmit={submitPassword}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField 
                      fullWidth 
                      label="Current Password" 
                      type="password"
                      name="old_password"
                      value={passwordForm.old_password} 
                      onChange={handlePasswordChange}
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField 
                      fullWidth 
                      label="New Password" 
                      type="password"
                      name="new_password"
                      value={passwordForm.new_password} 
                      onChange={handlePasswordChange}
                      required
                      helperText="Minimum 8 characters"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField 
                      fullWidth 
                      label="Confirm New Password" 
                      type="password"
                      name="confirm_password"
                      value={passwordForm.confirm_password} 
                      onChange={handlePasswordChange}
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button type="submit" variant="contained" color="primary" disabled={passwordSubmitting}>
                      {passwordSubmitting ? 'Updating...' : 'Change Password'}
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Snackbar 
        open={!!toastMessage} 
        autoHideDuration={4000} 
        onClose={() => setToastMessage('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setToastMessage('')} severity="success" sx={{ width: '100%' }}>
          {toastMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}
