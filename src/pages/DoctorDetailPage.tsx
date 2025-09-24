import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Card,
  CardContent,
  Typography,
  Avatar,
  Box,
  Chip,
  Rating,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Alert,
  CircularProgress,
  Paper,
  Stack,
  Tabs,
  Tab,
} from '@mui/material';
import {
  School,
  LocalHospital,
  Phone,
  Email,
  CalendarToday,
  LocationOn,
  Work,
  Person,
  Message,
  CheckCircle,
  Schedule,
} from '@mui/icons-material';
import { useParams } from 'react-router-dom';
import { connectApiService } from '../services/connectApi';
import { User, Review, Education, Licensure } from '../types';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`doctor-tabpanel-${index}`}
      aria-labelledby={`doctor-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const DoctorDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [doctor, setDoctor] = useState<User | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [education, setEducation] = useState<Education[]>([]);
  const [licensure, setLicensure] = useState<Licensure[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [contactMessage, setContactMessage] = useState('');
  const [contactMethod, setContactMethod] = useState<'phone' | 'email' | 'appointment'>('appointment');

  const loadDoctorData = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);

      // Load doctor data
      const doctorData = await connectApiService.getDoctorById(id);
      setDoctor(doctorData);

      // Load reviews
      const reviewsData = await connectApiService.getReviews(id);
      setReviews(reviewsData.data);

      // Load education
      const educationData = await connectApiService.getEducation(id);
      setEducation(educationData.data);

      // Load licensure
      const licensureData = await connectApiService.getLicensure(id);
      setLicensure(licensureData.data);

    } catch (err) {
      setError('Failed to load doctor profile');
      console.error('Error loading doctor:', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      loadDoctorData();
    }
  }, [id, loadDoctorData]);

  const handleContactRequest = async () => {
    if (!id || !contactMessage.trim()) return;

    try {
      await connectApiService.createContactRequest({
        provider_id: id,
        message: contactMessage,
        contact_method: contactMethod,
      });

      setContactDialogOpen(false);
      setContactMessage('');
      // Show success message
    } catch (err) {
      setError('Failed to send contact request');
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
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

  if (!doctor) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="warning">Doctor not found</Alert>
      </Container>
    );
  }

  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : 0;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Doctor Header */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
            <Avatar
              sx={{ width: 120, height: 120 }}
              src={`https://ui-avatars.com/api/?name=${doctor.full_name}&size=120&background=random`}
            />
            <Box sx={{ flex: 1, minWidth: 300 }}>
              <Typography variant="h4" gutterBottom>
                Dr. {doctor.full_name}
              </Typography>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                {doctor.specialization || 'Healthcare Professional'}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Rating value={averageRating} readOnly precision={0.1} />
                <Typography variant="body2" sx={{ ml: 1 }}>
                  ({reviews.length} reviews)
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                <Chip
                  icon={<LocationOn />}
                  label={doctor.location || 'Location not specified'}
                  variant="outlined"
                />
                <Chip
                  icon={<Work />}
                  label={doctor.experience || 'Experience not specified'}
                  variant="outlined"
                />
                <Chip
                  icon={doctor.is_available ? <CheckCircle /> : <Schedule />}
                  label={doctor.is_available ? 'Available' : 'Not Available'}
                  color={doctor.is_available ? 'success' : 'default'}
                  variant="outlined"
                />
              </Box>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  startIcon={<Message />}
                  onClick={() => setContactDialogOpen(true)}
                >
                  Contact Dr. {doctor.full_name?.split(' ')[0] || 'Doctor'}
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<CalendarToday />}
                  onClick={() => setContactDialogOpen(true)}
                >
                  Book Appointment
                </Button>
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Doctor Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="Overview" />
            <Tab label="Reviews & Ratings" />
            <Tab label="Education" />
            <Tab label="Licensure" />
            <Tab label="Contact" />
          </Tabs>
        </Box>

        {/* Overview Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
            <Box sx={{ flex: 1 }}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Professional Information
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon><Person /></ListItemIcon>
                    <ListItemText 
                      primary="Full Name" 
                      secondary={`Dr. ${doctor.full_name}`} 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><Email /></ListItemIcon>
                    <ListItemText 
                      primary="Email" 
                      secondary={doctor.email} 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><Phone /></ListItemIcon>
                    <ListItemText 
                      primary="Phone" 
                      secondary={doctor.phone_number || 'Not provided'} 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><Work /></ListItemIcon>
                    <ListItemText 
                      primary="Specialization" 
                      secondary={doctor.specialization || 'Not specified'} 
                    />
                  </ListItem>
                </List>
              </Paper>
            </Box>
            <Box sx={{ flex: 1 }}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Statistics
                </Typography>
                <Box sx={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="primary">
                      {averageRating.toFixed(1)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Average Rating
                    </Typography>
                  </Box>
                  <Box textAlign="center">
                    <Typography variant="h4" color="primary">
                      {reviews.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Reviews
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Box>
          </Box>
        </TabPanel>

        {/* Reviews Tab */}
        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>
            Reviews & Ratings ({reviews.length})
          </Typography>
          {reviews.length === 0 ? (
            <Alert severity="info">No reviews yet</Alert>
          ) : (
            <Stack spacing={2}>
              {reviews.map((review) => (
                <Paper key={review.id} sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="subtitle1">
                      {review.user?.full_name || 'Anonymous'}
                    </Typography>
                    <Rating value={review.rating} readOnly size="small" />
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {review.comment}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    {new Date(review.created_at).toLocaleDateString()}
                  </Typography>
                </Paper>
              ))}
            </Stack>
          )}
        </TabPanel>

        {/* Education Tab */}
        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>
            Education
          </Typography>
          {education.length === 0 ? (
            <Alert severity="info">No education information available</Alert>
          ) : (
            <Stack spacing={2}>
              {education.map((edu) => (
                <Paper key={edu.id} sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <School sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6">{edu.degree}</Typography>
                  </Box>
                  <Typography variant="subtitle1" color="primary">
                    {edu.institution}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {edu.field_of_study} • {edu.graduation_year}
                    {edu.gpa && ` • GPA: ${edu.gpa}`}
                  </Typography>
                </Paper>
              ))}
            </Stack>
          )}
        </TabPanel>

        {/* Licensure Tab */}
        <TabPanel value={tabValue} index={3}>
          <Typography variant="h6" gutterBottom>
            Licensure & Certifications
          </Typography>
          {licensure.length === 0 ? (
            <Alert severity="info">No licensure information available</Alert>
          ) : (
            <Stack spacing={2}>
              {licensure.map((license) => (
                <Paper key={license.id} sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <LocalHospital sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6">{license.license_type}</Typography>
                    <Chip
                      label={license.is_active ? 'Active' : 'Inactive'}
                      color={license.is_active ? 'success' : 'default'}
                      size="small"
                      sx={{ ml: 2 }}
                    />
                  </Box>
                  <Typography variant="subtitle1" color="primary">
                    {license.issuing_authority}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    License #: {license.license_number}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Issued: {new Date(license.issue_date).toLocaleDateString()} • 
                    Expires: {new Date(license.expiry_date).toLocaleDateString()}
                  </Typography>
                </Paper>
              ))}
            </Stack>
          )}
        </TabPanel>

        {/* Contact Tab */}
        <TabPanel value={tabValue} index={4}>
          <Typography variant="h6" gutterBottom>
            Contact Information
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
            <Box sx={{ flex: 1 }}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  <Email sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Email
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {doctor.email}
                </Typography>
              </Paper>
            </Box>
            <Box sx={{ flex: 1 }}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  <Phone sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Phone
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {doctor.phone_number || 'Not provided'}
                </Typography>
              </Paper>
            </Box>
          </Box>
          <Box sx={{ mt: 2 }}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                <LocationOn sx={{ mr: 1, verticalAlign: 'middle' }} />
                Location
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {doctor.location || 'Not specified'}
              </Typography>
            </Paper>
          </Box>
        </TabPanel>
      </Card>

      {/* Contact Dialog */}
      <Dialog open={contactDialogOpen} onClose={() => setContactDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Contact Dr. {doctor.full_name?.split(' ')[0] || 'Doctor'}</DialogTitle>
        <DialogContent>
          <TextField
            select
            fullWidth
            label="Contact Method"
            value={contactMethod}
            onChange={(e) => setContactMethod(e.target.value as 'phone' | 'email' | 'appointment')}
            sx={{ mb: 2, mt: 1 }}
            SelectProps={{
              native: true,
            }}
          >
            <option value="appointment">Book Appointment</option>
            <option value="phone">Phone Call</option>
            <option value="email">Email</option>
          </TextField>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Message"
            value={contactMessage}
            onChange={(e) => setContactMessage(e.target.value)}
            placeholder="Please describe your needs or questions..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setContactDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleContactRequest} variant="contained">
            Send Request
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default DoctorDetailPage;