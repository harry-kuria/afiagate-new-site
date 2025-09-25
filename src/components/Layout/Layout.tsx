import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Chip,
} from '@mui/material';
import {
  LocalHospital as HospitalIcon,
  Person as PersonIcon,
  ExitToApp as LogoutIcon,
  AccountCircle as AccountIcon,
  Work as WorkIcon,
  AdminPanelSettings as AdminPanelSettingsIcon,
  CalendarToday as CalendarIcon,
  BookOnline as BookingIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout, isAdmin, canPostJobs } = useAuth();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    await logout();
    handleClose();
    navigate('/');
  };

  const handleProfile = () => {
    handleClose();
    navigate('/profile');
  };

  const handleAppointments = () => {
    handleClose();
    navigate('/appointments');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static" elevation={0} sx={{ backgroundColor: 'white', color: 'text.primary' }}>
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            {/* Logo */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer',
                mr: 4,
              }}
              onClick={() => navigate('/')}
            >
              <HospitalIcon sx={{ color: 'primary.main', fontSize: 32, mr: 1 }} />
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  color: 'primary.main',
                  fontSize: '1.5rem',
                }}
              >
                Afiagate
              </Typography>
            </Box>

            {/* Navigation Links */}
            <Box sx={{ flexGrow: 1, display: 'flex', gap: 2 }}>
              <Button
                color="inherit"
                onClick={() => navigate('/')}
                sx={{
                  fontWeight: isActive('/') ? 600 : 400,
                  borderBottom: isActive('/') ? '2px solid' : 'none',
                  borderColor: 'primary.main',
                }}
              >
                Home
              </Button>
              <Button
                color="inherit"
                onClick={() => navigate('/doctors')}
                sx={{
                  fontWeight: isActive('/doctors') ? 600 : 400,
                  borderBottom: isActive('/doctors') ? '2px solid' : 'none',
                  borderColor: 'primary.main',
                }}
              >
                Doctors
              </Button>
              <Button
                color="inherit"
                onClick={() => navigate('/facilities')}
                sx={{
                  fontWeight: isActive('/facilities') ? 600 : 400,
                  borderBottom: isActive('/facilities') ? '2px solid' : 'none',
                  borderColor: 'primary.main',
                }}
              >
                Facilities
              </Button>
            </Box>

            {/* Auth Section */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {isAuthenticated ? (
                <>
                  <Chip
                    label={user?.role || 'User'}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                  <IconButton
                    size="large"
                    onClick={handleMenu}
                    color="inherit"
                  >
                    <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                      {user?.full_name?.charAt(0) || <PersonIcon />}
                    </Avatar>
                  </IconButton>
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleClose}
                    PaperProps={{
                      sx: {
                        mt: 1,
                        minWidth: 200,
                      },
                    }}
                  >
                    <MenuItem onClick={handleProfile}>
                      <AccountIcon sx={{ mr: 1 }} />
                      Profile
                    </MenuItem>
                    <MenuItem onClick={handleAppointments}>
                      <HospitalIcon sx={{ mr: 1 }} />
                      My Appointments
                    </MenuItem>
                    <MenuItem onClick={() => { handleClose(); navigate('/calendar'); }}>
                      <CalendarIcon sx={{ mr: 1 }} />
                      Calendar
                    </MenuItem>
                    <MenuItem onClick={() => { handleClose(); navigate('/booking'); }}>
                      <BookingIcon sx={{ mr: 1 }} />
                      Book Appointment
                    </MenuItem>
                    {canPostJobs && (
                      <MenuItem onClick={() => { handleClose(); navigate('/jobs'); }}>
                        <WorkIcon sx={{ mr: 1 }} />
                        Job Postings
                      </MenuItem>
                    )}
                    {isAdmin && (
                      <MenuItem onClick={() => { handleClose(); navigate('/admin'); }}>
                        <AdminPanelSettingsIcon sx={{ mr: 1 }} />
                        Admin Panel
                      </MenuItem>
                    )}
                    <MenuItem onClick={handleLogout}>
                      <LogoutIcon sx={{ mr: 1 }} />
                      Logout
                    </MenuItem>
                  </Menu>
                </>
              ) : (
                <>
                  <Button
                    color="inherit"
                    onClick={() => navigate('/login')}
                    sx={{ fontWeight: 400 }}
                  >
                    Login
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => navigate('/register')}
                    sx={{ fontWeight: 500 }}
                  >
                    Register
                  </Button>
                </>
              )}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1 }}>
        {children}
      </Box>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          py: 3,
          px: 2,
          mt: 'auto',
          backgroundColor: 'grey.100',
          borderTop: '1px solid',
          borderColor: 'grey.300',
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="body2" color="text.secondary" align="center">
            © {new Date().getFullYear()} Afiagate Healthcare Platform. All rights reserved.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default Layout; 