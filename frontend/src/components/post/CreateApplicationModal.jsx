"use client";
import React, { useState } from 'react';
import {
  Button, TextField, IconButton, Typography, Box, Paper, Modal,
  Snackbar, Alert, MenuItem, LinearProgress, FormControl, InputLabel, Select, Chip
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';

const VIOLET_PRIMARY = '#8b5cf6';
const TEXT_SECONDARY = '#94a3b8';
const PAPER_BG = '#1e293b';
const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1MB
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

const INDUSTRIES = [
  'Technology', 'Finance', 'Healthcare', 'Consulting',
  'Manufacturing', 'Retail', 'Education', 'Other'
];

const DEPARTMENTS = [
  'CSE', 'IT', 'AIML', 'ECE', 'EEE', 'CIVIL', 'MECH', 'MBA', 'MCA'
];



const MediaPreview = ({ file, onDelete, preview }) => {
  const sizeMB = (file.size / (1024 * 1024)).toFixed(2);

  return (
    <Box sx={{
      display: 'flex',
      alignItems: 'center',
      gap: 2,
      p: 2,
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      borderRadius: '8px',
      border: `1px solid rgba(139, 92, 246, 0.3)`,
    }}>
      {preview ? (
        <Box
          component="img"
          src={preview}
          alt="Preview"
          sx={{
            width: 60,
            height: 60,
            borderRadius: '8px',
            objectFit: 'cover',
          }}
        />
      ) : (
        <InsertDriveFileIcon sx={{ color: VIOLET_PRIMARY, fontSize: 32 }} />
      )}

      <Box sx={{ flex: 1 }}>
        <Typography variant="body2" sx={{ color: 'white', fontWeight: 500 }}>
          {file.name}
        </Typography>
        <Typography variant="caption" sx={{ color: TEXT_SECONDARY }}>
          {sizeMB} MB
        </Typography>
      </Box>

      <IconButton size="small" onClick={onDelete} sx={{ color: '#EF4444' }}>
        <DeleteIcon sx={{ fontSize: 20 }} />
      </IconButton>
    </Box>
  );
};

export const CreateApplicationModal = ({ open, onClose }) => {
  const [formData, setFormData] = useState({
    company_name: '',
    position: '',
    industry: '',
    package_offered: '',
    deadline: '',
    notes: '',
    target_departments: [],
  });
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDepartmentChange = (event) => {
    const { value } = event.target;
    setFormData(prev => ({ ...prev, target_departments: value }));
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      setErrorMsg('File must be an image (JPG, PNG, GIF, WebP)');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setErrorMsg('File size exceeds 1MB limit');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setMediaPreview(reader.result);
    };
    reader.readAsDataURL(file);

    setMediaFile(file);
    e.target.value = '';
  };

  const removeMediaFile = () => {
    setMediaFile(null);
    setMediaPreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);
    setUploadProgress(0);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setErrorMsg('You must be logged in');
        setLoading(false);
        return;
      }

      // Prepare data
      const payload = {
        ...formData,
        application_date: new Date().toISOString().split('T')[0], // Set current date automatically
        application_deadline: formData.deadline, // Map deadline to application_deadline
        media: mediaPreview // Save base64 encoded image
      };

      // Remove empty optional fields and the old deadline field
      Object.keys(payload).forEach(key => {
        if (!payload[key] || payload[key] === '') {
          delete payload[key];
        }
      });
      delete payload.deadline; // Remove the old deadline field

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000'}/api/posts/applications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (result.ok) {
        setSuccessMsg('Application posted successfully!');

        // Reset form
        setFormData({
          company_name: '',
          position: '',
          industry: '',
          package_offered: '',
          deadline: '',
          notes: '',
          target_departments: [],
        });
        setMediaFile(null);
        setMediaPreview(null);

        setTimeout(() => {
          onClose();
          setSuccessMsg('');
        }, 2000);
      } else {
        setErrorMsg(result.error || 'Failed to post application');
      }
    } catch (error) {
      console.error('Error:', error);
      setErrorMsg('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', p: { xs: 2, sm: 4 } }}
      >
        <Paper
          elevation={11}
          sx={{
            width: 'min(92vw, 700px)',
            p: { xs: 4, sm: 5 },
            backgroundColor: PAPER_BG,
            boxShadow: '0 10px 30px 10px rgba(0, 0, 0, 0.6)',
            border: `2px solid rgba(255, 255, 255, 0.08)`,
            color: 'white',
            maxHeight: '90vh',
            overflowY: 'auto',
            borderRadius: '16px',
          }}
        >
          <Typography variant="h5" component="h2" sx={{ color: VIOLET_PRIMARY, fontWeight: 700, mb: 4 }}>
            Post New Opportunity
          </Typography>

          <form onSubmit={handleSubmit}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>

              <TextField
                fullWidth
                label="Company Name"
                name="company_name"
                required
                value={formData.company_name}
                onChange={handleInputChange}
                disabled={loading}
                InputLabelProps={{ shrink: true, sx: { color: 'white' } }}
                inputProps={{ maxLength: 30 }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    color: 'white'
                  }
                }}
              />

              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <TextField
                  fullWidth
                  label="Position"
                  name="position"
                  required
                  value={formData.position}
                  onChange={handleInputChange}
                  disabled={loading}
                  InputLabelProps={{ shrink: true, sx: { color: 'white' } }}
                  inputProps={{ maxLength: 30 }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px', backgroundColor: 'rgba(255, 255, 255, 0.05)', color: 'white' } }}
                />
                <TextField
                  fullWidth
                  select
                  label="Industry"
                  name="industry"
                  required
                  value={formData.industry}
                  onChange={handleInputChange}
                  disabled={loading}
                  InputLabelProps={{ shrink: true, sx: { color: 'white' } }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px', backgroundColor: 'rgba(255, 255, 255, 0.05)', color: 'white' } }}
                >
                  {INDUSTRIES.map((option) => (
                    <MenuItem key={option} value={option}>{option}</MenuItem>
                  ))}
                </TextField>
              </Box>



              <FormControl fullWidth disabled={loading}>
                <Select
                  multiple
                  value={formData.target_departments}
                  onChange={handleDepartmentChange}
                  displayEmpty
                  renderValue={(selected) => {
                    if (selected.length === 0) {
                      return <span style={{ color: '#94a3b8' }}>Target Departments</span>;
                    }
                    return (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => (
                          <Chip key={value} label={value} sx={{ backgroundColor: VIOLET_PRIMARY, color: 'white' }} />
                        ))}
                      </Box>
                    );
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '8px',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      color: 'white'
                    }
                  }}
                >
                  {DEPARTMENTS.map((dept) => (
                    <MenuItem key={dept} value={dept}>
                      {dept}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                fullWidth
                label="Package Offered (in Lakhs)"
                name="package_offered"
                type="text"
                value={formData.package_offered}
                onChange={handleInputChange}
                disabled={loading}
                InputLabelProps={{ shrink: true, sx: { color: 'white' } }}
                inputProps={{ maxLength: 30 }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px', backgroundColor: 'rgba(255, 255, 255, 0.05)', color: 'white' } }}
              />

              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 2 }}>
                <TextField
                  fullWidth
                  label="Deadline Date and Time"
                  name="deadline"
                  type="datetime-local"
                  value={formData.deadline}
                  onChange={handleInputChange}
                  disabled={loading}
                  InputLabelProps={{ shrink: true, sx: { color: 'white' } }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px', backgroundColor: 'rgba(255, 255, 255, 0.05)', color: 'white' } }}
                />
              </Box>

              <TextField
                fullWidth
                label="Additional Notes"
                name="notes"
                multiline
                rows={3}
                value={formData.notes}
                onChange={handleInputChange}
                disabled={loading}
                InputLabelProps={{ shrink: true, sx: { color: 'white' } }}
                inputProps={{ maxLength: 150 }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px', backgroundColor: 'rgba(255, 255, 255, 0.05)', color: 'white' } }}
              />

              <Box sx={{ mt: 1 }}>
                <Typography variant="body1" component="h3" sx={{ color: 'white', fontWeight: 600, mb: 2 }}>
                  Upload Poster/Media (Optional)
                </Typography>

                <Paper
                  elevation={0}
                  sx={{
                    p: 4,
                    borderRadius: '12px',
                    border: '2px dashed',
                    borderColor: 'rgba(139, 92, 246, 0.4)',
                    backgroundColor: 'rgba(139, 92, 246, 0.05)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      borderColor: VIOLET_PRIMARY,
                      backgroundColor: 'rgba(139, 92, 246, 0.1)',
                    }
                  }}
                >
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    disabled={loading || mediaFile}
                    style={{ display: 'none' }}
                    id="media-input"
                  />
                  <label htmlFor="media-input" style={{ cursor: loading || mediaFile ? 'not-allowed' : 'pointer', display: 'block' }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <CloudUploadIcon sx={{ fontSize: 48, color: VIOLET_PRIMARY, mb: 1 }} />
                      <Typography variant="body2" sx={{ color: 'white', mb: 0.5 }}>
                        Click to upload image
                      </Typography>
                      <Typography variant="caption" sx={{ color: TEXT_SECONDARY }}>
                        Images only (JPG, PNG, GIF, WebP) - Max 1MB
                      </Typography>
                    </Box>
                  </label>
                </Paper>

                {mediaFile && (
                  <Box sx={{ mt: 2 }}>
                    <MediaPreview
                      file={mediaFile}
                      preview={mediaPreview}
                      onDelete={removeMediaFile}
                    />
                  </Box>
                )}
              </Box>

              {loading && uploadProgress > 0 && (
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="caption" sx={{ color: TEXT_SECONDARY }}>
                      Uploading...
                    </Typography>
                    <Typography variant="caption" sx={{ color: VIOLET_PRIMARY }}>
                      {Math.round(uploadProgress)}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={uploadProgress}
                    sx={{
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: VIOLET_PRIMARY,
                      }
                    }}
                  />
                </Box>
              )}

              <Box sx={{ pt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2, borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
                <Button
                  variant="text"
                  onClick={onClose}
                  disabled={loading}
                  sx={{ color: TEXT_SECONDARY, textTransform: 'none', fontWeight: 'bold' }}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  type="submit"
                  disabled={loading}
                  sx={{
                    backgroundColor: VIOLET_PRIMARY,
                    '&:hover': { backgroundColor: '#6D28D9' },
                    '&:disabled': { backgroundColor: '#4b3491' },
                    textTransform: 'none',
                    fontWeight: 'bold',
                    padding: '8px 24px',
                    borderRadius: '8px',
                  }}
                >
                  {loading ? 'Posting...' : 'Post Opportunity'}
                </Button>
              </Box>

            </Box>
          </form>
        </Paper>
      </Modal>

      <Snackbar
        open={!!successMsg}
        autoHideDuration={3000}
        onClose={() => setSuccessMsg('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" onClose={() => setSuccessMsg('')}>
          {successMsg}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!errorMsg}
        autoHideDuration={5000}
        onClose={() => setErrorMsg('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="error" onClose={() => setErrorMsg('')}>
          {errorMsg}
        </Alert>
      </Snackbar>
    </>
  );
};
