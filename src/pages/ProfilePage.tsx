import React from 'react';
import { Container, Typography, Box, Alert } from '@mui/material';

const ProfilePage: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Alert severity="info">
        Profile page is under development. This will allow users to view and edit their profile information.
      </Alert>
    </Container>
  );
};

export default ProfilePage; 