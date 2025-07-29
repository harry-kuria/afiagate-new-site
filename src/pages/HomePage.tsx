import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Button,
  Box,
  Card,
  CardContent,
  CardActions,
  Chip,
  Paper,
  Stack,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  LocalHospital as HospitalIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon,
  LocationOn as LocationIcon,
  Favorite as HeartIcon,
  Star as StarIcon,
  AccessTime as TimeIcon,
  Phone as PhoneIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import doctorImage from '../assets/doctor.png';
import doctor2Image from '../assets/doctor2.png';
import appointmentImage from '../assets/appointment.png';
import calendarImage from '../assets/calendar.png';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [isVisible, setIsVisible] = useState(false);
  const [animateCards, setAnimateCards] = useState(false);
  const [animateServices, setAnimateServices] = useState(false);
  const [animateSpecialty, setAnimateSpecialty] = useState(false);
  const [animateSchedules, setAnimateSchedules] = useState(false);

  useEffect(() => {
    // Trigger animations on component mount
    setIsVisible(true);
    
    // Staggered animations for different sections
    const timer1 = setTimeout(() => setAnimateCards(true), 300);
    const timer2 = setTimeout(() => setAnimateServices(true), 600);
    const timer3 = setTimeout(() => setAnimateSpecialty(true), 900);
    const timer4 = setTimeout(() => setAnimateSchedules(true), 1200);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, []);

  const serviceCards = [
    {
      icon: <TimeIcon sx={{ fontSize: { xs: 30, md: 40 }, color: 'primary.main' }} />,
      title: 'Opening Hours',
      subtitle: '9:00AM - 12:00PM',
      description: 'Informatica Nederland',
      action: 'View Schedule',
      onClick: () => navigate('/facilities'),
    },
    {
      icon: <ScheduleIcon sx={{ fontSize: { xs: 30, md: 40 }, color: 'primary.main' }} />,
      title: 'Appointment',
      subtitle: 'Book Your Visit',
      description: 'Easy online booking system',
      action: 'Request',
      onClick: () => navigate('/doctors'),
    },
    {
      icon: <PersonIcon sx={{ fontSize: { xs: 30, md: 40 }, color: 'primary.main' }} />,
      title: 'Find Doctors',
      subtitle: 'Expert Healthcare',
      description: 'Connect with specialists',
      action: 'Doctors',
      onClick: () => navigate('/doctors'),
    },
    {
      icon: <LocationIcon sx={{ fontSize: { xs: 30, md: 40 }, color: 'primary.main' }} />,
      title: 'Find Locations',
      subtitle: 'Nearby Facilities',
      description: 'Locate healthcare centers',
      action: 'Locations',
      onClick: () => navigate('/facilities'),
    },
  ];

  const specialties = [
    { name: 'Eye Care', icon: '👁️' },
    { name: 'Cardiology', icon: '❤️' },
    { name: 'Medicine', icon: '💊' },
    { name: 'Dental', icon: '🦷' },
    { name: 'Orthopedic', icon: '🦴' },
  ];

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'white',
          color: 'text.primary',
          py: { xs: 4, md: 8 },
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Animated Fluid Shapes - Left Side */}
        <Box
          sx={{
            position: 'absolute',
            left: { xs: -50, md: -100 },
            top: -50,
            width: { xs: 200, md: 300 },
            height: { xs: 250, md: 400 },
            background: 'rgba(25, 118, 210, 0.08)',
            borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
            transform: 'rotate(-15deg)',
            zIndex: 1,
            animation: 'float 6s ease-in-out infinite',
            '@keyframes float': {
              '0%, 100%': { transform: 'rotate(-15deg) translateY(0px)' },
              '50%': { transform: 'rotate(-15deg) translateY(-20px)' },
            },
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            left: { xs: -30, md: -50 },
            bottom: { xs: -50, md: -100 },
            width: { xs: 150, md: 200 },
            height: { xs: 200, md: 300 },
            background: 'rgba(25, 118, 210, 0.06)',
            borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%',
            transform: 'rotate(25deg)',
            zIndex: 1,
            animation: 'float 8s ease-in-out infinite reverse',
            '@keyframes float': {
              '0%, 100%': { transform: 'rotate(25deg) translateY(0px)' },
              '50%': { transform: 'rotate(25deg) translateY(-15px)' },
            },
          }}
        />

        {/* Animated Fluid Shapes - Right Side */}
        <Box
          sx={{
            position: 'absolute',
            right: { xs: -40, md: -80 },
            top: { xs: 30, md: 50 },
            width: { xs: 180, md: 250 },
            height: { xs: 250, md: 350 },
            background: 'rgba(25, 118, 210, 0.1)',
            borderRadius: '40% 60% 60% 40% / 70% 30% 70% 30%',
            transform: 'rotate(45deg)',
            zIndex: 1,
            animation: 'float 7s ease-in-out infinite',
            '@keyframes float': {
              '0%, 100%': { transform: 'rotate(45deg) translateY(0px)' },
              '50%': { transform: 'rotate(45deg) translateY(-25px)' },
            },
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            right: { xs: -60, md: -120 },
            bottom: { xs: -30, md: -50 },
            width: { xs: 120, md: 180 },
            height: { xs: 180, md: 250 },
            background: 'rgba(25, 118, 210, 0.05)',
            borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
            transform: 'rotate(-30deg)',
            zIndex: 1,
            animation: 'float 9s ease-in-out infinite reverse',
            '@keyframes float': {
              '0%, 100%': { transform: 'rotate(-30deg) translateY(0px)' },
              '50%': { transform: 'rotate(-30deg) translateY(-18px)' },
            },
          }}
        />

        {/* Additional Small Animated Fluid Shapes */}
        <Box
          sx={{
            position: 'absolute',
            left: { xs: '10%', md: '20%' },
            top: { xs: '20%', md: '30%' },
            width: { xs: 50, md: 80 },
            height: { xs: 50, md: 80 },
            background: 'rgba(25, 118, 210, 0.08)',
            borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%',
            transform: 'rotate(60deg)',
            zIndex: 1,
            animation: 'pulse 4s ease-in-out infinite',
            '@keyframes pulse': {
              '0%, 100%': { opacity: 0.8, transform: 'rotate(60deg) scale(1)' },
              '50%': { opacity: 1, transform: 'rotate(60deg) scale(1.1)' },
            },
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            right: { xs: '15%', md: '25%' },
            bottom: { xs: '10%', md: '20%' },
            width: { xs: 40, md: 60 },
            height: { xs: 40, md: 60 },
            background: 'rgba(25, 118, 210, 0.06)',
            borderRadius: '70% 30% 30% 70% / 60% 40% 60% 40%',
            transform: 'rotate(-45deg)',
            zIndex: 1,
            animation: 'pulse 5s ease-in-out infinite reverse',
            '@keyframes pulse': {
              '0%, 100%': { opacity: 0.6, transform: 'rotate(-45deg) scale(1)' },
              '50%': { opacity: 1, transform: 'rotate(-45deg) scale(1.15)' },
            },
          }}
        />

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', md: 'row' },
            flexWrap: 'wrap', 
            alignItems: 'center', 
            gap: { xs: 3, md: 4 } 
          }}>
            <Box sx={{ 
              flex: { xs: '1 1 100%', md: '1 1 400px' }, 
              minWidth: 0,
              textAlign: { xs: 'center', md: 'left' },
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
              transition: 'opacity 0.8s ease-out, transform 0.8s ease-out',
            }}>
              <Chip
                label="MEDICAL"
                size="small"
                sx={{
                  backgroundColor: 'rgba(25, 118, 210, 0.1)',
                  color: 'primary.main',
                  mb: 2,
                  fontWeight: 500,
                  animation: 'slideInLeft 0.6s ease-out',
                  '@keyframes slideInLeft': {
                    '0%': { opacity: 0, transform: 'translateX(-30px)' },
                    '100%': { opacity: 1, transform: 'translateX(0)' },
                  },
                }}
              />
              <Typography
                variant="h2"
                sx={{
                  fontWeight: 700,
                  mb: 3,
                  fontSize: { xs: '2rem', sm: '2.5rem', md: '3.5rem' },
                  color: 'text.primary',
                  animation: 'fadeInUp 0.8s ease-out 0.2s both',
                  '@keyframes fadeInUp': {
                    '0%': { opacity: 0, transform: 'translateY(40px)' },
                    '100%': { opacity: 1, transform: 'translateY(0)' },
                  },
                }}
              >
                Healthcare Solutions
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  mb: 4,
                  color: 'text.secondary',
                  lineHeight: 1.6,
                  fontSize: { xs: '1rem', md: '1.25rem' },
                  animation: 'fadeInUp 0.8s ease-out 0.4s both',
                  '@keyframes fadeInUp': {
                    '0%': { opacity: 0, transform: 'translateY(40px)' },
                    '100%': { opacity: 1, transform: 'translateY(0)' },
                  },
                }}
              >
                Connect with the best healthcare professionals and facilities. 
                Book appointments, find specialists, and get the care you deserve.
              </Typography>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/doctors')}
                sx={{
                  backgroundColor: 'primary.main',
                  color: 'white',
                  px: { xs: 3, md: 4 },
                  py: { xs: 1, md: 1.5 },
                  fontSize: { xs: '1rem', md: '1.1rem' },
                  fontWeight: 600,
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    backgroundColor: 'primary.dark',
                    transform: 'translateY(-3px) scale(1.05)',
                    boxShadow: '0 12px 30px rgba(25, 118, 210, 0.4)',
                  },
                }}
              >
                Find Doctors
              </Button>
            </Box>
            <Box sx={{ 
              flex: { xs: '1 1 100%', md: '1 1 400px' }, 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              height: { xs: 300, md: 500 }, 
              position: 'relative',
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? 'translateX(0)' : 'translateX(30px)',
              transition: 'opacity 0.8s ease-out 0.3s, transform 0.8s ease-out 0.3s',
            }}>
              {/* Animated Blue incomplete circle background */}
              <Box
                sx={{
                  position: 'absolute',
                  right: { xs: '-10%', md: '-10%' },
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: { xs: '100%', md: '100%' },
                  height: { xs: '100%', md: '120%' },
                  background: 'rgb(25, 118, 210)',
                  borderRadius: '60% 40% 30% 50% / 60% 30% 60% 40%',
                  zIndex: 1,
                  animation: 'pulse 4s ease-in-out infinite',
                  '@keyframes pulse': {
                    '0%, 100%': { transform: 'translateY(-50%) scale(1)' },
                    '50%': { transform: 'translateY(-50%) scale(1.05)' },
                  },
                }}
              />
              
              <Box
                component="img"
                src={doctorImage}
                alt="Healthcare Professional"
                sx={{
                  maxWidth: { xs: '80%', md: '100%' },
                  maxHeight: { xs: '80%', md: '100%' },
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 10px 20px rgba(0, 0, 0, 0.1))',
                  position: 'relative',
                  zIndex: 2,
                  animation: 'float 3s ease-in-out infinite',
                  '@keyframes float': {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-10px)' },
                  },
                }}
              />
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Service Highlights */}
      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 8 } }}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          flexWrap: 'wrap', 
          gap: { xs: 2, md: 3 } 
        }}>
          {serviceCards.map((card, index) => (
            <Box key={index} sx={{ 
              flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: '1 1 250px' }, 
              minWidth: 0,
              opacity: animateCards ? 1 : 0,
              transform: animateCards ? 'translateY(0)' : 'translateY(50px)',
              transition: `opacity 0.6s ease-out ${index * 0.1}s, transform 0.6s ease-out ${index * 0.1}s`,
            }}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  backgroundColor: 'primary.main',
                  color: 'white',
                  '&:hover': {
                    transform: 'translateY(-12px) scale(1.03)',
                    boxShadow: '0 20px 40px rgba(25, 118, 210, 0.4)',
                  },
                }}
              >
                <CardContent sx={{ flexGrow: 1, textAlign: 'center', py: { xs: 3, md: 4 } }}>
                  <Box sx={{ 
                    mb: 2,
                    animation: 'pulse 2s ease-in-out infinite',
                    '@keyframes pulse': {
                      '0%, 100%': { transform: 'scale(1)' },
                      '50%': { transform: 'scale(1.1)' },
                    },
                  }}>
                    {card.icon}
                  </Box>
                  <Typography variant="h6" sx={{ 
                    fontWeight: 600, 
                    mb: 1, 
                    color: 'white',
                    fontSize: { xs: '1.1rem', md: '1.25rem' }
                  }}>
                    {card.title}
                  </Typography>
                  <Typography variant="body2" sx={{ 
                    mb: 1, 
                    color: 'rgba(255, 255, 255, 0.8)',
                    fontSize: { xs: '0.875rem', md: '1rem' }
                  }}>
                    {card.subtitle}
                  </Typography>
                  <Typography variant="caption" sx={{ 
                    color: 'rgba(255, 255, 255, 0.7)',
                    fontSize: { xs: '0.75rem', md: '0.875rem' }
                  }}>
                    {card.description}
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: 'center', pb: { xs: 2, md: 3 } }}>
                  <Button
                    variant="outlined"
                    sx={{
                      color: 'white',
                      borderColor: 'white',
                      fontSize: { xs: '0.875rem', md: '1rem' },
                      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        borderColor: 'white',
                        backgroundColor: 'rgba(255, 255, 255, 0.15)',
                        transform: 'scale(1.08)',
                        boxShadow: '0 8px 20px rgba(255, 255, 255, 0.3)',
                      },
                    }}
                    onClick={card.onClick}
                    size="small"
                  >
                    {card.action}
                  </Button>
                </CardActions>
              </Card>
            </Box>
          ))}
        </Box>
      </Container>

      {/* Medical Services Section */}
      <Box sx={{ backgroundColor: 'grey.50', py: { xs: 4, md: 8 }, position: 'relative', overflow: 'hidden' }}>
        {/* Animated Fluid Shapes for Services Section */}
        <Box
          sx={{
            position: 'absolute',
            left: { xs: -30, md: -50 },
            top: { xs: '10%', md: '20%' },
            width: { xs: 100, md: 150 },
            height: { xs: 130, md: 200 },
            background: 'rgba(25, 118, 210, 0.05)',
            borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
            transform: 'rotate(-20deg)',
            animation: 'float 10s ease-in-out infinite',
            '@keyframes float': {
              '0%, 100%': { transform: 'rotate(-20deg) translateY(0px)' },
              '50%': { transform: 'rotate(-20deg) translateY(-15px)' },
            },
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            right: { xs: -20, md: -30 },
            bottom: { xs: '20%', md: '30%' },
            width: { xs: 80, md: 120 },
            height: { xs: 100, md: 150 },
            background: 'rgba(25, 118, 210, 0.03)',
            borderRadius: '40% 60% 60% 40% / 70% 30% 70% 30%',
            transform: 'rotate(35deg)',
            animation: 'float 12s ease-in-out infinite reverse',
            '@keyframes float': {
              '0%, 100%': { transform: 'rotate(35deg) translateY(0px)' },
              '50%': { transform: 'rotate(35deg) translateY(-12px)' },
            },
          }}
        />

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
          <Box sx={{ 
            textAlign: 'center', 
            mb: { xs: 4, md: 6 },
            opacity: animateServices ? 1 : 0,
            transform: animateServices ? 'translateY(0)' : 'translateY(30px)',
            transition: 'opacity 0.8s ease-out, transform 0.8s ease-out',
          }}>
            <Chip
              label="SERVICE"
              size="small"
              sx={{ mb: 2 }}
            />
            <Typography variant="h3" sx={{ 
              fontWeight: 700, 
              mb: 2,
              fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' }
            }}>
              Our Medical Services
            </Typography>
          </Box>

          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', lg: 'row' },
            flexWrap: 'wrap', 
            alignItems: 'center', 
            gap: { xs: 4, md: 6 } 
          }}>
            <Box sx={{ 
              flex: { xs: '1 1 100%', lg: '1 1 400px' }, 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              height: { xs: 300, md: 400 },
              order: { xs: 2, lg: 1 },
              opacity: animateServices ? 1 : 0,
              transform: animateServices ? 'translateX(0)' : 'translateX(-50px)',
              transition: 'opacity 0.8s ease-out 0.3s, transform 0.8s ease-out 0.3s',
            }}>
              <Box
                sx={{
                  position: 'relative',
                  width: { xs: 250, md: 300 },
                  height: { xs: 250, md: 300 },
                }}
              >
                {/* Animated Doctor image */}
                <Box
                  component="img"
                  src={doctor2Image}
                  alt="Medical Professional"
                  sx={{
                    width: { xs: 200, sm: 300, md: 400 },
                    height: { xs: 200, sm: 300, md: 400 },
                    objectFit: 'contain',
                    filter: 'drop-shadow(0 8px 16px rgba(0, 0, 0, 0.1))',
                    animation: 'float 4s ease-in-out infinite',
                    '@keyframes float': {
                      '0%, 100%': { transform: 'translateY(0px)' },
                      '50%': { transform: 'translateY(-8px)' },
                    },
                  }}
                />
                
                {/* Animated Specialty icons around the doctor */}
                {specialties.map((specialty, index) => (
                  <Box
                    key={specialty.name}
                    sx={{
                      position: 'absolute',
                      width: { xs: 40, md: 60 },
                      height: { xs: 40, md: 60 },
                      borderRadius: '50%',
                      background: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: { xs: 16, md: 24 },
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                      animation: `bounce ${2 + index * 0.5}s ease-in-out infinite`,
                      '@keyframes bounce': {
                        '0%, 100%': { transform: 'translateY(0px)' },
                        '50%': { transform: 'translateY(-5px)' },
                      },
                      ...(index === 0 && { top: { xs: 10, md: 20 }, right: { xs: 50, md: 80 } }),
                      ...(index === 1 && { top: { xs: 60, md: 100 }, right: { xs: 10, md: 20 } }),
                      ...(index === 2 && { bottom: { xs: 60, md: 100 }, right: { xs: 10, md: 20 } }),
                      ...(index === 3 && { bottom: { xs: 10, md: 20 }, right: { xs: 50, md: 80 } }),
                      ...(index === 4 && { bottom: { xs: 30, md: 50 }, left: { xs: 10, md: 20 } }),
                    }}
                  >
                    {specialty.icon}
                  </Box>
                ))}
              </Box>
            </Box>
            <Box sx={{ 
              flex: { xs: '1 1 100%', lg: '1 1 400px' }, 
              minWidth: 0,
              order: { xs: 1, lg: 2 },
              textAlign: { xs: 'center', lg: 'left' },
              opacity: animateServices ? 1 : 0,
              transform: animateServices ? 'translateX(0)' : 'translateX(50px)',
              transition: 'opacity 0.8s ease-out 0.6s, transform 0.8s ease-out 0.6s',
            }}>
              <Typography variant="h4" sx={{ 
                fontWeight: 600, 
                mb: 3,
                fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' }
              }}>
                Dental Care Service
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ 
                mb: 4, 
                lineHeight: 1.7,
                fontSize: { xs: '0.875rem', md: '1rem' }
              }}>
                Experience world-class dental care with our team of experienced professionals. 
                We offer comprehensive dental services including routine checkups, cosmetic procedures, 
                and emergency dental care. Our state-of-the-art facilities ensure you receive the best treatment.
              </Typography>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/facilities')}
                sx={{ 
                  px: { xs: 3, md: 4 }, 
                  py: { xs: 1, md: 1.5 },
                  fontSize: { xs: '0.875rem', md: '1rem' },
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    transform: 'translateY(-3px) scale(1.05)',
                    boxShadow: '0 12px 30px rgba(25, 118, 210, 0.4)',
                  },
                }}
              >
                Learn More
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Speciality Section */}
      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 8 } }}>
        <Box sx={{ 
          textAlign: 'center', 
          mb: { xs: 4, md: 6 },
          opacity: animateSpecialty ? 1 : 0,
          transform: animateSpecialty ? 'translateY(0)' : 'translateY(30px)',
          transition: 'opacity 0.8s ease-out, transform 0.8s ease-out',
        }}>
          <Chip
            label="FEATURES"
            size="small"
            sx={{ mb: 2 }}
          />
          <Typography variant="h3" sx={{ 
            fontWeight: 700, 
            mb: 2,
            fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' }
          }}>
            Our Speciality
          </Typography>
        </Box>

        <Card
          sx={{
            background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
            color: 'white',
            p: { xs: 3, md: 4 },
            position: 'relative',
            overflow: 'hidden',
            opacity: animateSpecialty ? 1 : 0,
            transform: animateSpecialty ? 'scale(1)' : 'scale(0.95)',
            transition: 'opacity 0.8s ease-out 0.3s, transform 0.8s ease-out 0.3s',
          }}
        >
          {/* Animated Fluid Shapes for Speciality Section */}
          <Box
            sx={{
              position: 'absolute',
              right: { xs: -30, md: -50 },
              top: { xs: -20, md: -30 },
              width: { xs: 80, md: 120 },
              height: { xs: 80, md: 120 },
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '50%',
              animation: 'pulse 6s ease-in-out infinite',
              '@keyframes pulse': {
                '0%, 100%': { transform: 'scale(1)' },
                '50%': { transform: 'scale(1.1)' },
              },
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              left: { xs: -20, md: -30 },
              bottom: { xs: -15, md: -20 },
              width: { xs: 60, md: 80 },
              height: { xs: 60, md: 80 },
              background: 'rgba(255, 255, 255, 0.08)',
              borderRadius: '50%',
              animation: 'pulse 8s ease-in-out infinite reverse',
              '@keyframes pulse': {
                '0%, 100%': { transform: 'scale(1)' },
                '50%': { transform: 'scale(1.15)' },
              },
            }}
          />

          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', lg: 'row' },
            flexWrap: 'wrap', 
            alignItems: 'center', 
            gap: { xs: 3, md: 4 }, 
            position: 'relative', 
            zIndex: 2 
          }}>
            <Box sx={{ 
              flex: { xs: '1 1 100%', lg: '1 1 400px' }, 
              minWidth: 0,
              order: { xs: 2, lg: 1 },
              textAlign: { xs: 'center', lg: 'left' }
            }}>
              <Typography variant="h4" sx={{ 
                fontWeight: 600, 
                mb: 3,
                fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' }
              }}>
                Online Appointment
              </Typography>
              <Typography variant="body1" sx={{ 
                mb: 4, 
                opacity: 0.9, 
                lineHeight: 1.7,
                fontSize: { xs: '0.875rem', md: '1rem' }
              }}>
                Book your appointments online with ease. Our platform connects you directly with healthcare 
                professionals, eliminating the need for phone calls and long waiting times. 
                Get instant confirmation and reminders for your appointments.
              </Typography>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/doctors')}
                sx={{
                  backgroundColor: 'white',
                  color: 'primary.main',
                  px: { xs: 3, md: 4 },
                  py: { xs: 1, md: 1.5 },
                  fontSize: { xs: '0.875rem', md: '1rem' },
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    backgroundColor: 'grey.100',
                    transform: 'translateY(-3px) scale(1.05)',
                    boxShadow: '0 12px 30px rgba(255, 255, 255, 0.3)',
                  },
                }}
              >
                Learn More
              </Button>
            </Box>
            <Box sx={{ 
              flex: { xs: '1 1 100%', lg: '1 1 400px' }, 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              height: { xs: 200, md: 300 },
              order: { xs: 1, lg: 2 }
            }}>
              <Box
                component="img"
                src={appointmentImage}
                alt="Online Appointment"
                sx={{
                  maxWidth: { xs: '120%', md: '140%' },
                  maxHeight: { xs: '120%', md: '140%' },
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 10px 20px rgba(0, 0, 0, 0.1))',
                  animation: 'float 3s ease-in-out infinite',
                  '@keyframes float': {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-8px)' },
                  },
                }}
              />
            </Box>
          </Box>
        </Card>
      </Container>

      {/* Appointment Schedules Section */}
      <Box sx={{ backgroundColor: 'grey.50', py: { xs: 4, md: 8 }, position: 'relative', overflow: 'hidden' }}>
        {/* Animated Fluid Shapes for Schedules Section */}
        <Box
          sx={{
            position: 'absolute',
            right: { xs: -25, md: -40 },
            top: { xs: '5%', md: '10%' },
            width: { xs: 70, md: 100 },
            height: { xs: 80, md: 120 },
            background: 'rgba(25, 118, 210, 0.04)',
            borderRadius: '50%',
            animation: 'pulse 7s ease-in-out infinite',
            '@keyframes pulse': {
              '0%, 100%': { transform: 'scale(1)' },
              '50%': { transform: 'scale(1.1)' },
            },
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            left: { xs: -15, md: -20 },
            bottom: { xs: '10%', md: '20%' },
            width: { xs: 60, md: 80 },
            height: { xs: 70, md: 100 },
            background: 'rgba(25, 118, 210, 0.06)',
            borderRadius: '50%',
            animation: 'pulse 9s ease-in-out infinite reverse',
            '@keyframes pulse': {
              '0%, 100%': { transform: 'scale(1)' },
              '50%': { transform: 'scale(1.15)' },
            },
          }}
        />

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
          <Box sx={{ 
            textAlign: 'center', 
            mb: { xs: 4, md: 6 },
            opacity: animateSchedules ? 1 : 0,
            transform: animateSchedules ? 'translateY(0)' : 'translateY(30px)',
            transition: 'opacity 0.8s ease-out, transform 0.8s ease-out',
          }}>
            <Chip
              label="TIME TABLE"
              size="small"
              sx={{ mb: 2 }}
            />
            <Typography variant="h3" sx={{ 
              fontWeight: 700, 
              mb: 2,
              fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' }
            }}>
              Appointment Schedules
            </Typography>
          </Box>

          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', lg: 'row' },
            flexWrap: 'wrap', 
            alignItems: 'center', 
            gap: { xs: 4, md: 6 } 
          }}>
            <Box sx={{ 
              flex: { xs: '1 1 100%', lg: '1 1 400px' }, 
              minWidth: 0,
              order: { xs: 2, lg: 1 },
              textAlign: { xs: 'center', lg: 'left' },
              opacity: animateSchedules ? 1 : 0,
              transform: animateSchedules ? 'translateX(0)' : 'translateX(-50px)',
              transition: 'opacity 0.8s ease-out 0.3s, transform 0.8s ease-out 0.3s',
            }}>
              <Typography variant="body1" color="text.secondary" sx={{ 
                mb: 4, 
                lineHeight: 1.7,
                fontSize: { xs: '0.875rem', md: '1rem' }
              }}>
                View and manage your appointment schedules with our comprehensive calendar system. 
                Check available time slots, reschedule appointments, and receive timely reminders. 
                Our flexible scheduling system accommodates your busy lifestyle.
              </Typography>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/appointments')}
                sx={{ 
                  px: { xs: 3, md: 4 }, 
                  py: { xs: 1, md: 1.5 },
                  fontSize: { xs: '0.875rem', md: '1rem' },
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    transform: 'translateY(-3px) scale(1.05)',
                    boxShadow: '0 12px 30px rgba(25, 118, 210, 0.4)',
                  },
                }}
              >
                Schedules
              </Button>
            </Box>
            <Box sx={{ 
              flex: { xs: '1 1 100%', lg: '1 1 400px' }, 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              height: { xs: 250, md: 400 },
              order: { xs: 1, lg: 2 },
              opacity: animateSchedules ? 1 : 0,
              transform: animateSchedules ? 'translateX(0)' : 'translateX(50px)',
              transition: 'opacity 0.8s ease-out 0.6s, transform 0.8s ease-out 0.6s',
            }}>
              <Box
                component="img"
                src={calendarImage}
                alt="Appointment Calendar"
                sx={{
                  maxWidth: { xs: '120%', md: '140%' },
                  maxHeight: { xs: '120%', md: '140%' },
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 10px 20px rgba(0, 0, 0, 0.1))',
                  animation: 'float 3s ease-in-out infinite',
                  '@keyframes float': {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-8px)' },
                  },
                }}
              />
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default HomePage; 