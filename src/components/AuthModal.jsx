import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  Button,
  Divider
} from '@mui/material';
import { AccountCircle, Close } from '@mui/icons-material';
import GoogleAuthButton from './GoogleAuthButton';
import { useAuth } from '../contexts/AuthContext';

const AuthModal = ({ open, onClose, title = "Authentication Required" }) => {
  const { login, logout, user, isAuthenticated, loading } = useAuth();

  const handleGoogleLogin = async (googleToken) => {
    const result = await login(googleToken);
    if (result.success) {
      onClose();
    }
    return result;
  };

  const handleLogout = () => {
    logout();
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: '0 8px 32px rgba(0,0,0,0.15)'
        }
      }}
    >
      <DialogTitle sx={{ 
        background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
        color: 'white',
        fontWeight: 600,
        display: 'flex',
        alignItems: 'center',
        gap: 1
      }}>
        <AccountCircle />
        {title}
      </DialogTitle>
      
      <DialogContent sx={{ p: 3 }}>
        {isAuthenticated ? (
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6" sx={{ mb: 2, color: '#2c3e50' }}>
              Welcome, {user?.name || user?.email}!
            </Typography>
            <Typography variant="body2" sx={{ color: '#7f8c8d', mb: 3 }}>
              You are now authenticated and can access download and upload features.
            </Typography>
            <Button
              variant="outlined"
              onClick={handleLogout}
              sx={{
                borderColor: '#e74c3c',
                color: '#e74c3c',
                '&:hover': {
                  borderColor: '#c0392b',
                  backgroundColor: '#fdf2f2'
                }
              }}
            >
              Sign Out
            </Button>
          </Box>
        ) : (
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6" sx={{ mb: 2, color: '#2c3e50' }}>
              Sign in to continue
            </Typography>
            <Typography variant="body2" sx={{ color: '#7f8c8d', mb: 3 }}>
              You need to be authenticated to download presets or upload new ones.
            </Typography>
            
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
              <GoogleAuthButton onLogin={handleGoogleLogin} loading={loading} />
            </Box>
            
            <Divider sx={{ my: 2 }}>
              <Typography variant="caption" sx={{ color: '#7f8c8d' }}>
                Secure authentication with Google
              </Typography>
            </Divider>
            
            <Typography variant="caption" sx={{ color: '#7f8c8d', display: 'block' }}>
              Your account information is securely handled by Google OAuth.
            </Typography>
          </Box>
        )}
      </DialogContent>
      
      <DialogActions sx={{ p: 3, backgroundColor: '#f8f9fa' }}>
        <Button 
          onClick={onClose}
          startIcon={<Close />}
          sx={{ 
            color: '#7f8c8d',
            '&:hover': { backgroundColor: '#e9ecef' }
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AuthModal;
