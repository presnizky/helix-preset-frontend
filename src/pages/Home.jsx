import {
    Alert,
    Box,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Grid,
    Typography
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { apiService } from '../services/api';

const Home = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await apiService.getModelStats();
        setStats(response.data);
      } catch (err) {
        setError('Failed to load statistics');
        console.error('Error fetching stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      <Typography variant="h3" component="h1" gutterBottom align="center">
        Welcome to Helix Preset Search
      </Typography>
      
      <Typography variant="h6" component="p" gutterBottom align="center" color="text.secondary" sx={{ mb: 4 }}>
        Search, upload, and download Line 6 Helix presets
      </Typography>

      {stats && (
        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h4" component="div" color="primary">
                  {stats.total_models}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Helix Models
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h4" component="div" color="primary">
                  {stats.total_presets}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Presets Available
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h4" component="div" color="primary">
                  {stats.avg_models_per_preset}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Avg Models per Preset
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" component="div" color="primary">
                  Ready
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  System Status
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          Quick Actions
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip label="Search Presets" color="primary" />
          <Chip label="Upload .hlx Files" color="secondary" />
          <Chip label="Download Presets" color="default" />
          <Chip label="Browse Models" color="default" />
        </Box>
      </Box>
    </Box>
  );
};

export default Home;
