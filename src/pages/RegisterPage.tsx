import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Paper,
  InputAdornment,
  IconButton,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    full_name: '',
    phone_number: '',
    email: '',
    password: '',
    confirm_password: '',
    role: 'patient' as 'patient' | 'doctor' | 'nurse' | 'caregiver' | 'facility',
    location: '',
    specialization: '',
    facility_name: '',
    experience: '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleSelectChange = (event: any) => {
    const { name, value } = event.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Full name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (formData.password !== formData.confirm_password) {
      newErrors.confirm_password = 'Passwords do not match';
    }

    if (formData.role === 'facility' && !formData.facility_name.trim()) {
      newErrors.facility_name = 'Facility name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const userData = {
        email: formData.email,
        password: formData.password,
        full_name: formData.full_name,
        phone_number: formData.phone_number || undefined,
        role: formData.role,
        location: formData.location || undefined,
        specialization: formData.specialization || undefined,
        facility_name: formData.facility_name || undefined,
        experience: formData.experience || undefined,
      };

      await register(userData);
      navigate('/');
    } catch (error: any) {
      setErrors({
        submit: error.response?.data?.message || 'Registration failed. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleToggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ maxWidth: 600, mx: 'auto' }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
              Create Account
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Join Afiagate to access healthcare services
            </Typography>
          </Box>

          {errors.submit && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {errors.submit}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              {/* Basic Information */}
              <Box sx={{ flex: '1 1 250px', minWidth: 0 }}>
                <TextField
                  required
                  fullWidth
                  id="full_name"
                  name="full_name"
                  label="Full Name"
                  value={formData.full_name}
                  onChange={handleChange}
                  error={!!errors.full_name}
                  helperText={errors.full_name}
                  sx={{ mb: 2 }}
                />
              </Box>
              <Box sx={{ flex: '1 1 250px', minWidth: 0 }}>
                <TextField
                  fullWidth
                  id="phone_number"
                  name="phone_number"
                  label="Phone Number"
                  value={formData.phone_number}
                  onChange={handleChange}
                  sx={{ mb: 2 }}
                />
              </Box>
              <Box sx={{ flex: '1 1 100%' }}>
                <TextField
                  required
                  fullWidth
                  id="email"
                  name="email"
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  error={!!errors.email}
                  helperText={errors.email}
                  sx={{ mb: 2 }}
                />
              </Box>
              <Box sx={{ flex: '1 1 100%' }}>
                <FormControl fullWidth required>
                  <InputLabel>Role</InputLabel>
                  <Select
                    id="role"
                    name="role"
                    value={formData.role}
                    label="Role"
                    onChange={handleSelectChange}
                  >
                    <MenuItem value="patient">Patient</MenuItem>
                    <MenuItem value="doctor">Doctor</MenuItem>
                    <MenuItem value="nurse">Nurse</MenuItem>
                    <MenuItem value="caregiver">Caregiver</MenuItem>
                    <MenuItem value="facility">Facility</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              {(formData.role === 'doctor' || formData.role === 'nurse') && (
                <>
                  <Box sx={{ flex: '1 1 250px', minWidth: 0 }}>
                    <TextField
                      fullWidth
                      id="specialization"
                      name="specialization"
                      label="Specialization"
                      value={formData.specialization}
                      onChange={handleChange}
                      sx={{ mb: 2 }}
                    />
                  </Box>
                  <Box sx={{ flex: '1 1 250px', minWidth: 0 }}>
                    <TextField
                      fullWidth
                      id="experience"
                      name="experience"
                      label="Years of Experience"
                      value={formData.experience}
                      onChange={handleChange}
                      sx={{ mb: 2 }}
                    />
                  </Box>
                </>
              )}

              {formData.role === 'facility' && (
                <Box sx={{ flex: '1 1 100%' }}>
                  <TextField
                    required
                    fullWidth
                    id="facility_name"
                    name="facility_name"
                    label="Facility Name"
                    value={formData.facility_name}
                    onChange={handleChange}
                    error={!!errors.facility_name}
                    helperText={errors.facility_name}
                    sx={{ mb: 2 }}
                  />
                </Box>
              )}

              <Box sx={{ flex: '1 1 100%' }}>
                <TextField
                  fullWidth
                  id="location"
                  name="location"
                  label="Location"
                  value={formData.location}
                  onChange={handleChange}
                  sx={{ mb: 2 }}
                />
              </Box>

              {/* Password fields */}
              <Box sx={{ flex: '1 1 250px', minWidth: 0 }}>
                <TextField
                  required
                  fullWidth
                  id="password"
                  name="password"
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  error={!!errors.password}
                  helperText={errors.password}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={handleTogglePasswordVisibility}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{ mb: 2 }}
                />
              </Box>
              <Box sx={{ flex: '1 1 250px', minWidth: 0 }}>
                <TextField
                  required
                  fullWidth
                  id="confirm_password"
                  name="confirm_password"
                  label="Confirm Password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirm_password}
                  onChange={handleChange}
                  error={!!errors.confirm_password}
                  helperText={errors.confirm_password}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={handleToggleConfirmPasswordVisibility}
                          edge="end"
                        >
                          {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{ mb: 2 }}
                />
              </Box>
            </Box>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ mt: 3, mb: 2, py: 1.5 }}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>

            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Already have an account?{' '}
                <Button
                  variant="text"
                  color="primary"
                  onClick={() => navigate('/login')}
                  sx={{ textTransform: 'none' }}
                >
                  Sign In
                </Button>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default RegisterPage; 