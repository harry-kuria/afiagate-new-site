import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  CheckCircle,
  Cancel,
  Visibility,
  PersonAdd,
  Work,
  Assessment,
  AdminPanelSettings,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { connectApiService } from '../services/connectApi';

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
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const AdminPanel: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // User verification data
  const [pendingUsers, setPendingUsers] = useState<any[]>([]);
  const [userStats, setUserStats] = useState<any>(null);
  
  // Caregiver bookings data
  const [caregiverBookings, setCaregiverBookings] = useState<any[]>([]);
  
  // Dialog states
  const [verifyDialogOpen, setVerifyDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    if (!isAdmin) {
      setError('Access denied. Admin privileges required.');
      return;
    }
    loadAdminData();
  }, [isAdmin]);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load pending verifications
      const pendingResponse = await connectApiService.getPendingVerifications();
      setPendingUsers(pendingResponse.data || []);
      
      // Load user statistics
      const statsResponse = await connectApiService.getUserStats();
      setUserStats(statsResponse);
      
      // Load caregiver bookings
      const bookingsResponse = await connectApiService.getCaregiverBookings();
      setCaregiverBookings(bookingsResponse.data || []);
      
    } catch (err) {
      setError('Failed to load admin data');
      console.error('Admin data loading error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyUser = async (userId: string) => {
    try {
      await connectApiService.verifyUser(userId);
      setVerifyDialogOpen(false);
      loadAdminData(); // Refresh data
    } catch (err) {
      setError('Failed to verify user');
    }
  };

  const handleRejectUser = async (userId: string) => {
    try {
      await connectApiService.rejectUser(userId, rejectReason);
      setVerifyDialogOpen(false);
      setRejectReason('');
      loadAdminData(); // Refresh data
    } catch (err) {
      setError('Failed to reject user');
    }
  };

  const handleApproveBooking = async (bookingId: string) => {
    try {
      await connectApiService.approveCaregiverBooking(bookingId);
      loadAdminData(); // Refresh data
    } catch (err) {
      setError('Failed to approve booking');
    }
  };

  const handleRejectBooking = async (bookingId: string) => {
    try {
      await connectApiService.rejectCaregiverBooking(bookingId, 'Admin rejection');
      loadAdminData(); // Refresh data
    } catch (err) {
      setError('Failed to reject booking');
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  if (!isAdmin) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">Access denied. Admin privileges required.</Alert>
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

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          <AdminPanelSettings sx={{ mr: 2, verticalAlign: 'middle' }} />
          Admin Panel
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage users, verify accounts, and oversee caregiver bookings
        </Typography>
      </Box>

      {/* Statistics Cards */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 3, mb: 4 }}>
        <Box sx={{ flex: 1 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <PersonAdd sx={{ mr: 2, color: 'primary.main' }} />
                <Box>
                  <Typography variant="h4">{userStats?.total_users || 0}</Typography>
                  <Typography variant="body2" color="text.secondary">Total Users</Typography>
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
                  <Typography variant="h4">{userStats?.verified_users || 0}</Typography>
                  <Typography variant="body2" color="text.secondary">Verified Users</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
        <Box sx={{ flex: 1 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Assessment sx={{ mr: 2, color: 'warning.main' }} />
                <Box>
                  <Typography variant="h4">{userStats?.pending_users || 0}</Typography>
                  <Typography variant="body2" color="text.secondary">Pending Verification</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
        <Box sx={{ flex: 1 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Work sx={{ mr: 2, color: 'info.main' }} />
                <Box>
                  <Typography variant="h4">{userStats?.caregivers || 0}</Typography>
                  <Typography variant="body2" color="text.secondary">Caregivers</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Admin Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="Pending Verifications" />
            <Tab label="Caregiver Bookings" />
            <Tab label="User Statistics" />
          </Tabs>
        </Box>

        {/* Pending Verifications Tab */}
        <TabPanel value={tabValue} index={0}>
          <Typography variant="h6" gutterBottom>
            Users Pending Verification ({pendingUsers.length})
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Location</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pendingUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.full_name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Chip label={user.role} color="primary" size="small" />
                    </TableCell>
                    <TableCell>{user.location || 'Not specified'}</TableCell>
                    <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Tooltip title="Verify User">
                        <IconButton
                          color="success"
                          onClick={() => {
                            setSelectedUser(user);
                            setVerifyDialogOpen(true);
                          }}
                        >
                          <CheckCircle />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Reject User">
                        <IconButton
                          color="error"
                          onClick={() => {
                            setSelectedUser(user);
                            setVerifyDialogOpen(true);
                          }}
                        >
                          <Cancel />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Caregiver Bookings Tab */}
        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>
            Caregiver Bookings ({caregiverBookings.length})
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Patient</TableCell>
                  <TableCell>Caregiver</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Time</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {caregiverBookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell>{booking.patient_name}</TableCell>
                    <TableCell>{booking.provider_name}</TableCell>
                    <TableCell>{new Date(booking.appointment_date).toLocaleDateString()}</TableCell>
                    <TableCell>{booking.appointment_time}</TableCell>
                    <TableCell>
                      <Chip 
                        label={booking.status} 
                        color={booking.status === 'pending' ? 'warning' : 'success'} 
                        size="small" 
                      />
                    </TableCell>
                    <TableCell>
                      {booking.status === 'pending' && (
                        <>
                          <Tooltip title="Approve Booking">
                            <IconButton
                              color="success"
                              onClick={() => handleApproveBooking(booking.id)}
                            >
                              <CheckCircle />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Reject Booking">
                            <IconButton
                              color="error"
                              onClick={() => handleRejectBooking(booking.id)}
                            >
                              <Cancel />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* User Statistics Tab */}
        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>
            User Statistics
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 3, flexWrap: 'wrap' }}>
            <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" color="primary">Patients</Typography>
                  <Typography variant="h3">{userStats?.patients || 0}</Typography>
                </CardContent>
              </Card>
            </Box>
            <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" color="primary">Doctors</Typography>
                  <Typography variant="h3">{userStats?.doctors || 0}</Typography>
                </CardContent>
              </Card>
            </Box>
            <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" color="primary">Nurses</Typography>
                  <Typography variant="h3">{userStats?.nurses || 0}</Typography>
                </CardContent>
              </Card>
            </Box>
            <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" color="primary">Caregivers</Typography>
                  <Typography variant="h3">{userStats?.caregivers || 0}</Typography>
                </CardContent>
              </Card>
            </Box>
            <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" color="primary">Facilities</Typography>
                  <Typography variant="h3">{userStats?.facilities || 0}</Typography>
                </CardContent>
              </Card>
            </Box>
          </Box>
        </TabPanel>
      </Card>

      {/* Verification Dialog */}
      <Dialog open={verifyDialogOpen} onClose={() => setVerifyDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Verify User</DialogTitle>
        <DialogContent>
          {selectedUser && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="body1">
                <strong>Name:</strong> {selectedUser.full_name}
              </Typography>
              <Typography variant="body1">
                <strong>Email:</strong> {selectedUser.email}
              </Typography>
              <Typography variant="body1">
                <strong>Role:</strong> {selectedUser.role}
              </Typography>
              <Typography variant="body1">
                <strong>Location:</strong> {selectedUser.location || 'Not specified'}
              </Typography>
            </Box>
          )}
          <TextField
            fullWidth
            label="Rejection Reason (if rejecting)"
            multiline
            rows={3}
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setVerifyDialogOpen(false)}>Cancel</Button>
          <Button 
            color="error" 
            onClick={() => selectedUser && handleRejectUser(selectedUser.id)}
          >
            Reject
          </Button>
          <Button 
            color="success" 
            variant="contained"
            onClick={() => selectedUser && handleVerifyUser(selectedUser.id)}
          >
            Verify
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminPanel;
