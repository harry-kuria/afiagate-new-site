import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Avatar,
  Chip,
  Rating,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  Person,
  LocalHospital,
  Schedule,
  LocationOn,
  Phone,
  Email,
  Emergency,
  CalendarToday,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { connectApiService } from '../services/connectApi';
import EnhancedBookingForm from '../components/Booking/EnhancedBookingForm';

const BookingPage: React.FC = () => {
  const { user } = useAuth();
  const [providers, setProviders] = useState<any[]>([]);
  const [facilities, setFacilities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookingFormOpen, setBookingFormOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<any>(null);
  const [selectedFacility, setSelectedFacility] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [providersRes, facilitiesRes] = await Promise.all([
        connectApiService.getDoctors(),
        connectApiService.getFacilities()
      ]);
      
      setProviders(providersRes.data || []);
      setFacilities(facilitiesRes.data || []);
    } catch (err) {
      setError('Failed to load healthcare providers and facilities');
    } finally {
      setLoading(false);
    }
  };

  const handleBookAppointment = (provider?: any, facility?: any) => {
    setSelectedProvider(provider);
    setSelectedFacility(facility);
    setBookingFormOpen(true);
  };


  const getAvailabilityStatus = (provider: any) => {
    if (provider.is_available) {
      return <Chip label="Available" color="success" size="small" />;
    }
    return <Chip label="Busy" color="warning" size="small" />;
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" height="400px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography variant="h3" sx={{ fontWeight: 700, mb: 2 }}>
          Book an Appointment
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Choose your healthcare provider and book your appointment
        </Typography>
      </Box>

      {/* Quick Stats */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 6 }}>
        <Box sx={{ flex: '1 1 250px', minWidth: 0 }}>
          <Card sx={{ textAlign: 'center', p: 3 }}>
            <Person sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              {providers.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Healthcare Providers
            </Typography>
          </Card>
        </Box>
        <Box sx={{ flex: '1 1 250px', minWidth: 0 }}>
          <Card sx={{ textAlign: 'center', p: 3 }}>
            <LocalHospital sx={{ fontSize: 48, color: 'secondary.main', mb: 2 }} />
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              {facilities.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Healthcare Facilities
            </Typography>
          </Card>
        </Box>
        <Box sx={{ flex: '1 1 250px', minWidth: 0 }}>
          <Card sx={{ textAlign: 'center', p: 3 }}>
            <Schedule sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              24/7
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Emergency Support
            </Typography>
          </Card>
        </Box>
      </Box>

      {/* Healthcare Providers */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, mb: 3 }}>
          Healthcare Providers
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          {providers.map((provider) => (
            <Box sx={{ flex: '1 1 300px', minWidth: 0 }} key={provider.id}>
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
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ width: 56, height: 56, mr: 2 }}>
                      {provider.full_name?.charAt(0)}
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                        {provider.full_name}
                      </Typography>
                      <Typography variant="body2" color="primary" sx={{ mb: 1 }}>
                        {provider.specialization}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Rating value={provider.rating} readOnly size="small" />
                        <Typography variant="body2" color="text.secondary">
                          ({provider.rating})
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    {getAvailabilityStatus(provider)}
                  </Box>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {provider.experience} years of experience
                  </Typography>

                  <List dense>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemIcon>
                        <Email fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary={provider.email}
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                    {provider.phone_number && (
                      <ListItem sx={{ px: 0 }}>
                        <ListItemIcon>
                          <Phone fontSize="small" />
                        </ListItemIcon>
                        <ListItemText
                          primary={provider.phone_number}
                          primaryTypographyProps={{ variant: 'body2' }}
                        />
                      </ListItem>
                    )}
                  </List>
                </CardContent>

                <Box sx={{ p: 2, pt: 0 }}>
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={() => handleBookAppointment(provider)}
                    disabled={!provider.is_available}
                    startIcon={<CalendarToday />}
                  >
                    {provider.is_available ? (user?.role === 'facility' ? 'Book Appointment' : 'Request Medic') : 'Not Available'}
                  </Button>
                </Box>
              </Card>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Healthcare Facilities */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, mb: 3 }}>
          Healthcare Facilities
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          {facilities.map((facility) => (
            <Box sx={{ flex: '1 1 300px', minWidth: 0 }} key={facility.id}>
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
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <LocalHospital sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                        {facility.name}
                      </Typography>
                      <Typography variant="body2" color="primary" sx={{ mb: 1 }}>
                        {facility.type}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Rating value={facility.rating} readOnly size="small" />
                        <Typography variant="body2" color="text.secondary">
                          ({facility.rating})
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <LocationOn fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {facility.location}
                      </Typography>
                    </Box>
                    {facility.phone_number && (
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Phone fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {facility.phone_number}
                        </Typography>
                      </Box>
                    )}
                  </Box>

                  {facility.specialties && facility.specialties.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        Specialties:
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {facility.specialties.slice(0, 3).map((specialty: string, index: number) => (
                          <Chip
                            key={index}
                            label={specialty}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        ))}
                        {facility.specialties.length > 3 && (
                          <Chip
                            label={`+${facility.specialties.length - 3} more`}
                            size="small"
                            color="default"
                            variant="outlined"
                          />
                        )}
                      </Box>
                    </Box>
                  )}

                  {facility.is_emergency && (
                    <Chip
                      label="Emergency Services"
                      color="error"
                      size="small"
                      icon={<Emergency />}
                      sx={{ mb: 2 }}
                    />
                  )}
                </CardContent>

                <Box sx={{ p: 2, pt: 0 }}>
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={() => handleBookAppointment(null, facility)}
                    startIcon={<CalendarToday />}
                  >
                    Book Appointment
                  </Button>
                </Box>
              </Card>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Enhanced Booking Form */}
      <EnhancedBookingForm
        open={bookingFormOpen}
        onClose={() => setBookingFormOpen(false)}
        providerId={selectedProvider?.id}
        facilityId={selectedFacility?.id}
      />
    </Container>
  );
};

export default BookingPage;
