import React, { useState } from 'react';
import {
  Button,
  Menu,
  MenuItem,
  Typography,
  Box,
  Avatar,
  Divider
} from '@mui/material';
import { AccountCircle, Logout } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import AuthModal from './AuthModal';

const UserProfile = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    if (isAuthenticated) {
      setAnchorEl(event.currentTarget);
    } else {
      setAuthModalOpen(true);
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleClose();
  };

  if (!isAuthenticated) {
    return (
      <>
        <Button
          variant="outlined"
          startIcon={<AccountCircle />}
          onClick={handleClick}
          sx={{
            borderColor: 'rgba(255,255,255,0.5)',
            color: 'white',
            '&:hover': {
              borderColor: 'white',
              backgroundColor: 'rgba(255,255,255,0.1)',
            },
          }}
        >
          Sign In
        </Button>
        
        {/* Authentication Modal */}
        <AuthModal 
          open={authModalOpen} 
          onClose={() => setAuthModalOpen(false)}
          title="Sign In Required"
        />
      </>
    );
  }

  return (
    <>
      <Button
        onClick={handleClick}
        sx={{
          color: 'white',
          textTransform: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          '&:hover': {
            backgroundColor: 'rgba(255,255,255,0.1)',
          },
        }}
      >
        <Avatar
          sx={{
            width: 32,
            height: 32,
            backgroundColor: 'rgba(255,255,255,0.2)',
            fontSize: '0.875rem'
          }}
        >
          {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
        </Avatar>
        <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {user?.name || 'User'}
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.8, fontSize: '0.75rem' }}>
            {user?.email}
          </Typography>
        </Box>
      </Button>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: {
            mt: 1,
            minWidth: 200,
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0,0,0,0.15)'
          }
        }}
      >
        <Box sx={{ p: 2, pb: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#2c3e50' }}>
            {user?.name || 'User'}
          </Typography>
          <Typography variant="caption" sx={{ color: '#7f8c8d' }}>
            {user?.email}
          </Typography>
        </Box>
        
        <Divider />
        
        <MenuItem onClick={handleLogout} sx={{ py: 1.5 }}>
          <Logout sx={{ mr: 1.5, fontSize: '1.2rem', color: '#e74c3c' }} />
          <Typography variant="body2" sx={{ color: '#e74c3c' }}>
            Sign Out
          </Typography>
        </MenuItem>
      </Menu>

      {/* Authentication Modal */}
      <AuthModal 
        open={authModalOpen} 
        onClose={() => setAuthModalOpen(false)}
        title="Sign In Required"
      />
    </>
  );
};

export default UserProfile;
