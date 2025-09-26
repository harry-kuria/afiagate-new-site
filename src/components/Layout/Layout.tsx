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
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  useMediaQuery,
  useTheme,
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
  Menu as MenuIcon,
  Close as CloseIcon,
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
  const [mobileDrawerOpen, setMobileDrawerOpen] = React.useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

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

  const handleMobileDrawerToggle = () => {
    setMobileDrawerOpen(!mobileDrawerOpen);
  };

  const handleMobileNavigation = (path: string) => {
    navigate(path);
    setMobileDrawerOpen(false);
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static" elevation={0} sx={{ backgroundColor: 'white', color: 'text.primary' }}>
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            {/* Mobile Menu Button */}
            {isMobile && (
              <IconButton
                edge="start"
                color="inherit"
                aria-label="menu"
                onClick={handleMobileDrawerToggle}
                sx={{ mr: 2 }}
              >
                <MenuIcon />
              </IconButton>
            )}

            {/* Logo */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer',
                mr: { xs: 2, md: 4 },
              }}
              onClick={() => navigate('/')}
            >
              <HospitalIcon sx={{ color: 'primary.main', fontSize: { xs: 28, md: 32 }, mr: 1 }} />
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  color: 'primary.main',
                  fontSize: { xs: '1.25rem', md: '1.5rem' },
                }}
              >
                Afiagate
              </Typography>
            </Box>

            {/* Desktop Navigation Links */}
            {!isMobile && (
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
            )}

            {/* Auth Section */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, md: 2 } }}>
              {isAuthenticated ? (
                <>
                  {!isMobile && (
                    <Chip
                      label={user?.role || 'User'}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  )}
                  <IconButton
                    size="large"
                    onClick={handleMenu}
                    color="inherit"
                    sx={{ p: { xs: 0.5, md: 1 } }}
                  >
                    <Avatar sx={{ width: { xs: 28, md: 32 }, height: { xs: 28, md: 32 }, bgcolor: 'primary.main' }}>
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
                    sx={{ 
                      fontWeight: 400,
                      fontSize: { xs: '0.875rem', md: '1rem' },
                      px: { xs: 1, md: 2 }
                    }}
                  >
                    Login
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => navigate('/register')}
                    sx={{ 
                      fontWeight: 500,
                      fontSize: { xs: '0.875rem', md: '1rem' },
                      px: { xs: 1, md: 2 }
                    }}
                  >
                    Register
                  </Button>
                </>
              )}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="left"
        open={mobileDrawerOpen}
        onClose={handleMobileDrawerToggle}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            width: 280,
            boxSizing: 'border-box',
          },
        }}
      >
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <HospitalIcon sx={{ color: 'primary.main', fontSize: 28, mr: 1 }} />
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
              Afiagate
            </Typography>
          </Box>
          <IconButton onClick={handleMobileDrawerToggle}>
            <CloseIcon />
          </IconButton>
        </Box>
        
        <Divider />
        
        <List sx={{ pt: 2 }}>
          <ListItem 
            component="div"
            onClick={() => handleMobileNavigation('/')}
            sx={{ 
              backgroundColor: isActive('/') ? 'primary.light' : 'transparent',
              cursor: 'pointer',
              '&:hover': { backgroundColor: 'primary.light' }
            }}
          >
            <ListItemIcon>
              <HospitalIcon color={isActive('/') ? 'primary' : 'inherit'} />
            </ListItemIcon>
            <ListItemText 
              primary="Home" 
              sx={{ color: isActive('/') ? 'primary.main' : 'inherit' }}
            />
          </ListItem>
          
          <ListItem 
            component="div"
            onClick={() => handleMobileNavigation('/doctors')}
            sx={{ 
              backgroundColor: isActive('/doctors') ? 'primary.light' : 'transparent',
              cursor: 'pointer',
              '&:hover': { backgroundColor: 'primary.light' }
            }}
          >
            <ListItemIcon>
              <PersonIcon color={isActive('/doctors') ? 'primary' : 'inherit'} />
            </ListItemIcon>
            <ListItemText 
              primary="Doctors" 
              sx={{ color: isActive('/doctors') ? 'primary.main' : 'inherit' }}
            />
          </ListItem>
          
          <ListItem 
            component="div"
            onClick={() => handleMobileNavigation('/facilities')}
            sx={{ 
              backgroundColor: isActive('/facilities') ? 'primary.light' : 'transparent',
              cursor: 'pointer',
              '&:hover': { backgroundColor: 'primary.light' }
            }}
          >
            <ListItemIcon>
              <HospitalIcon color={isActive('/facilities') ? 'primary' : 'inherit'} />
            </ListItemIcon>
            <ListItemText 
              primary="Facilities" 
              sx={{ color: isActive('/facilities') ? 'primary.main' : 'inherit' }}
            />
          </ListItem>
        </List>
        
        {isAuthenticated && (
          <>
            <Divider sx={{ my: 2 }} />
            <List>
              <ListItem component="div" onClick={() => handleMobileNavigation('/profile')} sx={{ cursor: 'pointer' }}>
                <ListItemIcon>
                  <AccountIcon />
                </ListItemIcon>
                <ListItemText primary="Profile" />
              </ListItem>
              
              <ListItem component="div" onClick={() => handleMobileNavigation('/appointments')} sx={{ cursor: 'pointer' }}>
                <ListItemIcon>
                  <HospitalIcon />
                </ListItemIcon>
                <ListItemText primary="My Appointments" />
              </ListItem>
              
              <ListItem component="div" onClick={() => handleMobileNavigation('/calendar')} sx={{ cursor: 'pointer' }}>
                <ListItemIcon>
                  <CalendarIcon />
                </ListItemIcon>
                <ListItemText primary="Calendar" />
              </ListItem>
              
              <ListItem component="div" onClick={() => handleMobileNavigation('/booking')} sx={{ cursor: 'pointer' }}>
                <ListItemIcon>
                  <BookingIcon />
                </ListItemIcon>
                <ListItemText primary="Book Appointment" />
              </ListItem>
              
              {canPostJobs && (
                <ListItem component="div" onClick={() => handleMobileNavigation('/jobs')} sx={{ cursor: 'pointer' }}>
                  <ListItemIcon>
                    <WorkIcon />
                  </ListItemIcon>
                  <ListItemText primary="Job Postings" />
                </ListItem>
              )}
              
              {isAdmin && (
                <ListItem component="div" onClick={() => handleMobileNavigation('/admin')} sx={{ cursor: 'pointer' }}>
                  <ListItemIcon>
                    <AdminPanelSettingsIcon />
                  </ListItemIcon>
                  <ListItemText primary="Admin Panel" />
                </ListItem>
              )}
              
              <ListItem component="div" onClick={handleLogout} sx={{ cursor: 'pointer' }}>
                <ListItemIcon>
                  <LogoutIcon />
                </ListItemIcon>
                <ListItemText primary="Logout" />
              </ListItem>
            </List>
          </>
        )}
        
        {!isAuthenticated && (
          <>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => handleMobileNavigation('/login')}
              >
                Login
              </Button>
              <Button
                variant="contained"
                fullWidth
                onClick={() => handleMobileNavigation('/register')}
              >
                Register
              </Button>
            </Box>
          </>
        )}
      </Drawer>

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