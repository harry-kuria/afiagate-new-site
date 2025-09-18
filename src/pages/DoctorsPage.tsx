import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  CardActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Avatar,
  Rating,
  Pagination,
  Alert,
  InputAdornment,
  Skeleton,
} from '@mui/material';
import {
  Search as SearchIcon,
  LocationOn as LocationIcon,
  Person as PersonIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { User } from '../types';
import { connectApiService } from '../services/connectApi';

const DoctorsPage: React.FC = () => {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [location, setLocation] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalDoctors, setTotalDoctors] = useState(0);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const specializations = [
    'Cardiology',
    'Dermatology',
    'Neurology',
    'Orthopedics',
    'Pediatrics',
    'Psychiatry',
    'Oncology',
    'Dental',
    'Ophthalmology',
    'General Medicine',
  ];

  const locations = [
    'Nairobi',
    'Mombasa',
    'Kisumu',
    'Nakuru',
    'Eldoret',
    'Thika',
    'Nyeri',
    'Kakamega',
  ];

  const fetchDoctors = useCallback(async () => {
    try {
      if (!isInitialLoad) {
        setLoading(true);
      }
      setError(null);
      
      const response = await connectApiService.getDoctors({
        page,
        limit: 12,
        search: searchTerm || '',
      });
      
      setDoctors(response.data);
      setTotalPages(Math.ceil(response.total / 12));
      setTotalDoctors(response.total);
      setIsInitialLoad(false);
    } catch (err) {
      setError('Failed to fetch doctors. Please try again.');
      console.error('Error fetching doctors:', err);
    } finally {
      setLoading(false);
    }
  }, [page, searchTerm, isInitialLoad]);

  // Preload data on component mount
  useEffect(() => {
    // Preload doctors data immediately
    fetchDoctors();
    
    // Preload next page data in background
    const preloadNextPage = setTimeout(() => {
      if (page < totalPages) {
        connectApiService.getDoctors({
          page: page + 1,
          limit: 12,
          search: searchTerm || '',
        }).catch(() => {}); // Silent preload
      }
    }, 1000);
    
    return () => clearTimeout(preloadNextPage);
  }, []);

  useEffect(() => {
    if (!isInitialLoad) {
      fetchDoctors();
    }
  }, [page, searchTerm, specialization, location, fetchDoctors, isInitialLoad]);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(1);
  };

  const handleSpecializationChange = (event: any) => {
    setSpecialization(event.target.value);
    setPage(1);
  };

  const handleLocationChange = (event: any) => {
    setLocation(event.target.value);
    setPage(1);
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const handleBookAppointment = (doctorId: string) => {
    navigate(`/doctors/${doctorId}`);
  };

  const filteredDoctors = (doctors || []).filter(doctor =>
    doctor.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.specialization?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4 }}>
      {Array.from({ length: 6 }).map((_, index) => (
        <Box key={index} sx={{ flex: '1 1 280px', minWidth: 0 }}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flexGrow: 1, textAlign: 'center', pb: 2 }}>
              <Skeleton variant="circular" width={80} height={80} sx={{ mx: 'auto', mb: 2 }} />
              <Skeleton variant="text" width="60%" height={32} sx={{ mx: 'auto', mb: 1 }} />
              <Skeleton variant="text" width="40%" height={24} sx={{ mx: 'auto', mb: 1 }} />
              <Skeleton variant="text" width="30%" height={20} sx={{ mx: 'auto', mb: 2 }} />
              <Skeleton variant="text" width="50%" height={20} sx={{ mx: 'auto', mb: 2 }} />
              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                <Skeleton variant="rectangular" width={60} height={24} />
                <Skeleton variant="rectangular" width={60} height={24} />
              </Box>
            </CardContent>
            <CardActions sx={{ justifyContent: 'center', pb: 3 }}>
              <Skeleton variant="rectangular" width="100%" height={40} />
            </CardActions>
          </Card>
        </Box>
      ))}
    </Box>
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography variant="h3" sx={{ fontWeight: 700, mb: 2 }}>
          Find Your Doctor
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Connect with experienced healthcare professionals
        </Typography>
      </Box>

      {/* Search and Filters */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
            <TextField
              fullWidth
              placeholder="Search doctors by name or specialization..."
              value={searchTerm}
              onChange={handleSearch}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Box>
          <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
            <FormControl fullWidth>
              <InputLabel>Specialization</InputLabel>
              <Select
                value={specialization}
                label="Specialization"
                onChange={handleSpecializationChange}
              >
                <MenuItem value="">All Specializations</MenuItem>
                {specializations.map((spec) => (
                  <MenuItem key={spec} value={spec}>
                    {spec}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
            <FormControl fullWidth>
              <InputLabel>Location</InputLabel>
              <Select
                value={location}
                label="Location"
                onChange={handleLocationChange}
              >
                <MenuItem value="">All Locations</MenuItem>
                {locations.map((loc) => (
                  <MenuItem key={loc} value={loc}>
                    {loc}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Box>
      </Box>

      {/* Results Summary */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          {loading ? <Skeleton width={120} /> : `${totalDoctors} doctors found`}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {loading ? <Skeleton width={80} /> : `Page ${page} of ${totalPages}`}
        </Typography>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Loading State */}
      {loading && isInitialLoad ? (
        <LoadingSkeleton />
      ) : (
        <>
          {/* Doctors Grid */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4 }}>
            {filteredDoctors.map((doctor) => (
              <Box key={doctor.id} sx={{ flex: '1 1 280px', minWidth: 0 }}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
                    },
                  }}
                >
                  <CardContent sx={{ flexGrow: 1, textAlign: 'center', pb: 2 }}>
                    <Avatar
                      sx={{
                        width: 80,
                        height: 80,
                        mx: 'auto',
                        mb: 2,
                        bgcolor: 'primary.main',
                        fontSize: '2rem',
                      }}
                    >
                      {doctor.full_name.charAt(0)}
                    </Avatar>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                      Dr. {doctor.full_name}
                    </Typography>
                    <Typography variant="body2" color="primary" sx={{ mb: 1 }}>
                      {doctor.specialization}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                      <Rating value={doctor.rating} readOnly size="small" />
                      <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
                        ({doctor.rating})
                      </Typography>
                    </Box>
                    {doctor.location && (
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                        <LocationIcon sx={{ fontSize: 16, color: 'text.secondary', mr: 0.5 }} />
                        <Typography variant="body2" color="text.secondary">
                          {doctor.location}
                        </Typography>
                      </Box>
                    )}
                    {doctor.experience && (
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {doctor.experience} years experience
                      </Typography>
                    )}
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap' }}>
                      {doctor.is_verified && (
                        <Chip
                          label="Verified"
                          size="small"
                          color="success"
                          variant="outlined"
                        />
                      )}
                      {doctor.is_available && (
                        <Chip
                          label="Available"
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      )}
                    </Box>
                  </CardContent>
                  <CardActions sx={{ justifyContent: 'center', pb: 3 }}>
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<ScheduleIcon />}
                      onClick={() => handleBookAppointment(doctor.id)}
                      fullWidth
                    >
                      Book Appointment
                    </Button>
                  </CardActions>
                </Card>
              </Box>
            ))}
          </Box>

          {/* No Results */}
          {filteredDoctors.length === 0 && !loading && (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <PersonIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                No doctors found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Try adjusting your search criteria or filters
              </Typography>
            </Box>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={handlePageChange}
                color="primary"
                size="large"
              />
            </Box>
          )}
        </>
      )}
    </Container>
  );
};

export default DoctorsPage; 