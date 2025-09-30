import {
    Download,
    Search as SearchIcon
} from '@mui/icons-material';
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Checkbox,
    Chip,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    Grid,
    Pagination,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import MultiSelectDropdown from '../components/MultiSelectDropdown';
import AuthModal from '../components/AuthModal';
import { apiService } from '../services/api';
import { getModelsByType, getModelTypeDisplayName, getModelTypes, sortModelDetailsByType, sortModelDetailsBySignalChain } from '../services/modelsService';
import { useAuth } from '../contexts/AuthContext';

const Search = () => {
  const { isAuthenticated } = useAuth();
  const [searchParams, setSearchParams] = useState({
    query: '',
    author: '',
    tags: '',
    model_ids: [],
    page: 1,
    page_size: 20
  });

  const [results, setResults] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [modelsByType, setModelsByType] = useState({});
  const [orderedModelTypes, setOrderedModelTypes] = useState([]);
  const [selectedModels, setSelectedModels] = useState({});
  const [modelsLoading, setModelsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState(null);
  const [selectedPresets, setSelectedPresets] = useState([]);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  useEffect(() => {
    const fetchModels = async () => {
      try {
        setModelsLoading(true);
        const models = await getModelsByType();
        const orderedTypes = await getModelTypes();
        setModelsByType(models);
        setOrderedModelTypes(orderedTypes);
        
        // Initialize selected models for each type
        const initialSelected = {};
        Object.keys(models).forEach(type => {
          initialSelected[type] = [];
        });
        setSelectedModels(initialSelected);
      } catch (err) {
        console.error('Error fetching models:', err);
        setError('Failed to load model data. Please refresh the page.');
      } finally {
        setModelsLoading(false);
      }
    };

    fetchModels();
  }, []);

  const handleModelSelection = (type, modelIds) => {
    setSelectedModels(prev => ({
      ...prev,
      [type]: modelIds
    }));
  };


  const clearAllSelections = () => {
    const cleared = {};
    Object.keys(selectedModels).forEach(type => {
      cleared[type] = [];
    });
    setSelectedModels(cleared);
  };

  const getSelectedModelIds = () => {
    const allSelectedIds = [];
    Object.values(selectedModels).forEach(modelIds => {
      allSelectedIds.push(...modelIds);
    });
    return allSelectedIds;
  };

  const handleSearch = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Build the new models structure
      const models = [];
      Object.keys(selectedModels).forEach(type => {
        if (selectedModels[type] && selectedModels[type].length > 0) {
          models.push({
            model_type: type,
            model_ids: selectedModels[type]
          });
        }
      });
      
      const searchData = {
        ...searchParams,
        models: models
      };
      
      const response = await apiService.searchPresets(searchData);
      setResults(response.data.results);
      setTotalCount(response.data.total_count);
      setSelectedPresets([]); // Clear selections when new results come in
    } catch (err) {
      setError('Search failed. Please try again.');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = async (event, page) => {
    console.log('Page changed to:', page);
    setSearchParams(prev => ({ ...prev, page }));
    
    // Trigger search with new page
    try {
      setLoading(true);
      setError(null);
      
      // Build models array for search
      const models = [];
      Object.entries(selectedModels).forEach(([type, modelIds]) => {
        if (modelIds && modelIds.length > 0) {
          models.push({
            model_type: type,
            model_ids: modelIds
          });
        }
      });

      const searchData = {
        ...searchParams,
        page,
        models: models
      };
      
      const response = await apiService.searchPresets(searchData);
      setResults(response.data.results);
      setTotalCount(response.data.total_count);
      setSelectedPresets([]); // Clear selections when new results come in
    } catch (err) {
      setError('Search failed. Please try again.');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (preset) => {
    if (!isAuthenticated) {
      setAuthModalOpen(true);
      return;
    }

    try {
      const response = await apiService.downloadPreset(preset.id);
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      // Create filename from preset name (sanitize for filesystem)
      const safeName = preset.name.replace(/[^a-zA-Z0-9_-]/g, '_');
      a.download = `${safeName}.hlx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Download error:', err);
      if (err.response?.status === 401) {
        setAuthModalOpen(true);
      }
    }
  };

  const handleViewDetails = (preset) => {
    setSelectedPreset(preset);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedPreset(null);
  };

  const handlePresetSelection = (presetId, isSelected) => {
    if (isSelected) {
      setSelectedPresets(prev => [...prev, presetId]);
    } else {
      setSelectedPresets(prev => prev.filter(id => id !== presetId));
    }
  };

  const handleSelectAll = () => {
    if (selectedPresets.length === results.length) {
      setSelectedPresets([]);
    } else {
      setSelectedPresets(results.map(preset => preset.id));
    }
  };

  const handleBulkDownload = async () => {
    if (selectedPresets.length === 0) return;
    
    if (!isAuthenticated) {
      setAuthModalOpen(true);
      return;
    }
    
    try {
      const response = await apiService.downloadPresetsBulk(selectedPresets);
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `selected_presets_${selectedPresets.length}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Bulk download error:', err);
      if (err.response?.status === 401) {
        setAuthModalOpen(true);
      } else {
        setError('Bulk download failed. Please try again.');
      }
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)' }}>
      <Box sx={{ py: 4 }}>
        <Typography 
          variant="h3" 
          component="h1" 
          gutterBottom 
          sx={{ 
            textAlign: 'center',
            fontWeight: 700,
            color: '#2c3e50',
            mb: 4
          }}
        >
          Search Presets
        </Typography>

      {/* Basic Search Fields */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Search Query"
                value={searchParams.query}
                onChange={(e) => setSearchParams(prev => ({ ...prev, query: e.target.value }))}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch();
                  }
                }}
                placeholder="Search by name, description, or author"
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Author"
                value={searchParams.author}
                onChange={(e) => setSearchParams(prev => ({ ...prev, author: e.target.value }))}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch();
                  }
                }}
                placeholder="Filter by author"
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Tags"
                value={searchParams.tags}
                onChange={(e) => setSearchParams(prev => ({ ...prev, tags: e.target.value }))}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch();
                  }
                }}
                placeholder="Comma-separated tags"
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Model Selection */}
      <Card sx={{ mb: 3, maxWidth: 1200, mx: 'auto' }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 600, color: '#2c3e50' }}>
              Select Models
            </Typography>
            <Button
              onClick={clearAllSelections}
              size="small"
              variant="outlined"
              sx={{
                borderColor: '#e74c3c',
                color: '#e74c3c',
                fontSize: '0.875rem',
                minWidth: 'auto',
                px: 2,
                '&:hover': {
                  borderColor: '#c0392b',
                  backgroundColor: '#e74c3c',
                  color: 'white',
                }
              }}
            >
              Clear all selections
            </Button>
          </Box>

          {modelsLoading ? (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="100px">
              <CircularProgress />
            </Box>
          ) : (
            <Grid container spacing={2}>
              {orderedModelTypes.map((type) => (
                <Grid item xs={12} sm={6} md={4} key={type}>
                  <Card variant="outlined" sx={{ height: '100%' }}>
                    <CardContent sx={{ p: 2 }}>
                      <Typography 
                        variant="subtitle2" 
                        sx={{ 
                          fontWeight: 600, 
                          mb: 2, 
                          color: '#2c3e50',
                          fontSize: '0.9rem'
                        }}
                      >
                        {getModelTypeDisplayName(type)} ({modelsByType[type].length})
                      </Typography>
                      <MultiSelectDropdown
                        options={modelsByType[type].map(model => ({
                          id: model.id,
                          name: model.name,
                          value: model.id
                        }))}
                        value={selectedModels[type] || []}
                        onChange={(newValue) => handleModelSelection(type, newValue)}
                        placeholder={`Select ${getModelTypeDisplayName(type)} models`}
                        maxHeight={200}
                        maxDisplayItems={2}
                      />
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}

          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
            <Button
              variant="contained"
              startIcon={<SearchIcon />}
              onClick={handleSearch}
              disabled={loading || modelsLoading}
              sx={{ 
                px: 4, 
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 600,
                background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #34495e 0%, #2c3e50 100%)',
                }
              }}
            >
              Search Presets
            </Button>
          </Box>
        </CardContent>
      </Card>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading && (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress />
        </Box>
      )}

      {results.length > 0 && (
        <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography 
              variant="h5" 
              sx={{ 
                fontWeight: 600, 
                color: '#2c3e50'
              }}
            >
              Found {totalCount} presets
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Typography variant="body2" sx={{ color: '#7f8c8d' }}>
                {selectedPresets.length} selected
              </Typography>
              {selectedPresets.length > 0 && (
                <Button
                  variant="outlined"
                  onClick={() => setSelectedPresets([])}
                  sx={{
                    borderColor: '#e74c3c',
                    color: '#e74c3c',
                    '&:hover': {
                      borderColor: '#c0392b',
                      backgroundColor: '#e74c3c',
                      color: 'white',
                    }
                  }}
                >
                  Clear all selections
                </Button>
              )}
              <Button
                variant="contained"
                startIcon={<Download />}
                onClick={handleBulkDownload}
                disabled={selectedPresets.length === 0}
                sx={{
                  background: 'linear-gradient(135deg, #27ae60 0%, #2ecc71 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #2ecc71 0%, #27ae60 100%)',
                  },
                  '&:disabled': {
                    background: '#bdc3c7',
                    color: '#7f8c8d'
                  }
                }}
              >
                {selectedPresets.length === 0 ? 'Select presets to download' : `Download Selected (${selectedPresets.length})`}
              </Button>
            </Box>
          </Box>
          
          <TableContainer 
            component={Paper} 
            sx={{ 
              borderRadius: 2,
              overflow: 'hidden',
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
            }}
          >
            <Table>
              <TableHead>
                <TableRow sx={{ background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)' }}>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedPresets.length === results.length && results.length > 0}
                      indeterminate={selectedPresets.length > 0 && selectedPresets.length < results.length}
                      onChange={handleSelectAll}
                      sx={{
                        color: 'white',
                        '&.Mui-checked': {
                          color: 'white',
                        },
                        '&.MuiCheckbox-indeterminate': {
                          color: 'white',
                        },
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600, width: '20%' }}>Preset Name</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600, width: '15%' }}>Tags</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600, width: '40%' }}>Models & Parameters</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600, width: '10%' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {results.map((preset, index) => (
                  <TableRow 
                    key={preset.id}
                    sx={{ 
                      '&:nth-of-type(odd)': { backgroundColor: '#f8f9fa' },
                      '&:hover': { backgroundColor: '#e9ecef' }
                    }}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedPresets.includes(preset.id)}
                        onChange={(e) => handlePresetSelection(preset.id, e.target.checked)}
                        sx={{
                          color: '#3498db',
                          '&.Mui-checked': {
                            color: '#3498db',
                          },
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle1" fontWeight="600" color="#2c3e50">
                        {preset.name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {preset.tags ? (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {preset.tags.split(',').slice(0, 3).map((tag, index) => (
                            <Chip 
                              key={index} 
                              label={tag.trim()} 
                              size="small" 
                              sx={{ 
                                backgroundColor: '#e74c3c',
                                color: 'white',
                                fontSize: '0.75rem'
                              }}
                            />
                          ))}
                          {preset.tags.split(',').length > 3 && (
                            <Chip 
                              label={`+${preset.tags.split(',').length - 3}`} 
                              size="small" 
                              variant="outlined"
                              sx={{ fontSize: '0.75rem' }}
                            />
                          )}
                        </Box>
                      ) : '-'}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {preset.model_details && sortModelDetailsByType([...preset.model_details])
                          .map((modelDetail, index) => (
                          <Chip 
                            key={index}
                            label={`${modelDetail.model_type}: ${modelDetail.model_name}`}
                            size="small" 
                            variant="outlined"
                            sx={{ 
                              fontSize: '0.75rem',
                              borderColor: '#2c3e50',
                              color: '#2c3e50'
                            }}
                          />
                        ))}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          variant="outlined"
                          onClick={() => handleViewDetails(preset)}
                          size="small"
                          sx={{
                            borderColor: '#2c3e50',
                            color: '#2c3e50',
                            '&:hover': {
                              borderColor: '#34495e',
                              backgroundColor: '#f8f9fa'
                            }
                          }}
                        >
                          View Details
                        </Button>
                        <Button
                          variant="contained"
                          startIcon={<Download />}
                          onClick={() => handleDownload(preset)}
                          size="small"
                          sx={{
                            background: 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)',
                            '&:hover': {
                              background: 'linear-gradient(135deg, #c0392b 0%, #e74c3c 100%)',
                            }
                          }}
                        >
                          Download
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          
          {totalCount > searchParams.page_size && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Pagination
                count={Math.ceil(totalCount / searchParams.page_size)}
                page={searchParams.page}
                onChange={handlePageChange}
                color="primary"
              />
            </Box>
          )}
        </Box>
      )}
      </Box>

      {/* Preset Details Modal */}
      <Dialog 
        open={modalOpen} 
        onClose={handleCloseModal}
        maxWidth="md"
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
          fontWeight: 600
        }}>
          {selectedPreset?.name || 'Preset Details'}
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          {selectedPreset && (
            <Box>
              {/* Basic Info */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 2, color: '#2c3e50', fontWeight: 600 }}>
                  Basic Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" sx={{ color: '#7f8c8d' }}>Author:</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {selectedPreset.author || 'Unknown'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" sx={{ color: '#7f8c8d' }}>Created:</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {new Date(selectedPreset.created_at).toLocaleDateString()}
                    </Typography>
                  </Grid>
                  {selectedPreset.description && (
                    <Grid item xs={12}>
                      <Typography variant="body2" sx={{ color: '#7f8c8d' }}>Description:</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {selectedPreset.description}
                      </Typography>
                    </Grid>
                  )}
                  {selectedPreset.tags && (
                    <Grid item xs={12}>
                      <Typography variant="body2" sx={{ color: '#7f8c8d', mb: 1 }}>Tags:</Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selectedPreset.tags.split(',').map((tag, index) => (
                          <Chip 
                            key={index} 
                            label={tag.trim()} 
                            size="small" 
                            sx={{ 
                              backgroundColor: '#e74c3c',
                              color: 'white',
                              fontSize: '0.75rem'
                            }}
                          />
                        ))}
                      </Box>
                    </Grid>
                  )}
                </Grid>
              </Box>

              <Divider sx={{ my: 3 }} />

              {/* Model Details */}
              <Box>
                <Typography variant="h6" sx={{ mb: 2, color: '#2c3e50', fontWeight: 600 }}>
                  Models & Parameters
                </Typography>
                {selectedPreset.model_details && selectedPreset.model_details.length > 0 ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {sortModelDetailsBySignalChain([...selectedPreset.model_details])
                      .map((modelDetail, index) => (
                      <Card key={index} variant="outlined" sx={{ p: 2 }}>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#2c3e50', mb: 1 }}>
                            {modelDetail.model_type?.toUpperCase()}: {modelDetail.model_name}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <Typography variant="caption" sx={{ color: '#7f8c8d' }}>
                              Signal Chain Position:
                            </Typography>
                            <Chip 
                              label={`DSP${modelDetail.dsp_number} → Pos${modelDetail.position} → Path${modelDetail.path_number}`}
                              size="small"
                              sx={{ 
                                backgroundColor: '#3498db',
                                color: 'white',
                                fontSize: '0.7rem',
                                fontWeight: 600
                              }}
                            />
                          </Box>
                          <Typography variant="caption" sx={{ color: '#7f8c8d' }}>
                            {modelDetail.is_stereo && 'Stereo | '}
                            {modelDetail.has_trails && 'Trails | '}
                            {!modelDetail.is_enabled && 'DISABLED'}
                          </Typography>
                        </Box>
                        
                        {modelDetail.parameter_values && Object.keys(modelDetail.parameter_values).length > 0 && (
                          <Box sx={{ mt: 2 }}>
                            <Typography variant="subtitle2" sx={{ mb: 1, color: '#7f8c8d', fontWeight: 600 }}>
                              Parameters:
                            </Typography>
                            <Table size="small">
                              <TableBody>
                                {Object.entries(modelDetail.parameter_values).map(([param, value]) => (
                                  <TableRow key={param}>
                                    <TableCell sx={{ 
                                      py: 0.5, 
                                      px: 1, 
                                      borderBottom: '1px solid #e9ecef',
                                      width: '50%'
                                    }}>
                                      <Typography variant="body2" sx={{ color: '#7f8c8d' }}>
                                        {param}
                                      </Typography>
                                    </TableCell>
                                    <TableCell sx={{ 
                                      py: 0.5, 
                                      px: 1, 
                                      borderBottom: '1px solid #e9ecef',
                                      width: '50%'
                                    }}>
                                      <Typography variant="body2" sx={{ fontWeight: 500, color: '#2c3e50' }}>
                                        {typeof value === 'number' ? value.toFixed(2) : value}
                                      </Typography>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </Box>
                        )}
                      </Card>
                    ))}
                  </Box>
                ) : (
                  <Typography variant="body2" sx={{ color: '#7f8c8d', fontStyle: 'italic' }}>
                    No model details available
                  </Typography>
                )}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, backgroundColor: '#f8f9fa' }}>
          <Button 
            onClick={handleCloseModal}
            sx={{ 
              color: '#7f8c8d',
              '&:hover': { backgroundColor: '#e9ecef' }
            }}
          >
            Close
          </Button>
          <Button
            variant="contained"
            startIcon={<Download />}
            onClick={() => {
              handleDownload(selectedPreset);
              handleCloseModal();
            }}
            sx={{
              background: 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #c0392b 0%, #e74c3c 100%)',
              }
            }}
          >
            Download Preset
          </Button>
        </DialogActions>
      </Dialog>

      {/* Authentication Modal */}
      <AuthModal 
        open={authModalOpen} 
        onClose={() => setAuthModalOpen(false)}
        title="Authentication Required for Download"
      />
    </Box>
  );
};

export default Search;
