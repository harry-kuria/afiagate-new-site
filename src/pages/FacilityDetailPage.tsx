import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Chip,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  LocationOn,
  Phone,
  Schedule,
  Star,
  Emergency,
  LocalHospital,
  Directions,
  Share,
  Favorite,
  FavoriteBorder,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { connectApiService } from '../services/connectApi';
import { useAuth } from '../contexts/AuthContext';

interface Facility {
  id: string;
  name: string;
  type: string;
  location: string;
  distance?: string;
  rating: number;
  services: string[];
  phone_number?: string;
  operating_hours?: string;
  specialties: string[];
  is_emergency: boolean;
  description?: string;
  available_services?: Array<{
    id: string;
    name: string;
    description: string;
    duration: string;
    price: string;
  }>;
}

const FacilityDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [facility, setFacility] = useState<Facility | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  
  // Contact form state
  const [contactForm, setContactForm] = useState({
    name: user?.full_name || '',
    email: user?.email || '',
    phone: user?.phone_number || '',
    subject: '',
    message: '',
    preferredContact: 'phone',
  });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (id) {
      loadFacility();
    }
  }, [id]);

  const loadFacility = async () => {
    try {
      setLoading(true);
      setError(null);
      const facilityData = await connectApiService.getFacilityById(id!);
      setFacility(facilityData);
    } catch (err) {
      setError('Failed to load facility details');
      console.error('Facility loading error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleContactHospital = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setContactDialogOpen(true);
  };

  const handleContactSubmit = async () => {
    try {
      // In a real implementation, this would send an email or create a contact request
      console.log('Contact form submitted:', contactForm);
      setContactDialogOpen(false);
      // Show success message
      alert('Your message has been sent to the hospital. They will contact you soon.');
    } catch (err) {
      console.error('Contact submission error:', err);
    }
  };

  const handleGetDirections = () => {
    if (facility?.location) {
      const encodedLocation = encodeURIComponent(facility.location);
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodedLocation}`, '_blank');
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: facility?.name,
        text: `Check out ${facility?.name} - ${facility?.type}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    // In a real implementation, this would save to user preferences
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error || !facility) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">{error || 'Facility not found'}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography variant="h4" gutterBottom>
              {facility.name}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
              <Chip label={facility.type} color="primary" variant="outlined" />
              {facility.is_emergency && (
                <Chip
                  label="Emergency Services"
                  color="error"
                  icon={<Emergency />}
                />
              )}
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}>
              <IconButton onClick={toggleFavorite}>
                {isFavorite ? <Favorite color="error" /> : <FavoriteBorder />}
              </IconButton>
            </Tooltip>
            <Tooltip title="Share">
              <IconButton onClick={handleShare}>
                <Share />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Star sx={{ color: 'orange', mr: 0.5 }} />
            <Typography variant="h6">{facility.rating}</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <LocationOn sx={{ mr: 0.5, color: 'text.secondary' }} />
            <Typography variant="body1" color="text.secondary">
              {facility.location}
            </Typography>
          </Box>
          {facility.distance && (
            <Typography variant="body2" color="text.secondary">
              {facility.distance} km away
            </Typography>
          )}
        </Box>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
        {/* Main Content */}
        <Box sx={{ flex: 2 }}>
          {/* Description */}
          {facility.description && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  About {facility.name}
                </Typography>
                <Typography variant="body1">
                  {facility.description}
                </Typography>
              </CardContent>
            </Card>
          )}

          {/* Services */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Services Offered
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {facility.services.map((service, index) => (
                  <Chip key={index} label={service} variant="outlined" />
                ))}
              </Box>
            </CardContent>
          </Card>

          {/* Specialties */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Specialties
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {facility.specialties.map((specialty, index) => (
                  <Chip key={index} label={specialty} color="primary" variant="outlined" />
                ))}
              </Box>
            </CardContent>
          </Card>

          {/* Available Services */}
          {facility.available_services && facility.available_services.length > 0 && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Available Services
                </Typography>
                <List>
                  {facility.available_services.map((service) => (
                    <ListItem key={service.id} divider>
                      <ListItemIcon>
                        <LocalHospital />
                      </ListItemIcon>
                      <ListItemText
                        primary={service.name}
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              {service.description}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                              <Typography variant="body2">
                                Duration: {service.duration}
                              </Typography>
                              <Typography variant="body2" color="primary">
                                Price: {service.price}
                              </Typography>
                            </Box>
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          )}
        </Box>

        {/* Sidebar */}
        <Box sx={{ flex: 1, minWidth: 300 }}>
          {/* Contact Information */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Contact Information
              </Typography>
              <List>
                {facility.phone_number && (
                  <ListItem>
                    <ListItemIcon>
                      <Phone />
                    </ListItemIcon>
                    <ListItemText
                      primary="Phone"
                      secondary={facility.phone_number}
                    />
                  </ListItem>
                )}
                <ListItem>
                  <ListItemIcon>
                    <LocationOn />
                  </ListItemIcon>
                  <ListItemText
                    primary="Address"
                    secondary={facility.location}
                  />
                </ListItem>
                {facility.operating_hours && (
                  <ListItem>
                    <ListItemIcon>
                      <Schedule />
                    </ListItemIcon>
                    <ListItemText
                      primary="Operating Hours"
                      secondary={facility.operating_hours}
                    />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Get in Touch
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  startIcon={<Phone />}
                  onClick={handleContactHospital}
                >
                  Contact the Hospital
                </Button>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<Directions />}
                  onClick={handleGetDirections}
                >
                  Get Directions
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Contact Dialog */}
      <Dialog open={contactDialogOpen} onClose={() => setContactDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Contact {facility.name}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
              <Box sx={{ flex: 1 }}>
                <TextField
                  fullWidth
                  label="Your Name"
                  value={contactForm.name}
                  onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                  required
                />
              </Box>
              <Box sx={{ flex: 1 }}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={contactForm.email}
                  onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                  required
                />
              </Box>
            </Box>
            <TextField
              fullWidth
              label="Phone Number"
              value={contactForm.phone}
              onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
            />
            <TextField
              fullWidth
              label="Subject"
              value={contactForm.subject}
              onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
              required
            />
            <TextField
              fullWidth
              label="Message"
              multiline
              rows={4}
              value={contactForm.message}
              onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
              required
            />
            <TextField
              fullWidth
              select
              label="Preferred Contact Method"
              value={contactForm.preferredContact}
              onChange={(e) => setContactForm({ ...contactForm, preferredContact: e.target.value })}
            >
              <option value="phone">Phone</option>
              <option value="email">Email</option>
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setContactDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleContactSubmit}>
            Send Message
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default FacilityDetailPage; 