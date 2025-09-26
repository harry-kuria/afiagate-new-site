import React, { useState } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Paper,
  Chip,
  Tooltip,
  CircularProgress,
  Alert,
  Button,
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
  ChevronLeft,
  ChevronRight,
  Today,
  Add,
  Schedule,
  Person,
  LocalHospital,
  CheckCircle,
  Cancel,
  Pending,
} from '@mui/icons-material';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek, isToday, isBefore } from 'date-fns';

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

interface CalendarProps {
  events?: CalendarEvent[];
  onDateClick?: (date: Date) => void;
  onEventClick?: (event: CalendarEvent) => void;
  onCreateEvent?: (date: Date) => void;
  loading?: boolean;
  error?: string;
  view?: 'month' | 'week' | 'day';
  showCreateButton?: boolean;
  readOnly?: boolean;
}

const Calendar: React.FC<CalendarProps> = ({
  events = [],
  onDateClick,
  onEventClick,
  onCreateEvent,
  loading = false,
  error,
  view = 'month',
  showCreateButton = true,
  readOnly = false,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [eventDialogOpen, setEventDialogOpen] = useState(false);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  const handlePreviousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleDateClick = (date: Date) => {
    if (readOnly) return;
    
    setSelectedDate(date);
    if (onDateClick) {
      onDateClick(date);
    }
    if (onCreateEvent) {
      onCreateEvent(date);
    }
  };

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setEventDialogOpen(true);
    if (onEventClick) {
      onEventClick(event);
    }
  };

  const handleCreateEvent = () => {
    if (selectedDate) {
      setCreateDialogOpen(true);
    }
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(event => isSameDay(event.date, date));
  };

  const getEventColor = (event: CalendarEvent) => {
    switch (event.type) {
      case 'appointment':
        switch (event.status) {
          case 'pending': return 'warning';
          case 'confirmed': return 'success';
          case 'completed': return 'info';
          case 'cancelled': return 'error';
          default: return 'default';
        }
      case 'availability': return 'primary';
      case 'blocked': return 'error';
      default: return 'default';
    }
  };

  const getEventIcon = (event: CalendarEvent) => {
    switch (event.type) {
      case 'appointment':
        switch (event.status) {
          case 'pending': return <Pending />;
          case 'confirmed': return <CheckCircle />;
          case 'completed': return <CheckCircle />;
          case 'cancelled': return <Cancel />;
          default: return <Schedule />;
        }
      case 'availability': return <Schedule />;
      case 'blocked': return <Cancel />;
      default: return <Schedule />;
    }
  };

  const isDateDisabled = (date: Date) => {
    return isBefore(date, new Date()) && !isToday(date);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      {/* Calendar Header */}
      <Paper sx={{ p: { xs: 1, sm: 2 }, mb: 2 }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 2,
          flexDirection: { xs: 'column', sm: 'row' },
          gap: { xs: 1, sm: 0 }
        }}>
          <Typography variant="h5" component="h2" sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
            {format(currentDate, 'MMMM yyyy')}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton 
              onClick={handlePreviousMonth}
              size="small"
              sx={{ p: { xs: 0.5, sm: 1 } }}
            >
              <ChevronLeft />
            </IconButton>
            <IconButton 
              onClick={handleToday}
              size="small"
              sx={{ p: { xs: 0.5, sm: 1 } }}
            >
              <Today />
            </IconButton>
            <IconButton 
              onClick={handleNextMonth}
              size="small"
              sx={{ p: { xs: 0.5, sm: 1 } }}
            >
              <ChevronRight />
            </IconButton>
          </Box>
        </Box>

        {/* Calendar Grid */}
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(7, 1fr)', 
          gap: { xs: 0.5, sm: 1 } 
        }}>
          {/* Day Headers */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <Typography 
              key={day} 
              variant="subtitle2" 
              align="center" 
              sx={{ 
                p: { xs: 0.5, sm: 1 }, 
                fontWeight: 'bold',
                fontSize: { xs: '0.75rem', sm: '0.875rem' }
              }}
            >
              {day}
            </Typography>
          ))}

          {/* Calendar Days */}
          {calendarDays.map((day, index) => {
            const dayEvents = getEventsForDate(day);
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isSelected = selectedDate && isSameDay(day, selectedDate);
            const isTodayDate = isToday(day);
            const isDisabled = isDateDisabled(day);

            return (
              <Paper
                key={index}
                sx={{
                  p: { xs: 0.5, sm: 1 },
                  minHeight: { xs: 60, sm: 80, md: 100 },
                  cursor: isDisabled ? 'not-allowed' : 'pointer',
                  opacity: isCurrentMonth ? 1 : 0.3,
                  backgroundColor: isSelected ? 'primary.light' : isTodayDate ? 'secondary.light' : 'transparent',
                  border: isTodayDate ? 2 : 1,
                  borderColor: isTodayDate ? 'primary.main' : 'divider',
                  '&:hover': {
                    backgroundColor: isDisabled ? 'transparent' : 'action.hover',
                  },
                  '&:active': {
                    transform: 'scale(0.98)',
                  },
                }}
                onClick={() => !isDisabled && handleDateClick(day)}
              >
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: isTodayDate ? 'bold' : 'normal',
                    color: isCurrentMonth ? 'text.primary' : 'text.secondary',
                    mb: { xs: 0.5, sm: 1 },
                    fontSize: { xs: '0.75rem', sm: '0.875rem' }
                  }}
                >
                  {format(day, 'd')}
                </Typography>

                {/* Events for this day */}
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: { xs: 0.25, sm: 0.5 },
                  maxHeight: { xs: 40, sm: 60, md: 80 },
                  overflow: 'hidden'
                }}>
                  {dayEvents.slice(0, window.innerWidth < 768 ? 2 : 3).map((event) => (
                    <Tooltip key={event.id} title={`${event.title} - ${event.time}`}>
                      <Chip
                        size="small"
                        label={event.title}
                        color={getEventColor(event) as any}
                        icon={getEventIcon(event)}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEventClick(event);
                        }}
                        sx={{ 
                          fontSize: { xs: '0.6rem', sm: '0.7rem' }, 
                          height: { xs: 16, sm: 20 },
                          '& .MuiChip-label': {
                            px: { xs: 0.5, sm: 1 }
                          }
                        }}
                      />
                    </Tooltip>
                  ))}
                  {dayEvents.length > (window.innerWidth < 768 ? 2 : 3) && (
                    <Typography 
                      variant="caption" 
                      color="text.secondary"
                      sx={{ fontSize: { xs: '0.6rem', sm: '0.7rem' } }}
                    >
                      +{dayEvents.length - (window.innerWidth < 768 ? 2 : 3)} more
                    </Typography>
                  )}
                </Box>
              </Paper>
            );
          })}
        </Box>
      </Paper>

      {/* Create Event Button */}
      {showCreateButton && selectedDate && !readOnly && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleCreateEvent}
            disabled={isDateDisabled(selectedDate)}
          >
            Create Event for {format(selectedDate, 'MMM dd, yyyy')}
          </Button>
        </Box>
      )}

      {/* Event Details Dialog */}
      <Dialog open={eventDialogOpen} onClose={() => setEventDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Event Details</DialogTitle>
        <DialogContent>
          {selectedEvent && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {getEventIcon(selectedEvent)}
                <Typography variant="h6">{selectedEvent.title}</Typography>
                <Chip
                  label={selectedEvent.status || selectedEvent.type}
                  color={getEventColor(selectedEvent) as any}
                  size="small"
                />
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Schedule sx={{ fontSize: 16 }} />
                <Typography variant="body2">
                  {format(selectedEvent.date, 'EEEE, MMMM dd, yyyy')} at {selectedEvent.time}
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

              {selectedEvent.patient && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Person sx={{ fontSize: 16 }} />
                  <Typography variant="body2">Patient: {selectedEvent.patient.name}</Typography>
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

      {/* Create Event Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Event</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              fullWidth
              label="Event Title"
              placeholder="Enter event title"
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
              />
            </Box>
            <FormControl fullWidth>
              <InputLabel>Event Type</InputLabel>
              <Select>
                <MenuItem value="appointment">Appointment</MenuItem>
                <MenuItem value="availability">Availability</MenuItem>
                <MenuItem value="blocked">Blocked Time</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Notes"
              multiline
              rows={3}
              placeholder="Enter any additional notes"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button variant="contained">Create Event</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Calendar;
