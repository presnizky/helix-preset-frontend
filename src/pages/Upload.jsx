import { CheckCircle, CloudUpload, Delete, Error } from '@mui/icons-material';
import {
    Box,
    Button,
    Card,
    CardContent,
    IconButton,
    LinearProgress,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Typography
} from '@mui/material';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import AuthModal from '../components/AuthModal';

const Upload = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [results, setResults] = useState([]);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Check authentication on component mount
  useEffect(() => {
    if (!isAuthenticated) {
      setAuthModalOpen(true);
    }
  }, [isAuthenticated]);

  const handleFileSelect = (event) => {
    const selectedFiles = Array.from(event.target.files);
    const hlxFiles = selectedFiles.filter(file => 
      file.name.toLowerCase().endsWith('.hlx') || file.name.toLowerCase().endsWith('.hlx')
    );
    
    setFiles(prev => [...prev, ...hlxFiles]);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const droppedFiles = Array.from(event.dataTransfer.files);
    const hlxFiles = droppedFiles.filter(file => 
      file.name.toLowerCase().endsWith('.hlx') || file.name.toLowerCase().endsWith('.hlx')
    );
    
    setFiles(prev => [...prev, ...hlxFiles]);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const uploadFiles = async () => {
    if (files.length === 0) return;

    if (!isAuthenticated) {
      setAuthModalOpen(true);
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setResults([]);

    const uploadResults = [];

    for (let i = 0; i < files.length; i++) {
      try {
        const response = await apiService.uploadPreset(files[i]);
        uploadResults.push({
          file: files[i].name,
          success: true,
          presetId: response.data.preset_id,
          message: response.data.message
        });
      } catch (error) {
        uploadResults.push({
          file: files[i].name,
          success: false,
          error: error.response?.data?.detail || 'Upload failed'
        });
      }

      setUploadProgress(((i + 1) / files.length) * 100);
    }

    setResults(uploadResults);
    setUploading(false);
  };

  const clearResults = () => {
    setResults([]);
    setFiles([]);
    setUploadProgress(0);
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Upload Presets
      </Typography>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Upload .hlx preset files to add them to the database. You can select multiple files at once.
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box
            sx={{
              border: '2px dashed #ccc',
              borderRadius: 2,
              p: 4,
              textAlign: 'center',
              cursor: 'pointer',
              '&:hover': {
                borderColor: 'primary.main',
                backgroundColor: 'action.hover'
              }
            }}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            <CloudUpload sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Drag & drop .hlx files here
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              or click to select files
            </Typography>
            <Button
              variant="contained"
              component="label"
              disabled={uploading}
            >
              Select Files
              <input
                type="file"
                hidden
                multiple
                accept=".hlx,.HLX"
                onChange={handleFileSelect}
              />
            </Button>
          </Box>
        </CardContent>
      </Card>

      {files.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Selected Files ({files.length})
            </Typography>
            <List>
              {files.map((file, index) => (
                <ListItem key={index} divider>
                  <ListItemText primary={file.name} secondary={`${(file.size / 1024).toFixed(1)} KB`} />
                  <IconButton
                    edge="end"
                    onClick={() => removeFile(index)}
                    disabled={uploading}
                  >
                    <Delete />
                  </IconButton>
                </ListItem>
              ))}
            </List>
            
            <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                onClick={uploadFiles}
                disabled={uploading}
              >
                Upload {files.length} file{files.length !== 1 ? 's' : ''}
              </Button>
              <Button
                variant="outlined"
                onClick={clearResults}
                disabled={uploading}
              >
                Clear
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {uploading && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Uploading...
            </Typography>
            <LinearProgress variant="determinate" value={uploadProgress} />
            <Typography variant="body2" sx={{ mt: 1 }}>
              {Math.round(uploadProgress)}% complete
            </Typography>
          </CardContent>
        </Card>
      )}

      {results.length > 0 && (
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Upload Results
              </Typography>
              <Button variant="outlined" onClick={clearResults}>
                Clear Results
              </Button>
            </Box>
            
            <List>
              {results.map((result, index) => (
                <ListItem key={index} divider>
                  <ListItemIcon>
                    {result.success ? (
                      <CheckCircle color="success" />
                    ) : (
                      <Error color="error" />
                    )}
                  </ListItemIcon>
                  <ListItemText
                    primary={result.file}
                    secondary={
                      result.success 
                        ? `Success: ${result.message}` 
                        : `Error: ${result.error}`
                    }
                  />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      )}

      {/* Authentication Modal */}
      <AuthModal 
        open={authModalOpen} 
        onClose={() => {
          setAuthModalOpen(false);
          if (!isAuthenticated) {
            navigate('/search');
          }
        }}
        title="Authentication Required for Upload"
      />
    </Box>
  );
};

export default Upload;
