import React, { useEffect, useRef, useState } from 'react';
import { Box, Typography, Alert, CircularProgress } from '@mui/material';
import { Wrapper, Status } from '@googlemaps/react-wrapper';

interface MapProps {
  center: {
    lat: number;
    lng: number;
  };
  zoom: number;
  markers?: Array<{
    id: string;
    position: {
      lat: number;
      lng: number;
    };
    title: string;
    info?: string;
    type?: 'hospital' | 'clinic' | 'pharmacy' | 'other';
  }>;
  onMarkerClick?: (marker: any) => void;
  height?: string;
  className?: string;
}

const MapComponent: React.FC<MapProps> = ({
  center,
  zoom,
  markers = [],
  onMarkerClick,
  height = '400px',
  className
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [mapMarkers, setMapMarkers] = useState<google.maps.Marker[]>([]);

  useEffect(() => {
    if (mapRef.current && !map) {
      const newMap = new google.maps.Map(mapRef.current, {
        center,
        zoom,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'on' }]
          }
        ]
      });
      setMap(newMap);
    }
  }, [center, zoom, map]);

  useEffect(() => {
    if (map && markers.length > 0) {
      // Clear existing markers
      mapMarkers.forEach(marker => marker.setMap(null));
      
      const newMarkers: google.maps.Marker[] = [];
      
      markers.forEach(markerData => {
        const marker = new google.maps.Marker({
          position: markerData.position,
          map,
          title: markerData.title,
          icon: getMarkerIcon(markerData.type || 'other')
        });

        // Add click listener
        if (onMarkerClick) {
          marker.addListener('click', () => {
            onMarkerClick(markerData);
          });
        }

        // Add info window if info is provided
        if (markerData.info) {
          const infoWindow = new google.maps.InfoWindow({
            content: `
              <div style="padding: 8px;">
                <h3 style="margin: 0 0 8px 0; color: #1976d2;">${markerData.title}</h3>
                <p style="margin: 0; color: #666;">${markerData.info}</p>
              </div>
            `
          });
          
          marker.addListener('click', () => {
            infoWindow.open(map, marker);
          });
        }

        newMarkers.push(marker);
      });
      
      setMapMarkers(newMarkers);
    }
  }, [map, markers, onMarkerClick, mapMarkers]); // eslint-disable-line react-hooks/exhaustive-deps

  const getMarkerIcon = (type: string) => {
    const baseIcon = {
      url: getMarkerUrl(type),
      scaledSize: new google.maps.Size(32, 32),
      anchor: new google.maps.Point(16, 32)
    };
    return baseIcon;
  };

  const getMarkerUrl = (type: string) => {
    const colors = {
      hospital: '#e53e3e',
      clinic: '#3182ce',
      pharmacy: '#38a169',
      other: '#718096'
    };
    
    const color = colors[type as keyof typeof colors] || colors.other;
    
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
      <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 2C10.48 2 6 6.48 6 12c0 7.5 10 18 10 18s10-10.5 10-18c0-5.52-4.48-10-10-10z" fill="${color}"/>
        <circle cx="16" cy="12" r="4" fill="white"/>
      </svg>
    `)}`;
  };

  return (
    <Box
      ref={mapRef}
      className={className}
      sx={{
        height,
        width: '100%',
        borderRadius: 1,
        overflow: 'hidden',
        border: '1px solid #e0e0e0'
      }}
    />
  );
};

const render = (status: Status): React.ReactElement => {
  switch (status) {
    case Status.LOADING:
      return (
        <Box display="flex" justifyContent="center" alignItems="center" height="400px">
          <CircularProgress />
        </Box>
      );
    case Status.FAILURE:
      return (
        <Alert severity="error">
          <Typography variant="body2">
            Failed to load Google Maps. Please check your API key and internet connection.
          </Typography>
        </Alert>
      );
    case Status.SUCCESS:
      return <></>;
  }
};

const Map: React.FC<MapProps> = (props) => {
  const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
  
  if (!apiKey) {
    return (
      <Alert severity="warning">
        <Typography variant="body2">
          Google Maps API key not configured. Please set REACT_APP_GOOGLE_MAPS_API_KEY in your environment variables.
        </Typography>
      </Alert>
    );
  }

  return (
    <Wrapper apiKey={apiKey} render={render}>
      <MapComponent {...props} />
    </Wrapper>
  );
};

export default Map;
