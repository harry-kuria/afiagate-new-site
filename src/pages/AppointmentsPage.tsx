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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
} from '@mui/material';
import {
  Add,
  CalendarToday,
  Schedule,
  Edit,
  Cancel,
  CheckCircle,
  Pending,
  Search,
  Refresh,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { connectApiService } from '../services/connectApi';

interface Appointment {
  id: string;
  patient_id: string;
  provider_id: string;
  facility_id?: string;
  service_id?: string;
  appointment_date: string;
  appointment_time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  created_at: string;
  updated_at: string;
  patient?: {
    id: string;
    full_name: string;
    email: string;
    phone_number?: string;
  };
  provider?: {
    id: string;
    full_name: string;
    specialization?: string;
    email: string;
    phone_number?: string;
  };
  facility?: {
    id: string;
    name: string;
    location: string;
    phone_number?: string;
  };
}

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
      id={`appointment-tabpanel-${index}`}
      aria-labelledby={`appointment-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const AppointmentsPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Form state for creating/editing appointments
  const [formData, setFormData] = useState({
    provider_id: '',
    facility_id: '',
    appointment_date: '',
    appointment_time: '',
    notes: '',
  });

  // Available providers and facilities
  const [providers, setProviders] = useState<any[]>([]);
  const [facilities, setFacilities] = useState<any[]>([]);

  useEffect(() => {
    if (isAuthenticated) {
      loadAppointments();
      loadProviders();
      loadFacilities();
    }
  }, [isAuthenticated]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadAppointments = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await connectApiService.getAppointments({
        user_id: user?.id,
        status: statusFilter,
      });
      setAppointments(response.appointments || []);
    } catch (err) {
      setError('Failed to load appointments');
      console.error('Appointments loading error:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadProviders = async () => {
    try {
      const response = await connectApiService.getDoctors({ page: 1, limit: 100 });
      setProviders(response.data || []);
    } catch (err) {
      console.error('Failed to load providers:', err);
    }
  };

  const loadFacilities = async () => {
    try {
      const response = await connectApiService.getFacilities({ page: 1, limit: 100 });
      setFacilities(response.data || []);
    } catch (err) {
      console.error('Failed to load facilities:', err);
    }
  };

  const handleCreateAppointment = async () => {
    try {
      await connectApiService.createAppointment({
        patient_id: user?.id!,
        provider_id: formData.provider_id,
        facility_id: formData.facility_id || undefined,
        appointment_date: formData.appointment_date,
        appointment_time: formData.appointment_time,
        notes: formData.notes,
      });
      setCreateDialogOpen(false);
      resetForm();
      loadAppointments();
    } catch (err) {
      setError('Failed to create appointment');
    }
  };

  const handleUpdateAppointment = async () => {
    if (!selectedAppointment) return;
    
    try {
      await connectApiService.updateAppointment(selectedAppointment.id, {
        appointment_date: formData.appointment_date,
        appointment_time: formData.appointment_time,
        notes: formData.notes,
      });
      setEditDialogOpen(false);
      resetForm();
      loadAppointments();
    } catch (err) {
      setError('Failed to update appointment');
    }
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    
    try {
      await connectApiService.cancelAppointment(appointmentId);
      loadAppointments();
    } catch (err) {
      setError('Failed to cancel appointment');
    }
  };

  const resetForm = () => {
    setFormData({
      provider_id: '',
      facility_id: '',
      appointment_date: '',
      appointment_time: '',
      notes: '',
    });
  };

  const openEditDialog = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setFormData({
      provider_id: appointment.provider_id,
      facility_id: appointment.facility_id || '',
      appointment_date: appointment.appointment_date.split('T')[0],
      appointment_time: appointment.appointment_time,
      notes: appointment.notes || '',
    });
    setEditDialogOpen(true);
  };

  const filteredAppointments = appointments.filter(appointment =>
    appointment.provider?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    appointment.facility?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    appointment.notes?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const upcomingAppointments = filteredAppointments.filter(apt => 
    new Date(apt.appointment_date) >= new Date() && 
    apt.status !== 'cancelled' && 
    apt.status !== 'completed'
  );

  const pastAppointments = filteredAppointments.filter(apt => 
    new Date(apt.appointment_date) < new Date() || 
    apt.status === 'completed'
  );

  const pendingAppointments = filteredAppointments.filter(apt => 
    apt.status === 'pending'
  );

  if (!isAuthenticated) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="warning">Please log in to view your appointments.</Alert>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          <CalendarToday sx={{ mr: 2, verticalAlign: 'middle' }} />
          My Appointments
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your healthcare appointments
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Search and Filter */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, alignItems: 'center' }}>
            <Box sx={{ flex: 1, minWidth: 200 }}>
              <TextField
                fullWidth
                label="Search appointments"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />
            </Box>
            <Box sx={{ minWidth: 150 }}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="">All Status</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="confirmed">Confirmed</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Button
              variant="outlined"
              onClick={loadAppointments}
              startIcon={<Refresh />}
              sx={{ minWidth: 120 }}
            >
              Refresh
            </Button>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setCreateDialogOpen(true)}
              sx={{ minWidth: 150 }}
            >
              New Appointment
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 3, mb: 4 }}>
        <Box sx={{ flex: 1 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CalendarToday sx={{ mr: 2, color: 'primary.main' }} />
                <Box>
                  <Typography variant="h4">{upcomingAppointments.length}</Typography>
                  <Typography variant="body2" color="text.secondary">Upcoming</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
        <Box sx={{ flex: 1 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Pending sx={{ mr: 2, color: 'warning.main' }} />
                <Box>
                  <Typography variant="h4">{pendingAppointments.length}</Typography>
                  <Typography variant="body2" color="text.secondary">Pending</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
        <Box sx={{ flex: 1 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CheckCircle sx={{ mr: 2, color: 'success.main' }} />
                <Box>
                  <Typography variant="h4">{pastAppointments.length}</Typography>
                  <Typography variant="body2" color="text.secondary">Completed</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
        <Box sx={{ flex: 1 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Schedule sx={{ mr: 2, color: 'info.main' }} />
                <Box>
                  <Typography variant="h4">{filteredAppointments.length}</Typography>
                  <Typography variant="body2" color="text.secondary">Total</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Appointments Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
            <Tab label="All Appointments" />
            <Tab label="Upcoming" />
            <Tab label="Pending" />
            <Tab label="Past" />
          </Tabs>
        </Box>

        {/* All Appointments Tab */}
        <TabPanel value={tabValue} index={0}>
          <AppointmentsList 
            appointments={filteredAppointments} 
            onEdit={openEditDialog}
            onCancel={handleCancelAppointment}
          />
        </TabPanel>

        {/* Upcoming Appointments Tab */}
        <TabPanel value={tabValue} index={1}>
          <AppointmentsList 
            appointments={upcomingAppointments} 
            onEdit={openEditDialog}
            onCancel={handleCancelAppointment}
          />
        </TabPanel>

        {/* Pending Appointments Tab */}
        <TabPanel value={tabValue} index={2}>
          <AppointmentsList 
            appointments={pendingAppointments} 
            onEdit={openEditDialog}
            onCancel={handleCancelAppointment}
          />
        </TabPanel>

        {/* Past Appointments Tab */}
        <TabPanel value={tabValue} index={3}>
          <AppointmentsList 
            appointments={pastAppointments} 
            onEdit={openEditDialog}
            onCancel={handleCancelAppointment}
          />
        </TabPanel>
      </Card>

      {/* Create Appointment Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Book New Appointment</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
              <Box sx={{ flex: 1 }}>
                <FormControl fullWidth required>
                  <InputLabel>Healthcare Provider</InputLabel>
                  <Select
                    value={formData.provider_id}
                    onChange={(e) => setFormData({ ...formData, provider_id: e.target.value })}
                  >
                    {providers.map((provider) => (
                      <MenuItem key={provider.id} value={provider.id}>
                        {provider.full_name} - {provider.specialization}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
              <Box sx={{ flex: 1 }}>
                <FormControl fullWidth>
                  <InputLabel>Facility (Optional)</InputLabel>
                  <Select
                    value={formData.facility_id}
                    onChange={(e) => setFormData({ ...formData, facility_id: e.target.value })}
                  >
                    <MenuItem value="">No specific facility</MenuItem>
                    {facilities.map((facility) => (
                      <MenuItem key={facility.id} value={facility.id}>
                        {facility.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
              <Box sx={{ flex: 1 }}>
                <TextField
                  fullWidth
                  label="Appointment Date"
                  type="date"
                  value={formData.appointment_date}
                  onChange={(e) => setFormData({ ...formData, appointment_date: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Box>
              <Box sx={{ flex: 1 }}>
                <TextField
                  fullWidth
                  label="Appointment Time"
                  type="time"
                  value={formData.appointment_time}
                  onChange={(e) => setFormData({ ...formData, appointment_time: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Box>
            </Box>
            <TextField
              fullWidth
              label="Notes (Optional)"
              multiline
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateAppointment}>
            Book Appointment
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Appointment Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Edit Appointment</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
              <Box sx={{ flex: 1 }}>
                <TextField
                  fullWidth
                  label="Appointment Date"
                  type="date"
                  value={formData.appointment_date}
                  onChange={(e) => setFormData({ ...formData, appointment_date: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Box>
              <Box sx={{ flex: 1 }}>
                <TextField
                  fullWidth
                  label="Appointment Time"
                  type="time"
                  value={formData.appointment_time}
                  onChange={(e) => setFormData({ ...formData, appointment_time: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Box>
            </Box>
            <TextField
              fullWidth
              label="Notes"
              multiline
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleUpdateAppointment}>
            Update Appointment
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

// Appointments List Component
interface AppointmentsListProps {
  appointments: Appointment[];
  onEdit: (appointment: Appointment) => void;
  onCancel: (appointmentId: string) => void;
}

const AppointmentsList: React.FC<AppointmentsListProps> = ({ appointments, onEdit, onCancel }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'confirmed': return 'success';
      case 'completed': return 'info';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Pending />;
      case 'confirmed': return <CheckCircle />;
      case 'completed': return <CheckCircle />;
      case 'cancelled': return <Cancel />;
      default: return <Schedule />;
    }
  };

  if (appointments.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <CalendarToday sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" color="text.secondary">
          No appointments found
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Book your first appointment to get started
        </Typography>
      </Box>
    );
  }

  return (
    <List>
      {appointments.map((appointment) => (
        <ListItem key={appointment.id} divider>
          <ListItemAvatar>
            <Avatar>
              <CalendarToday />
            </Avatar>
          </ListItemAvatar>
          <ListItemText
            primary={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Typography variant="h6">
                  {new Date(appointment.appointment_date).toLocaleDateString()} at {appointment.appointment_time}
                </Typography>
                <Chip
                  icon={getStatusIcon(appointment.status)}
                  label={appointment.status}
                  color={getStatusColor(appointment.status) as any}
                  size="small"
                />
              </Box>
            }
            secondary={
              <Box>
                <Typography variant="body2" color="text.secondary">
                  <strong>Provider:</strong> {appointment.provider?.full_name} ({appointment.provider?.specialization})
                </Typography>
                {appointment.facility && (
                  <Typography variant="body2" color="text.secondary">
                    <strong>Facility:</strong> {appointment.facility.name}
                  </Typography>
                )}
                {appointment.notes && (
                  <Typography variant="body2" color="text.secondary">
                    <strong>Notes:</strong> {appointment.notes}
                  </Typography>
                )}
              </Box>
            }
          />
          <Box sx={{ display: 'flex', gap: 1 }}>
            {appointment.status === 'pending' && (
              <Tooltip title="Edit Appointment">
                <IconButton onClick={() => onEdit(appointment)}>
                  <Edit />
                </IconButton>
              </Tooltip>
            )}
            {appointment.status !== 'cancelled' && appointment.status !== 'completed' && (
              <Tooltip title="Cancel Appointment">
                <IconButton onClick={() => onCancel(appointment.id)}>
                  <Cancel />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </ListItem>
      ))}
    </List>
  );
};

export default AppointmentsPage;