import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  CardActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Rating,
  Pagination,
  Alert,
  InputAdornment,
  Skeleton,
} from '@mui/material';
import {
  Search as SearchIcon,
  LocationOn as LocationIcon,
  LocalHospital as HospitalIcon,
  Phone as PhoneIcon,
  AccessTime as TimeIcon,
  Emergency as EmergencyIcon,
  ViewList as ListIcon,
  Map as MapIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { Facility } from '../types';
import { connectApiService } from '../services/connectApi';
import Map from '../components/Map/Map';
import LocationPicker from '../components/Map/LocationPicker';

const FacilitiesPage: React.FC = () => {
  const navigate = useNavigate();
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [facilityType, setFacilityType] = useState('');
  const [location, setLocation] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalFacilities, setTotalFacilities] = useState(0);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [locationPickerOpen, setLocationPickerOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  const facilityTypes = [
    'Hospital',
    'Clinic',
    'Medical Center',
    'Laboratory',
    'Pharmacy',
    'Dental Clinic',
    'Eye Clinic',
    'Specialty Center',
  ];

  const locations = [
    'Nairobi',
    'Mombasa',
    'Kisumu',
    'Nakuru',
    'Eldoret',
    'Thika',
    'Nyeri',
    'Kakamega',
  ];

  const fetchFacilities = useCallback(async () => {
    try {
      if (!isInitialLoad) {
        setLoading(true);
      }
      setError(null);
      
      const response = await connectApiService.getFacilities({
        page,
        limit: 12,
        type: facilityType || '',
        location: location || '',
      });
      
      setFacilities(response.data);
      setTotalPages(Math.ceil(response.total / 12));
      setTotalFacilities(response.total);
      setIsInitialLoad(false);
    } catch (err) {
      setError('Failed to fetch facilities. Please try again.');
      console.error('Error fetching facilities:', err);
    } finally {
      setLoading(false);
    }
  }, [page, facilityType, location, isInitialLoad]);

  // Preload data on component mount
  useEffect(() => {
    // Preload facilities data immediately
    fetchFacilities();
    
    // Preload next page data in background
    const preloadNextPage = setTimeout(() => {
      if (page < totalPages) {
        connectApiService.getFacilities({
          page: page + 1,
          limit: 12,
          type: facilityType || '',
          location: location || '',
        }).catch(() => {}); // Silent preload
      }
    }, 1000);
    
    return () => clearTimeout(preloadNextPage);
  }, [fetchFacilities, page, facilityType, location, totalPages]);

  useEffect(() => {
    if (!isInitialLoad) {
      fetchFacilities();
    }
  }, [page, searchTerm, facilityType, location, fetchFacilities, isInitialLoad]);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(1);
  };

  const handleFacilityTypeChange = (event: any) => {
    setFacilityType(event.target.value);
    setPage(1);
  };

  const handleLocationChange = (event: any) => {
    setLocation(event.target.value);
    setPage(1);
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const handleLocationSelect = (location: any) => {
    setSelectedLocation(location.position);
    setLocation(location.name);
    setLocationPickerOpen(false);
  };

  const getMapMarkers = () => {
    return facilities.map(facility => ({
      id: facility.id,
      position: {
        lat: facility.latitude || 6.5244,
        lng: facility.longitude || 3.3792
      },
      title: facility.name,
      info: `${facility.address}\n${facility.phone}`,
      type: 'hospital' as const
    }));
  };

  const handleViewFacility = (facilityId: string) => {
    navigate(`/facilities/${facilityId}`);
  };

  const filteredFacilities = (facilities || []).filter(facility =>
    facility.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    facility.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    facility.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4 }}>
      {Array.from({ length: 6 }).map((_, index) => (
        <Box key={index} sx={{ flex: '1 1 350px', minWidth: 0 }}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flexGrow: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                <Skeleton variant="circular" width={32} height={32} sx={{ mr: 2 }} />
                <Box sx={{ flexGrow: 1 }}>
                  <Skeleton variant="text" width="70%" height={32} sx={{ mb: 0.5 }} />
                  <Skeleton variant="text" width="40%" height={24} sx={{ mb: 1 }} />
                  <Skeleton variant="text" width="30%" height={20} sx={{ mb: 1 }} />
                </Box>
              </Box>
              <Skeleton variant="text" width="60%" height={20} sx={{ mb: 2 }} />
              <Skeleton variant="text" width="80%" height={20} sx={{ mb: 2 }} />
              <Skeleton variant="text" width="50%" height={20} sx={{ mb: 2 }} />
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                <Skeleton variant="rectangular" width={60} height={24} />
                <Skeleton variant="rectangular" width={60} height={24} />
              </Box>
            </CardContent>
            <CardActions sx={{ justifyContent: 'center', pb: 3 }}>
              <Skeleton variant="rectangular" width="100%" height={40} />
            </CardActions>
          </Card>
        </Box>
      ))}
    </Box>
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography variant="h3" sx={{ fontWeight: 700, mb: 2 }}>
          Healthcare Facilities
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Find and book healthcare facilities near you
        </Typography>
        <Box display="flex" justifyContent="center" gap={1} sx={{ mt: 3 }}>
          <Button
            variant={viewMode === 'list' ? 'contained' : 'outlined'}
            startIcon={<ListIcon />}
            onClick={() => setViewMode('list')}
          >
            List View
          </Button>
          <Button
            variant={viewMode === 'map' ? 'contained' : 'outlined'}
            startIcon={<MapIcon />}
            onClick={() => setViewMode('map')}
          >
            Map View
          </Button>
        </Box>
      </Box>

      {/* Search and Filters */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
            <TextField
              fullWidth
              placeholder="Search facilities by name, type, or location..."
              value={searchTerm}
              onChange={handleSearch}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Box>
          <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
            <FormControl fullWidth>
              <InputLabel>Facility Type</InputLabel>
              <Select
                value={facilityType}
                label="Facility Type"
                onChange={handleFacilityTypeChange}
              >
                <MenuItem value="">All Types</MenuItem>
                {facilityTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
            <FormControl fullWidth>
              <InputLabel>Location</InputLabel>
              <Select
                value={location}
                label="Location"
                onChange={handleLocationChange}
              >
                <MenuItem value="">All Locations</MenuItem>
                {locations.map((loc) => (
                  <MenuItem key={loc} value={loc}>
                    {loc}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Box>
      </Box>

      {/* Results Summary */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          {loading ? <Skeleton width={140} /> : `${totalFacilities} facilities found`}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {loading ? <Skeleton width={80} /> : `Page ${page} of ${totalPages}`}
        </Typography>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Loading State */}
      {loading && isInitialLoad ? (
        <LoadingSkeleton />
      ) : (
        <>
          {/* Map View */}
          {viewMode === 'map' ? (
            <Box sx={{ mb: 4 }}>
              <Map
                center={selectedLocation || { lat: 6.5244, lng: 3.3792 }}
                zoom={12}
                markers={getMapMarkers()}
                height="500px"
              />
            </Box>
          ) : (
            /* Facilities Grid */
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4 }}>
            {filteredFacilities.map((facility) => (
              <Box key={facility.id} sx={{ flex: '1 1 350px', minWidth: 0 }}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
                    },
                  }}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                      <HospitalIcon sx={{ color: 'primary.main', fontSize: 32, mr: 2 }} />
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                          {facility.name}
                        </Typography>
                        <Typography variant="body2" color="primary" sx={{ mb: 1 }}>
                          {facility.type}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Rating value={facility.rating} readOnly size="small" />
                          <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
                            ({facility.rating})
                          </Typography>
                        </Box>
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <LocationIcon sx={{ fontSize: 16, color: 'text.secondary', mr: 0.5 }} />
                      <Typography variant="body2" color="text.secondary">
                        {facility.location}
                      </Typography>
                    </Box>

                    {facility.services && Array.isArray(facility.services) && facility.services.length > 0 && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                          Services:
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {facility.services.slice(0, 3).map((service, index) => (
                            <Chip
                              key={index}
                              label={service}
                              size="small"
                              variant="outlined"
                            />
                          ))}
                          {facility.services.length > 3 && (
                            <Chip
                              label={`+${facility.services.length - 3} more`}
                              size="small"
                              variant="outlined"
                            />
                          )}
                        </Box>
                      </Box>
                    )}

                    {facility.operating_hours && (
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <TimeIcon sx={{ fontSize: 16, color: 'text.secondary', mr: 0.5 }} />
                        <Typography variant="body2" color="text.secondary">
                          {facility.operating_hours}
                        </Typography>
                      </Box>
                    )}

                    {facility.phone_number && (
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <PhoneIcon sx={{ fontSize: 16, color: 'text.secondary', mr: 0.5 }} />
                        <Typography variant="body2" color="text.secondary">
                          {facility.phone_number}
                        </Typography>
                      </Box>
                    )}

                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                      {facility.specialties && Array.isArray(facility.specialties) && facility.specialties.slice(0, 2).map((specialty, index) => (
                        <Chip
                          key={index}
                          label={specialty}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      ))}
                      {facility.is_emergency && (
                        <Chip
                          label="Emergency"
                          size="small"
                          color="error"
                          icon={<EmergencyIcon />}
                        />
                      )}
                    </Box>
                  </CardContent>
                  <CardActions sx={{ justifyContent: 'center', pb: 3 }}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => handleViewFacility(facility.id)}
                      fullWidth
                    >
                      Contact the Hospital
                    </Button>
                  </CardActions>
                </Card>
              </Box>
            ))}
          </Box>
          )}

          {/* No Results */}
          {filteredFacilities.length === 0 && !loading && (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <HospitalIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                No facilities found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Try adjusting your search criteria or filters
              </Typography>
            </Box>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={handlePageChange}
                color="primary"
                size="large"
              />
            </Box>
          )}
        </>
      )}

      {/* Location Picker Dialog */}
      <LocationPicker
        open={locationPickerOpen}
        onClose={() => setLocationPickerOpen(false)}
        onLocationSelect={handleLocationSelect}
        currentLocation={selectedLocation || undefined}
      />
    </Container>
  );
};

export default FacilitiesPage; 