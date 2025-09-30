import React, { useEffect, useRef } from 'react';
import { Button, Box } from '@mui/material';
import { Google } from '@mui/icons-material';

const GoogleAuthButton = ({ onLogin, loading = false }) => {
  const buttonRef = useRef(null);

  useEffect(() => {
    // Load Google Identity Services script
    const loadGoogleScript = () => {
      if (window.google) return Promise.resolve();
      
      return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
    };

  const initializeGoogleAuth = async () => {
    try {
      await loadGoogleScript();
      
      if (window.google && buttonRef.current) {
        const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || import.meta.env.REACT_APP_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID_HERE';
        
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
          use_fedcm_for_prompt: false // Disable FedCM to avoid 403 errors
        });

        // Render the button directly
        window.google.accounts.id.renderButton(buttonRef.current, {
          theme: 'outline',
          size: 'large',
          type: 'standard',
          shape: 'rectangular',
          text: 'signin_with',
          width: 250,
          logo_alignment: 'left'
        });
      }
    } catch (error) {
      console.error('Error loading Google Auth:', error);
    }
  };

    initializeGoogleAuth();
  }, []);

  const handleCredentialResponse = async (response) => {
    try {
      console.log('Google OAuth response received');
      const result = await onLogin(response.credential);
      if (!result.success) {
        console.error('Login failed:', result.error);
        alert('Login failed: ' + result.error);
      } else {
        console.log('Login successful!');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Login error: ' + (error.response?.data?.detail || error.message));
    }
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
      <div ref={buttonRef}></div>
    </Box>
  );
};

export default GoogleAuthButton;
