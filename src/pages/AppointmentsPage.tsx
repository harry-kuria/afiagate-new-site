import React from 'react';
import { Container, Typography, Box, Alert } from '@mui/material';

const AppointmentsPage: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Alert severity="info">
        Appointments page is under development. This will show user's appointment history and allow them to manage appointments.
      </Alert>
    </Container>
  );
};

export default AppointmentsPage; 