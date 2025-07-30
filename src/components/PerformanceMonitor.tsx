import React, { useEffect, useState } from 'react';
import { Box, Typography, Chip } from '@mui/material';

interface PerformanceMetrics {
  apiResponseTime: number;
  pageLoadTime: number;
  cacheHitRate: number;
}

const PerformanceMonitor: React.FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    apiResponseTime: 0,
    pageLoadTime: 0,
    cacheHitRate: 0,
  });

  useEffect(() => {
    // Monitor API response times
    const originalFetch = window.fetch;
    let totalResponseTime = 0;
    let requestCount = 0;

    window.fetch = async (...args) => {
      const startTime = performance.now();
      try {
        const response = await originalFetch(...args);
        const endTime = performance.now();
        const responseTime = endTime - startTime;
        
        totalResponseTime += responseTime;
        requestCount++;
        
        setMetrics(prev => ({
          ...prev,
          apiResponseTime: totalResponseTime / requestCount,
        }));
        
        return response;
      } catch (error) {
        return originalFetch(...args);
      }
    };

    // Monitor page load time
    if ('performance' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'navigation') {
            const navEntry = entry as PerformanceNavigationTiming;
            setMetrics(prev => ({
              ...prev,
              pageLoadTime: navEntry.loadEventEnd - navEntry.fetchStart,
            }));
          }
        }
      });
      
      observer.observe({ entryTypes: ['navigation'] });
    }

    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 16,
        right: 16,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        color: 'white',
        padding: 2,
        borderRadius: 2,
        zIndex: 9999,
        minWidth: 200,
      }}
    >
      <Typography variant="caption" sx={{ display: 'block', mb: 1 }}>
        Performance Monitor
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        <Chip
          label={`API: ${metrics.apiResponseTime.toFixed(0)}ms`}
          size="small"
          color={metrics.apiResponseTime < 500 ? 'success' : metrics.apiResponseTime < 1000 ? 'warning' : 'error'}
          sx={{ fontSize: '0.7rem' }}
        />
        <Chip
          label={`Page: ${metrics.pageLoadTime.toFixed(0)}ms`}
          size="small"
          color={metrics.pageLoadTime < 2000 ? 'success' : metrics.pageLoadTime < 5000 ? 'warning' : 'error'}
          sx={{ fontSize: '0.7rem' }}
        />
      </Box>
    </Box>
  );
};

export default PerformanceMonitor; 