import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Chip,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
  Paper,
  Divider,
} from '@mui/material';
import {
  Add,
  Search,
  FilterList,
  Work,
  LocationOn,
  Schedule,
  AttachMoney,
  Edit,
  Delete,
  Visibility,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { connectApiService } from '../services/connectApi';

interface JobPosting {
  id: string;
  title: string;
  description: string;
  location: string;
  job_type: string;
  salary: string;
  experience: string;
  contact_email: string;
  contact_phone: string;
  application_url: string;
  status: string;
  created_at: string;
  posted_by_user?: {
    full_name: string;
  };
  facility?: {
    name: string;
  };
}

const JobPostingsPage: React.FC = () => {
  const { user, canPostJobs } = useAuth();
  const [jobPostings, setJobPostings] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [jobTypeFilter, setJobTypeFilter] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<JobPosting | null>(null);

  // Form state for creating/editing jobs
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    job_type: '',
    salary: '',
    experience: '',
    education: '',
    skills: '',
    benefits: '',
    contact_email: '',
    contact_phone: '',
    application_url: '',
  });

  useEffect(() => {
    loadJobPostings();
  }, []);

  const loadJobPostings = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await connectApiService.getJobPostings({
        location: locationFilter,
        job_type: jobTypeFilter,
      });
      setJobPostings(response.data || []);
    } catch (err) {
      setError('Failed to load job postings');
      console.error('Job postings loading error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    loadJobPostings();
  };

  const handleCreateJob = async () => {
    try {
      await connectApiService.createJobPosting(formData);
      setCreateDialogOpen(false);
      resetForm();
      loadJobPostings();
    } catch (err) {
      setError('Failed to create job posting');
    }
  };

  const handleEditJob = async () => {
    if (!selectedJob) return;
    
    try {
      await connectApiService.updateJobPosting(selectedJob.id, formData);
      setEditDialogOpen(false);
      resetForm();
      loadJobPostings();
    } catch (err) {
      setError('Failed to update job posting');
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    if (!window.confirm('Are you sure you want to delete this job posting?')) return;
    
    try {
      await connectApiService.deleteJobPosting(jobId);
      loadJobPostings();
    } catch (err) {
      setError('Failed to delete job posting');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      location: '',
      job_type: '',
      salary: '',
      experience: '',
      education: '',
      skills: '',
      benefits: '',
      contact_email: '',
      contact_phone: '',
      application_url: '',
    });
  };

  const openEditDialog = (job: JobPosting) => {
    setSelectedJob(job);
    setFormData({
      title: job.title,
      description: job.description,
      location: job.location,
      job_type: job.job_type,
      salary: job.salary,
      experience: job.experience,
      education: '',
      skills: '',
      benefits: '',
      contact_email: job.contact_email,
      contact_phone: job.contact_phone,
      application_url: job.application_url,
    });
    setEditDialogOpen(true);
  };

  const filteredJobs = jobPostings.filter(job =>
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          <Work sx={{ mr: 2, verticalAlign: 'middle' }} />
          Job Postings
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Find healthcare jobs and career opportunities
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Search and Filter */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, alignItems: 'center' }}>
            <Box sx={{ flex: 1, minWidth: 200 }}>
              <TextField
                fullWidth
                label="Search jobs"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />
            </Box>
            <Box sx={{ minWidth: 150 }}>
              <FormControl fullWidth>
                <InputLabel>Location</InputLabel>
                <Select
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                >
                  <MenuItem value="">All Locations</MenuItem>
                  <MenuItem value="Nairobi">Nairobi</MenuItem>
                  <MenuItem value="Mombasa">Mombasa</MenuItem>
                  <MenuItem value="Kisumu">Kisumu</MenuItem>
                  <MenuItem value="Nakuru">Nakuru</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ minWidth: 150 }}>
              <FormControl fullWidth>
                <InputLabel>Job Type</InputLabel>
                <Select
                  value={jobTypeFilter}
                  onChange={(e) => setJobTypeFilter(e.target.value)}
                >
                  <MenuItem value="">All Types</MenuItem>
                  <MenuItem value="full_time">Full Time</MenuItem>
                  <MenuItem value="part_time">Part Time</MenuItem>
                  <MenuItem value="contract">Contract</MenuItem>
                  <MenuItem value="locum">Locum</MenuItem>
                  <MenuItem value="volunteer">Volunteer</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Button
              variant="contained"
              onClick={handleSearch}
              startIcon={<FilterList />}
              sx={{ minWidth: 120 }}
            >
              Filter
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Create Job Button */}
      {canPostJobs && (
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setCreateDialogOpen(true)}
          >
            Post a Job
          </Button>
        </Box>
      )}

      {/* Job Listings */}
      <Box sx={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: 3 }}>
        {filteredJobs.map((job) => (
          <Box key={job.id} sx={{ flex: '1 1 300px', minWidth: 300 }}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Typography variant="h6" component="h2">
                    {job.title}
                  </Typography>
                  <Chip 
                    label={job.job_type.replace('_', ' ')} 
                    color="primary" 
                    size="small" 
                  />
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <LocationOn sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    {job.location}
                  </Typography>
                </Box>

                {job.salary && (
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <AttachMoney sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      {job.salary}
                    </Typography>
                  </Box>
                )}

                <Typography variant="body2" sx={{ mb: 2 }}>
                  {job.description.length > 150 
                    ? `${job.description.substring(0, 150)}...` 
                    : job.description
                  }
                </Typography>

                <Divider sx={{ my: 2 }} />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="caption" color="text.secondary">
                    Posted by {job.posted_by_user?.full_name || 'Unknown'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(job.created_at).toLocaleDateString()}
                  </Typography>
                </Box>
              </CardContent>

              <Box sx={{ p: 2, pt: 0 }}>
                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                  {job.application_url && (
                    <Button
                      variant="outlined"
                      size="small"
                      href={job.application_url}
                      target="_blank"
                      startIcon={<Visibility />}
                    >
                      Apply
                    </Button>
                  )}
                  {canPostJobs && job.posted_by_user?.full_name === user?.full_name && (
                    <>
                      <Tooltip title="Edit Job">
                        <IconButton
                          size="small"
                          onClick={() => openEditDialog(job)}
                        >
                          <Edit />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Job">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteJob(job.id)}
                        >
                          <Delete />
                        </IconButton>
                      </Tooltip>
                    </>
                  )}
                </Box>
              </Box>
            </Card>
          </Box>
        ))}
      </Box>

      {filteredJobs.length === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            No job postings found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Try adjusting your search criteria
          </Typography>
        </Paper>
      )}

      {/* Create Job Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Post a New Job</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <Box sx={{ flex: 1 }}>
              <TextField
                fullWidth
                label="Job Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </Box>
            <Box sx={{ flex: 1 }}>
              <TextField
                fullWidth
                label="Location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                required
              />
            </Box>
            <Box sx={{ flex: 1 }}>
              <FormControl fullWidth required>
                <InputLabel>Job Type</InputLabel>
                <Select
                  value={formData.job_type}
                  onChange={(e) => setFormData({ ...formData, job_type: e.target.value })}
                >
                  <MenuItem value="full_time">Full Time</MenuItem>
                  <MenuItem value="part_time">Part Time</MenuItem>
                  <MenuItem value="contract">Contract</MenuItem>
                  <MenuItem value="locum">Locum</MenuItem>
                  <MenuItem value="volunteer">Volunteer</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ flex: 1 }}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </Box>
            <Box sx={{ flex: 1 }}>
              <TextField
                fullWidth
                label="Salary"
                value={formData.salary}
                onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
              />
            </Box>
            <Box sx={{ flex: 1 }}>
              <TextField
                fullWidth
                label="Experience Required"
                value={formData.experience}
                onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
              />
            </Box>
            <Box sx={{ flex: 1 }}>
              <TextField
                fullWidth
                label="Contact Email"
                type="email"
                value={formData.contact_email}
                onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                required
              />
            </Box>
            <Box sx={{ flex: 1 }}>
              <TextField
                fullWidth
                label="Contact Phone"
                value={formData.contact_phone}
                onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
              />
            </Box>
            <Box sx={{ flex: 1 }}>
              <TextField
                fullWidth
                label="Application URL"
                value={formData.application_url}
                onChange={(e) => setFormData({ ...formData, application_url: e.target.value })}
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateJob}>
            Post Job
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Job Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Edit Job Posting</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <Box sx={{ flex: 1 }}>
              <TextField
                fullWidth
                label="Job Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </Box>
            <Box sx={{ flex: 1 }}>
              <TextField
                fullWidth
                label="Location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                required
              />
            </Box>
            <Box sx={{ flex: 1 }}>
              <FormControl fullWidth required>
                <InputLabel>Job Type</InputLabel>
                <Select
                  value={formData.job_type}
                  onChange={(e) => setFormData({ ...formData, job_type: e.target.value })}
                >
                  <MenuItem value="full_time">Full Time</MenuItem>
                  <MenuItem value="part_time">Part Time</MenuItem>
                  <MenuItem value="contract">Contract</MenuItem>
                  <MenuItem value="locum">Locum</MenuItem>
                  <MenuItem value="volunteer">Volunteer</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ flex: 1 }}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </Box>
            <Box sx={{ flex: 1 }}>
              <TextField
                fullWidth
                label="Salary"
                value={formData.salary}
                onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
              />
            </Box>
            <Box sx={{ flex: 1 }}>
              <TextField
                fullWidth
                label="Experience Required"
                value={formData.experience}
                onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
              />
            </Box>
            <Box sx={{ flex: 1 }}>
              <TextField
                fullWidth
                label="Contact Email"
                type="email"
                value={formData.contact_email}
                onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                required
              />
            </Box>
            <Box sx={{ flex: 1 }}>
              <TextField
                fullWidth
                label="Contact Phone"
                value={formData.contact_phone}
                onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
              />
            </Box>
            <Box sx={{ flex: 1 }}>
              <TextField
                fullWidth
                label="Application URL"
                value={formData.application_url}
                onChange={(e) => setFormData({ ...formData, application_url: e.target.value })}
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleEditJob}>
            Update Job
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default JobPostingsPage;
