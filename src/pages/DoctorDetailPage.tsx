import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Avatar,
  Rating,
  Button,
  TextField,
  Paper,
  Chip,
  CircularProgress,
  Alert,
  Divider,
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  Person as PersonIcon,
  Star as StarIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { DatePicker, TimePicker } from '@mui/x-date-pickers';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { User, CreateAppointmentRequest } from '../types';
import apiService from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const DoctorDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [doctor, setDoctor] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Booking form state
  const [appointmentDate, setAppointmentDate] = useState<Date | null>(null);
  const [appointmentTime, setAppointmentTime] = useState<Date | null>(null);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (id) {
      fetchDoctor();
    }
  }, [id]);

  const fetchDoctor = async () => {
    try {
      setLoading(true);
      const doctorData = await apiService.getDoctorById(id!);
      setDoctor(doctorData);
      setError(null);
    } catch (err) {
      setError('Failed to fetch doctor details. Please try again.');
      console.error('Error fetching doctor:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBookAppointment = async () => {
    if (!appointmentDate || !appointmentTime || !user) {
      return;
    }

    setBookingLoading(true);
    setBookingError(null);

    try {
      const appointmentData: CreateAppointmentRequest = {
        patient_id: user.id,
        provider_id: doctor!.id,
        appointment_date: format(appointmentDate, 'yyyy-MM-dd'),
        appointment_time: format(appointmentTime, 'HH:mm'),
        notes: notes || undefined,
      };

      await apiService.createAppointment(appointmentData);
      setBookingSuccess(true);
      
      // Redirect to appointments page after a short delay
      setTimeout(() => {
        navigate('/appointments');
      }, 2000);
    } catch (err: any) {
      setBookingError(err.response?.data?.message || 'Failed to book appointment. Please try again.');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error || !doctor) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error || 'Doctor not found'}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
        {/* Doctor Information */}
        <Box sx={{ flex: '1 1 600px', minWidth: 0 }}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 3 }}>
                <Avatar
                  sx={{
                    width: 100,
                    height: 100,
                    mr: 3,
                    bgcolor: 'primary.main',
                    fontSize: '2.5rem',
                  }}
                >
                  {doctor.full_name.charAt(0)}
                </Avatar>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                    Dr. {doctor.full_name}
                  </Typography>
                  <Typography variant="h6" color="primary" sx={{ mb: 1 }}>
                    {doctor.specialization}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Rating value={doctor.rating} readOnly size="large" />
                    <Typography variant="body1" sx={{ ml: 1, fontWeight: 600 }}>
                      {doctor.rating}/5
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {doctor.is_verified && (
                      <Chip
                        label="Verified"
                        color="success"
                        variant="outlined"
                        size="small"
                      />
                    )}
                    {doctor.is_available && (
                      <Chip
                        label="Available"
                        color="primary"
                        variant="outlined"
                        size="small"
                      />
                    )}
                  </Box>
                </Box>
              </Box>

              <Divider sx={{ my: 3 }} />

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                {doctor.location && (
                  <Box sx={{ flex: '1 1 200px', minWidth: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <LocationIcon sx={{ color: 'text.secondary', mr: 1 }} />
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        Location
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {doctor.location}
                    </Typography>
                  </Box>
                )}
                {doctor.phone_number && (
                  <Box sx={{ flex: '1 1 200px', minWidth: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <PhoneIcon sx={{ color: 'text.secondary', mr: 1 }} />
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        Contact
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {doctor.phone_number}
                    </Typography>
                  </Box>
                )}
                {doctor.experience && (
                  <Box sx={{ flex: '1 1 200px', minWidth: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <PersonIcon sx={{ color: 'text.secondary', mr: 1 }} />
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        Experience
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {doctor.experience} years
                    </Typography>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Booking Form */}
        <Box sx={{ flex: '1 1 350px', minWidth: 0 }}>
          <Paper elevation={3} sx={{ p: 3, position: 'sticky', top: 20 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              Book Appointment
            </Typography>

            {bookingSuccess && (
              <Alert severity="success" sx={{ mb: 3 }}>
                Appointment booked successfully! Redirecting to appointments page...
              </Alert>
            )}

            {bookingError && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {bookingError}
              </Alert>
            )}

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <DatePicker
                label="Appointment Date"
                value={appointmentDate}
                onChange={(newValue) => setAppointmentDate(newValue)}
                disablePast
                slotProps={{
                  textField: {
                    fullWidth: true,
                    required: true,
                  },
                }}
              />

              <TimePicker
                label="Appointment Time"
                value={appointmentTime}
                onChange={(newValue) => setAppointmentTime(newValue)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    required: true,
                  },
                }}
              />

              <TextField
                fullWidth
                label="Notes (Optional)"
                multiline
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any special requests or notes for the doctor..."
              />

              <Button
                variant="contained"
                size="large"
                startIcon={<ScheduleIcon />}
                onClick={handleBookAppointment}
                disabled={bookingLoading || !appointmentDate || !appointmentTime || !user}
                sx={{ py: 1.5 }}
              >
                {bookingLoading ? 'Booking...' : 'Book Appointment'}
              </Button>

              {!user && (
                <Alert severity="info">
                  Please log in to book an appointment.
                </Alert>
              )}
            </Box>
          </Paper>
        </Box>
      </Box>
    </Container>
  );
};

export default DoctorDetailPage; 