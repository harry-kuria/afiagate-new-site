import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Add,
  CalendarToday,
  Schedule,
  Person,
  LocalHospital,
  CheckCircle,
  Cancel,
  Pending,
  FilterList,
  Refresh,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { connectApiService } from '../services/connectApi';
import Calendar from '../components/Calendar/Calendar';
import { format } from 'date-fns';

interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  time: string;
  type: 'appointment' | 'availability' | 'blocked';
  status?: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  provider?: {
    id: string;
    name: string;
    specialization?: string;
  };
  facility?: {
    id: string;
    name: string;
  };
  patient?: {
    id: string;
    name: string;
  };
  notes?: string;
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
      id={`calendar-tabpanel-${index}`}
      aria-labelledby={`calendar-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const CalendarPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [eventDialogOpen, setEventDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [filterStatus, setFilterStatus] = useState('');

  // Form state for creating events
  const [formData, setFormData] = useState({
    title: '',
    time: '',
    type: 'appointment',
    notes: '',
    provider_id: '',
    facility_id: '',
  });

  const [providers, setProviders] = useState<any[]>([]);
  const [facilities, setFacilities] = useState<any[]>([]);

  useEffect(() => {
    if (isAuthenticated) {
      loadEvents();
      loadProviders();
      loadFacilities();
    }
  }, [isAuthenticated]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load appointments and convert to calendar events
      const appointmentsResponse = await connectApiService.getAppointments({
        user_id: user?.id,
        status: filterStatus,
      });

      const calendarEvents: CalendarEvent[] = appointmentsResponse.appointments.map((apt: any) => ({
        id: apt.id,
        title: apt.provider?.full_name || 'Appointment',
        date: new Date(apt.appointment_date),
        time: apt.appointment_time,
        type: 'appointment',
        status: apt.status,
        provider: apt.provider ? {
          id: apt.provider.id,
          name: apt.provider.full_name,
          specialization: apt.provider.specialization,
        } : undefined,
        facility: apt.facility ? {
          id: apt.facility.id,
          name: apt.facility.name,
        } : undefined,
        patient: apt.patient ? {
          id: apt.patient.id,
          name: apt.patient.full_name,
        } : undefined,
        notes: apt.notes,
      }));

      setEvents(calendarEvents);
    } catch (err) {
      setError('Failed to load calendar events');
      console.error('Calendar loading error:', err);
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

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
  };

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setEventDialogOpen(true);
  };

  const handleCreateEvent = (date: Date) => {
    setSelectedDate(date);
    setFormData({
      ...formData,
      title: '',
      time: '',
      type: 'appointment',
      notes: '',
      provider_id: '',
      facility_id: '',
    });
    setCreateDialogOpen(true);
  };

  const handleCreateAppointment = async () => {
    if (!selectedDate || !formData.title || !formData.time || !formData.provider_id) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      await connectApiService.createAppointment({
        patient_id: user?.id!,
        provider_id: formData.provider_id,
        facility_id: formData.facility_id || undefined,
        appointment_date: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '',
        appointment_time: formData.time,
        notes: formData.notes,
      });
      
      setCreateDialogOpen(false);
      loadEvents();
    } catch (err) {
      setError('Failed to create appointment');
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(event => 
      event.date.toDateString() === date.toDateString()
    );
  };

  const getUpcomingEvents = () => {
    const today = new Date();
    return events
      .filter(event => event.date >= today)
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .slice(0, 5);
  };

  const getTodayEvents = () => {
    const today = new Date();
    return events.filter(event => 
      event.date.toDateString() === today.toDateString()
    );
  };

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

  if (!isAuthenticated) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="warning">Please log in to view your calendar.</Alert>
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
          My Calendar
        </Typography>
        <Typography variant="body1" color="text.secondary">
          View and manage your appointments and schedule
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Calendar Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="Calendar View" />
            <Tab label="Today's Events" />
            <Tab label="Upcoming" />
          </Tabs>
        </Box>

        {/* Calendar View Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Filter by Status</InputLabel>
                <Select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <MenuItem value="">All Status</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="confirmed">Confirmed</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                </Select>
              </FormControl>
              <Button
                variant="outlined"
                startIcon={<Refresh />}
                onClick={loadEvents}
              >
                Refresh
              </Button>
            </Box>
          </Box>
          
          <Calendar
            events={events}
            onDateClick={handleDateClick}
            onEventClick={handleEventClick}
            onCreateEvent={handleCreateEvent}
            loading={loading}
            error={error || undefined}
            showCreateButton={true}
          />
        </TabPanel>

        {/* Today's Events Tab */}
        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>
            Today's Events ({getTodayEvents().length})
          </Typography>
          {getTodayEvents().length === 0 ? (
            <Alert severity="info">No events scheduled for today.</Alert>
          ) : (
            <List>
              {getTodayEvents().map((event) => (
                <ListItem key={event.id} divider>
                  <ListItemIcon>
                    {getStatusIcon(event.status || '')}
                  </ListItemIcon>
                  <ListItemText
                    primary={event.title}
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          {event.time} - {event.provider?.name}
                        </Typography>
                        {event.facility && (
                          <Typography variant="body2" color="text.secondary">
                            {event.facility.name}
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                  <Chip
                    label={event.status || event.type}
                    color={getStatusColor(event.status || '') as any}
                    size="small"
                  />
                </ListItem>
              ))}
            </List>
          )}
        </TabPanel>

        {/* Upcoming Events Tab */}
        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>
            Upcoming Events ({getUpcomingEvents().length})
          </Typography>
          {getUpcomingEvents().length === 0 ? (
            <Alert severity="info">No upcoming events scheduled.</Alert>
          ) : (
            <List>
              {getUpcomingEvents().map((event) => (
                <ListItem key={event.id} divider>
                  <ListItemIcon>
                    {getStatusIcon(event.status || '')}
                  </ListItemIcon>
                  <ListItemText
                    primary={event.title}
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          {event.date.toLocaleDateString()} at {event.time}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {event.provider?.name}
                          {event.facility && ` - ${event.facility.name}`}
                        </Typography>
                      </Box>
                    }
                  />
                  <Chip
                    label={event.status || event.type}
                    color={getStatusColor(event.status || '') as any}
                    size="small"
                  />
                </ListItem>
              ))}
            </List>
          )}
        </TabPanel>
      </Card>

      {/* Create Appointment Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create New Appointment</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              fullWidth
              label="Appointment Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                label="Date"
                type="date"
                value={selectedDate ? format(selectedDate, 'yyyy-MM-dd') : ''}
                disabled
              />
              <TextField
                fullWidth
                label="Time"
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                required
              />
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
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
            Create Appointment
          </Button>
        </DialogActions>
      </Dialog>

      {/* Event Details Dialog */}
      <Dialog open={eventDialogOpen} onClose={() => setEventDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Event Details</DialogTitle>
        <DialogContent>
          {selectedEvent && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {getStatusIcon(selectedEvent.status || '')}
                <Typography variant="h6">{selectedEvent.title}</Typography>
                <Chip
                  label={selectedEvent.status || selectedEvent.type}
                  color={getStatusColor(selectedEvent.status || '') as any}
                  size="small"
                />
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Schedule sx={{ fontSize: 16 }} />
                <Typography variant="body2">
                  {selectedEvent.date.toLocaleDateString()} at {selectedEvent.time}
                </Typography>
              </Box>

              {selectedEvent.provider && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Person sx={{ fontSize: 16 }} />
                  <Typography variant="body2">
                    {selectedEvent.provider.name}
                    {selectedEvent.provider.specialization && ` - ${selectedEvent.provider.specialization}`}
                  </Typography>
                </Box>
              )}

              {selectedEvent.facility && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LocalHospital sx={{ fontSize: 16 }} />
                  <Typography variant="body2">{selectedEvent.facility.name}</Typography>
                </Box>
              )}

              {selectedEvent.notes && (
                <Box>
                  <Typography variant="subtitle2" gutterBottom>Notes:</Typography>
                  <Typography variant="body2">{selectedEvent.notes}</Typography>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEventDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CalendarPage;
