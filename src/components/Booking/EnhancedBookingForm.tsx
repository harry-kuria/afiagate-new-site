import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  RadioGroup,
  Radio,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  Alert,
  Chip,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
} from '@mui/material';
import {
  Person,
  LocalHospital,
  CalendarToday,
  CheckCircle,
  Warning,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { connectApiService } from '../../services/connectApi';
import { format } from 'date-fns';

interface BookingFormData {
  // Patient Information
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  emergencyContact: string;
  emergencyPhone: string;
  
  // Appointment Details
  appointmentType: 'consultation' | 'follow-up' | 'emergency' | 'routine';
  specialty: string;
  providerId: string;
  facilityId: string;
  preferredDate: string;
  preferredTime: string;
  alternativeDates: string[];
  
  // Medical Information
  chiefComplaint: string;
  symptoms: string[];
  medicalHistory: string;
  currentMedications: string;
  allergies: string;
  
  // Insurance & Payment
  insuranceProvider: string;
  insuranceNumber: string;
  paymentMethod: 'insurance' | 'cash' | 'card';
  
  // Additional Information
  specialRequests: string;
  accessibilityNeeds: string;
  languagePreference: string;
  notes: string;
}

interface EnhancedBookingFormProps {
  open: boolean;
  onClose: () => void;
  providerId?: string;
  facilityId?: string;
  initialData?: Partial<BookingFormData>;
}

const EnhancedBookingForm: React.FC<EnhancedBookingFormProps> = ({
  open,
  onClose,
  providerId,
  facilityId,
  initialData
}) => {
  const { user } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState<BookingFormData>({
    patientName: user?.full_name || '',
    patientEmail: user?.email || '',
    patientPhone: user?.phone_number || '',
    dateOfBirth: '',
    gender: 'male',
    emergencyContact: '',
    emergencyPhone: '',
    appointmentType: 'consultation',
    specialty: '',
    providerId: providerId || '',
    facilityId: facilityId || '',
    preferredDate: '',
    preferredTime: '',
    alternativeDates: [],
    chiefComplaint: '',
    symptoms: [],
    medicalHistory: '',
    currentMedications: '',
    allergies: '',
    insuranceProvider: '',
    insuranceNumber: '',
    paymentMethod: 'insurance',
    specialRequests: '',
    accessibilityNeeds: '',
    languagePreference: 'english',
    notes: ''
  });

  const [providers, setProviders] = useState<any[]>([]);
  const [facilities, setFacilities] = useState<any[]>([]);
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const steps = [
    'Patient Information',
    'Appointment Details',
    'Medical Information',
    'Insurance & Payment',
    'Review & Confirm'
  ];

  const symptomsOptions = [
    'Fever', 'Cough', 'Headache', 'Nausea', 'Dizziness', 'Chest Pain',
    'Shortness of Breath', 'Fatigue', 'Joint Pain', 'Rash', 'Abdominal Pain',
    'Back Pain', 'Sleep Problems', 'Anxiety', 'Depression', 'Other'
  ];

  const appointmentTypes = [
    { value: 'consultation', label: 'Initial Consultation', icon: <Person /> },
    { value: 'follow-up', label: 'Follow-up Visit', icon: <CheckCircle /> },
    { value: 'emergency', label: 'Emergency', icon: <Warning /> },
    { value: 'routine', label: 'Routine Check-up', icon: <CalendarToday /> }
  ];

  useEffect(() => {
    if (open) {
      loadInitialData();
    }
  }, [open]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [providersRes, facilitiesRes] = await Promise.all([
        connectApiService.getDoctors(),
        connectApiService.getFacilities()
      ]);
      
      setProviders(providersRes.data || []);
      setFacilities(facilitiesRes.data || []);
      
      // Extract unique specialties
      const specializations = (providersRes.data || [])
        .map((provider: any) => provider.specialization)
        .filter(Boolean);
      const uniqueSpecialties = Array.from(new Set(specializations));
      setSpecialties(uniqueSpecialties);
    } catch (err) {
      setError('Failed to load initial data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof BookingFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSymptomToggle = (symptom: string) => {
    setFormData(prev => ({
      ...prev,
      symptoms: prev.symptoms.includes(symptom)
        ? prev.symptoms.filter(s => s !== symptom)
        : [...prev.symptoms, symptom]
    }));
  };

  const handleNext = () => {
    setActiveStep(prev => prev + 1);
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);
      
      await connectApiService.createAppointment({
        patient_id: user?.id!,
        provider_id: formData.providerId,
        facility_id: formData.facilityId,
        appointment_date: formData.preferredDate,
        appointment_time: formData.preferredTime,
        notes: `${formData.chiefComplaint}\n\nSymptoms: ${formData.symptoms.join(', ')}\n\nMedical History: ${formData.medicalHistory}\n\nCurrent Medications: ${formData.currentMedications}\n\nAllergies: ${formData.allergies}\n\nSpecial Requests: ${formData.specialRequests}`
      });
      
      setSuccess(true);
    } catch (err) {
      setError('Failed to book appointment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderPatientInfo = () => (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
        Patient Information
      </Typography>
      
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: { xs: 2, sm: 3 } }}>
        <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
          <TextField
            fullWidth
            label="Full Name"
            value={formData.patientName}
            onChange={(e) => handleInputChange('patientName', e.target.value)}
            required
            size="small"
          />
        </Box>
        <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={formData.patientEmail}
            onChange={(e) => handleInputChange('patientEmail', e.target.value)}
            required
            size="small"
          />
        </Box>
        <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
          <TextField
            fullWidth
            label="Phone Number"
            value={formData.patientPhone}
            onChange={(e) => handleInputChange('patientPhone', e.target.value)}
            required
            size="small"
          />
        </Box>
        <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
          <TextField
            fullWidth
            label="Date of Birth"
            type="date"
            value={formData.dateOfBirth}
            onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
            InputLabelProps={{ shrink: true }}
            required
            size="small"
          />
        </Box>
        <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Gender</InputLabel>
            <Select
              value={formData.gender}
              onChange={(e) => handleInputChange('gender', e.target.value)}
            >
              <MenuItem value="male">Male</MenuItem>
              <MenuItem value="female">Female</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </Select>
          </FormControl>
        </Box>
        <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
          <TextField
            fullWidth
            label="Emergency Contact Name"
            value={formData.emergencyContact}
            onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
            size="small"
          />
        </Box>
        <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
          <TextField
            fullWidth
            label="Emergency Contact Phone"
            value={formData.emergencyPhone}
            onChange={(e) => handleInputChange('emergencyPhone', e.target.value)}
            size="small"
          />
        </Box>
        <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
          <TextField
            fullWidth
            label="Language Preference"
            value={formData.languagePreference}
            onChange={(e) => handleInputChange('languagePreference', e.target.value)}
            size="small"
          />
        </Box>
      </Box>
    </Box>
  );

  const renderAppointmentDetails = () => (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Appointment Details
      </Typography>
      
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
        <Box sx={{ flex: '1 1 100%', minWidth: 0 }}>
          <Typography variant="subtitle1" gutterBottom>
            Appointment Type
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            {appointmentTypes.map((type) => (
              <Box sx={{ flex: '1 1 250px', minWidth: 0 }} key={type.value}>
                <Card
                  sx={{
                    cursor: 'pointer',
                    border: formData.appointmentType === type.value ? 2 : 1,
                    borderColor: formData.appointmentType === type.value ? 'primary.main' : 'divider',
                    '&:hover': { borderColor: 'primary.main' }
                  }}
                  onClick={() => handleInputChange('appointmentType', type.value)}
                >
                  <CardContent sx={{ textAlign: 'center', py: 2 }}>
                    {type.icon}
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      {type.label}
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            ))}
          </Box>
        </Box>

        <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
          <FormControl fullWidth>
            <InputLabel>Specialty</InputLabel>
            <Select
              value={formData.specialty}
              onChange={(e) => handleInputChange('specialty', e.target.value)}
            >
              {specialties.map((specialty) => (
                <MenuItem key={specialty} value={specialty}>
                  {specialty}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
          <FormControl fullWidth>
            <InputLabel>Healthcare Provider</InputLabel>
            <Select
              value={formData.providerId}
              onChange={(e) => handleInputChange('providerId', e.target.value)}
            >
              {providers.map((provider) => (
                <MenuItem key={provider.id} value={provider.id}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar sx={{ width: 24, height: 24 }}>
                      {provider.full_name?.charAt(0)}
                    </Avatar>
                    {provider.full_name} - {provider.specialization}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
          <FormControl fullWidth>
            <InputLabel>Facility</InputLabel>
            <Select
              value={formData.facilityId}
              onChange={(e) => handleInputChange('facilityId', e.target.value)}
            >
              {facilities.map((facility) => (
                <MenuItem key={facility.id} value={facility.id}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocalHospital color="primary" />
                    {facility.name}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
          <TextField
            fullWidth
            label="Preferred Date"
            type="date"
            value={formData.preferredDate}
            onChange={(e) => handleInputChange('preferredDate', e.target.value)}
            InputLabelProps={{ shrink: true }}
            inputProps={{ min: format(new Date(), 'yyyy-MM-dd') }}
            required
          />
        </Box>

        <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
          <TextField
            fullWidth
            label="Preferred Time"
            type="time"
            value={formData.preferredTime}
            onChange={(e) => handleInputChange('preferredTime', e.target.value)}
            InputLabelProps={{ shrink: true }}
            required
          />
        </Box>
      </Box>
    </Box>
  );

  const renderMedicalInfo = () => (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Medical Information
      </Typography>
      
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
        <Box sx={{ flex: '1 1 100%', minWidth: 0 }}>
          <TextField
            fullWidth
            label="Chief Complaint"
            multiline
            rows={3}
            value={formData.chiefComplaint}
            onChange={(e) => handleInputChange('chiefComplaint', e.target.value)}
            placeholder="Please describe your main concern or reason for the appointment..."
            required
          />
        </Box>

        <Box sx={{ flex: '1 1 100%', minWidth: 0 }}>
          <Typography variant="subtitle1" gutterBottom>
            Symptoms (Select all that apply)
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {symptomsOptions.map((symptom) => (
              <Chip
                key={symptom}
                label={symptom}
                clickable
                color={formData.symptoms.includes(symptom) ? 'primary' : 'default'}
                onClick={() => handleSymptomToggle(symptom)}
                variant={formData.symptoms.includes(symptom) ? 'filled' : 'outlined'}
              />
            ))}
          </Box>
        </Box>

        <Box sx={{ flex: '1 1 100%', minWidth: 0 }}>
          <TextField
            fullWidth
            label="Medical History"
            multiline
            rows={4}
            value={formData.medicalHistory}
            onChange={(e) => handleInputChange('medicalHistory', e.target.value)}
            placeholder="Please list any previous medical conditions, surgeries, or hospitalizations..."
          />
        </Box>

        <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
          <TextField
            fullWidth
            label="Current Medications"
            multiline
            rows={3}
            value={formData.currentMedications}
            onChange={(e) => handleInputChange('currentMedications', e.target.value)}
            placeholder="List all current medications, including dosages..."
          />
        </Box>

        <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
          <TextField
            fullWidth
            label="Allergies"
            multiline
            rows={3}
            value={formData.allergies}
            onChange={(e) => handleInputChange('allergies', e.target.value)}
            placeholder="List any known allergies to medications, foods, or other substances..."
          />
        </Box>

        <Box sx={{ flex: '1 1 100%', minWidth: 0 }}>
          <TextField
            fullWidth
            label="Accessibility Needs"
            value={formData.accessibilityNeeds}
            onChange={(e) => handleInputChange('accessibilityNeeds', e.target.value)}
            placeholder="Any special accessibility requirements..."
          />
        </Box>
      </Box>
    </Box>
  );

  const renderInsurancePayment = () => (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Insurance & Payment
      </Typography>
      
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
        <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
          <TextField
            fullWidth
            label="Insurance Provider"
            value={formData.insuranceProvider}
            onChange={(e) => handleInputChange('insuranceProvider', e.target.value)}
          />
        </Box>
        <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
          <TextField
            fullWidth
            label="Insurance Number"
            value={formData.insuranceNumber}
            onChange={(e) => handleInputChange('insuranceNumber', e.target.value)}
          />
        </Box>
        <Box sx={{ flex: '1 1 100%', minWidth: 0 }}>
          <FormControl>
            <Typography variant="subtitle1" gutterBottom>
              Payment Method
            </Typography>
            <RadioGroup
              value={formData.paymentMethod}
              onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
            >
              <FormControlLabel value="insurance" control={<Radio />} label="Insurance" />
              <FormControlLabel value="cash" control={<Radio />} label="Cash Payment" />
              <FormControlLabel value="card" control={<Radio />} label="Card Payment" />
            </RadioGroup>
          </FormControl>
        </Box>
      </Box>
    </Box>
  );

  const renderReviewConfirm = () => (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Review & Confirm
      </Typography>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          Patient Information
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {formData.patientName} • {formData.patientEmail} • {formData.patientPhone}
        </Typography>
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          Appointment Details
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {formData.appointmentType} • {formData.preferredDate} at {formData.preferredTime}
        </Typography>
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          Chief Complaint
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {formData.chiefComplaint}
        </Typography>
        {formData.symptoms.length > 0 && (
          <Box sx={{ mt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Symptoms: {formData.symptoms.join(', ')}
            </Typography>
          </Box>
        )}
      </Paper>

      <TextField
        fullWidth
        label="Additional Notes"
        multiline
        rows={3}
        value={formData.notes}
        onChange={(e) => handleInputChange('notes', e.target.value)}
        placeholder="Any additional information or special requests..."
        sx={{ mb: 3 }}
      />
    </Box>
  );

  const getStepContent = (step: number) => {
    switch (step) {
      case 0: return renderPatientInfo();
      case 1: return renderAppointmentDetails();
      case 2: return renderMedicalInfo();
      case 3: return renderInsurancePayment();
      case 4: return renderReviewConfirm();
      default: return null;
    }
  };

  if (success) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <CheckCircle color="success" />
            <Typography variant="h6">Appointment Booked Successfully!</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Alert severity="success" sx={{ mb: 2 }}>
            Your appointment has been booked successfully. You will receive a confirmation email shortly.
          </Alert>
          <Typography variant="body2" color="text.secondary">
            Appointment Details:
            <br />• Date: {formData.preferredDate}
            <br />• Time: {formData.preferredTime}
            <br />• Type: {formData.appointmentType}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      fullScreen={window.innerWidth < 768}
      sx={{
        '& .MuiDialog-paper': {
          m: { xs: 1, sm: 2 },
          maxHeight: { xs: '100vh', sm: '90vh' }
        }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Typography variant="h5" sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
          Book an Appointment
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
          Complete the form below to book your healthcare appointment
        </Typography>
      </DialogTitle>
      
      <DialogContent sx={{ px: { xs: 2, sm: 3 }, py: { xs: 1, sm: 2 } }}>
        <Stepper 
          activeStep={activeStep} 
          orientation={window.innerWidth < 768 ? "vertical" : "horizontal"} 
          sx={{ 
            mb: 3,
            '& .MuiStepLabel-label': {
              fontSize: { xs: '0.75rem', sm: '0.875rem' }
            }
          }}
        >
          {steps.map((label, index) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {getStepContent(activeStep)}
      </DialogContent>

      <DialogActions sx={{ 
        p: { xs: 2, sm: 3 }, 
        flexDirection: { xs: 'column', sm: 'row' },
        gap: { xs: 1, sm: 0 }
      }}>
        <Button 
          onClick={onClose}
          sx={{ width: { xs: '100%', sm: 'auto' } }}
        >
          Cancel
        </Button>
        {activeStep > 0 && (
          <Button 
            onClick={handleBack}
            sx={{ width: { xs: '100%', sm: 'auto' } }}
          >
            Back
          </Button>
        )}
        {activeStep < steps.length - 1 ? (
          <Button 
            onClick={handleNext} 
            variant="contained"
            sx={{ width: { xs: '100%', sm: 'auto' } }}
          >
            Next
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={loading}
            sx={{ width: { xs: '100%', sm: 'auto' } }}
          >
            {loading ? 'Booking...' : (user?.role === 'facility' ? 'Book Appointment' : 'Request Medic')}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default EnhancedBookingForm;
