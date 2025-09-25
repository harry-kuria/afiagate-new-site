import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Chip,
  Divider
} from '@mui/material';
import {
  LocationOn,
  Search,
  LocalHospital,
  LocalPharmacy,
  LocalHospital as LocalClinic
} from '@mui/icons-material';
import Map from './Map';

interface Location {
  id: string;
  name: string;
  address: string;
  position: {
    lat: number;
    lng: number;
  };
  type: 'hospital' | 'clinic' | 'pharmacy' | 'other';
  distance?: number;
}

interface LocationPickerProps {
  open: boolean;
  onClose: () => void;
  onLocationSelect: (location: Location) => void;
  currentLocation?: {
    lat: number;
    lng: number;
  };
  searchRadius?: number; // in kilometers
}

const LocationPicker: React.FC<LocationPickerProps> = ({
  open,
  onClose,
  onLocationSelect,
  currentLocation,
  searchRadius = 10
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [searchResults, setSearchResults] = useState<Location[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mapCenter, setMapCenter] = useState({
    lat: currentLocation?.lat || 6.5244, // Default to Lagos, Nigeria
    lng: currentLocation?.lng || 3.3792
  });

  // Sample healthcare facilities data (in a real app, this would come from an API)
  const sampleFacilities: Location[] = [
    {
      id: '1',
      name: 'Lagos University Teaching Hospital',
      address: 'Idi-Araba, Surulere, Lagos',
      position: { lat: 6.5244, lng: 3.3792 },
      type: 'hospital'
    },
    {
      id: '2',
      name: 'Eko Hospital',
      address: '31 Mobolaji Bank Anthony Way, Ikeja, Lagos',
      position: { lat: 6.6018, lng: 3.3515 },
      type: 'hospital'
    },
    {
      id: '3',
      name: 'Lagoon Hospital',
      address: '8 Bourdillon Rd, Ikoyi, Lagos',
      position: { lat: 6.4474, lng: 3.4203 },
      type: 'hospital'
    },
    {
      id: '4',
      name: 'St. Nicholas Hospital',
      address: '57 Campbell St, Lagos Island, Lagos',
      position: { lat: 6.4541, lng: 3.3947 },
      type: 'hospital'
    },
    {
      id: '5',
      name: 'Medplus Pharmacy',
      address: '123 Allen Avenue, Ikeja, Lagos',
      position: { lat: 6.6018, lng: 3.3515 },
      type: 'pharmacy'
    }
  ];

  useEffect(() => {
    if (currentLocation) {
      setMapCenter(currentLocation);
    }
  }, [currentLocation]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Simulate API call - in real app, this would call Google Places API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const filtered = sampleFacilities.filter(facility =>
        facility.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        facility.address.toLowerCase().includes(searchQuery.toLowerCase())
      );

      // Calculate distances if current location is available
      const resultsWithDistance = filtered.map(facility => {
        if (currentLocation) {
          const distance = calculateDistance(
            currentLocation.lat,
            currentLocation.lng,
            facility.position.lat,
            facility.position.lng
          );
          return { ...facility, distance };
        }
        return facility;
      });

      // Sort by distance if available
      const sortedResults = resultsWithDistance.sort((a, b) => {
        if (a.distance && b.distance) {
          return a.distance - b.distance;
        }
        return 0;
      });

      setSearchResults(sortedResults);
    } catch (err) {
      setError('Failed to search locations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const handleLocationClick = (location: Location) => {
    setSelectedLocation(location);
    setMapCenter(location.position);
  };

  const handleConfirmSelection = () => {
    if (selectedLocation) {
      onLocationSelect(selectedLocation);
      onClose();
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'hospital':
        return <LocalHospital color="error" />;
      case 'clinic':
        return <LocalClinic color="primary" />;
      case 'pharmacy':
        return <LocalPharmacy color="success" />;
      default:
        return <LocationOn color="action" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'hospital':
        return 'error';
      case 'clinic':
        return 'primary';
      case 'pharmacy':
        return 'success';
      default:
        return 'default';
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <LocationOn color="primary" />
          <Typography variant="h6">Select Location</Typography>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <Box display="flex" gap={1} sx={{ mb: 2 }}>
            <TextField
              fullWidth
              placeholder="Search for hospitals, clinics, pharmacies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
            <Button
              variant="contained"
              onClick={handleSearch}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <Search />}
            >
              Search
            </Button>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {searchResults.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Search Results ({searchResults.length})
              </Typography>
              <Box sx={{ maxHeight: 200, overflow: 'auto' }}>
                {searchResults.map((location) => (
                  <Box
                    key={location.id}
                    onClick={() => handleLocationClick(location)}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      p: 2,
                      borderRadius: 1,
                      mb: 0.5,
                      cursor: 'pointer',
                      border: selectedLocation?.id === location.id ? '2px solid' : '1px solid',
                      borderColor: selectedLocation?.id === location.id ? 'primary.main' : 'divider',
                      backgroundColor: selectedLocation?.id === location.id ? 'primary.light' : 'transparent',
                      '&:hover': {
                        backgroundColor: selectedLocation?.id === location.id ? 'primary.light' : 'action.hover'
                      }
                    }}
                  >
                    <Box sx={{ mr: 2 }}>
                      {getTypeIcon(location.type)}
                    </Box>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="body1" fontWeight="medium">
                        {location.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {location.address}
                      </Typography>
                      {location.distance && (
                        <Chip
                          size="small"
                          label={`${location.distance.toFixed(1)} km away`}
                          color="primary"
                          variant="outlined"
                          sx={{ mt: 0.5 }}
                        />
                      )}
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          )}

          <Divider sx={{ my: 2 }} />

          <Box sx={{ height: '400px' }}>
            <Map
              center={mapCenter}
              zoom={13}
              markers={searchResults.map(location => ({
                id: location.id,
                position: location.position,
                title: location.name,
                info: location.address,
                type: location.type
              }))}
              onMarkerClick={handleLocationClick}
              height="100%"
            />
          </Box>

          {selectedLocation && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Selected Location:
              </Typography>
              <Box display="flex" alignItems="center" gap={1}>
                {getTypeIcon(selectedLocation.type)}
                <Box>
                  <Typography variant="body1" fontWeight="medium">
                    {selectedLocation.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedLocation.address}
                  </Typography>
                  <Chip
                    size="small"
                    label={selectedLocation.type}
                    color={getTypeColor(selectedLocation.type) as any}
                    sx={{ mt: 0.5 }}
                  />
                </Box>
              </Box>
            </Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleConfirmSelection}
          variant="contained"
          disabled={!selectedLocation}
        >
          Select Location
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LocationPicker;
