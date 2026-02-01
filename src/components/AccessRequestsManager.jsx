import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Avatar,
  Chip,
  Alert,
  Stack,
  TextField,
  MenuItem,
  Paper,
  Divider,
  Badge,
  Tabs,
  Tab
} from '@mui/material';
import {
  Close as CloseIcon,
  Check as ApproveIcon,
  Clear as RejectIcon,
  Person as PersonIcon,
  Notifications as NotificationsIcon,
  Schedule as PendingIcon,
  CheckCircle as ApprovedIcon,
  Cancel as RejectedIcon
} from '@mui/icons-material';
import { experimentService } from '../services/exports';

const PERMISSION_LEVELS = {
  VIEWER: 'viewer',
  COMMENTER: 'commenter',
  EDITOR: 'editor',
  ADMIN: 'admin'
};

const REQUEST_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected'
};

const AccessRequestsManager = ({ 
  open, 
  onClose, 
  experimentId,
  onRequestsChange
}) => {
  const { t } = useTranslation();
  
  const [tabValue, setTabValue] = useState(0);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open && experimentId) {
      loadRequests();
    }
  }, [open, experimentId]);

  const loadRequests = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await experimentService.getAccessRequests(experimentId);
      setRequests(data || []);
    } catch (err) {
      console.error('Failed to load access requests:', err);
      setError(err.message || 'Failed to load access requests');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId, grantedPermission = null) => {
    try {
      await experimentService.approveAccessRequest(experimentId, requestId, {
        grantedPermission: grantedPermission || requests.find(r => r.id === requestId)?.requestedPermission
      });
      
      await loadRequests();
      
      if (onRequestsChange) {
        onRequestsChange();
      }
    } catch (err) {
      console.error('Failed to approve request:', err);
      alert(t('accessRequests.approveError') || 'Failed to approve request');
    }
  };

  const handleReject = async (requestId, reason = '') => {
    try {
      await experimentService.rejectAccessRequest(experimentId, requestId, {
        rejectionReason: reason
      });
      
      await loadRequests();
      
      if (onRequestsChange) {
        onRequestsChange();
      }
    } catch (err) {
      console.error('Failed to reject request:', err);
      alert(t('accessRequests.rejectError') || 'Failed to reject request');
    }
  };

  const pendingRequests = requests.filter(r => r.status === REQUEST_STATUS.PENDING);
  const approvedRequests = requests.filter(r => r.status === REQUEST_STATUS.APPROVED);
  const rejectedRequests = requests.filter(r => r.status === REQUEST_STATUS.REJECTED);

  const getRequestList = () => {
    switch (tabValue) {
      case 0: return pendingRequests;
      case 1: return approvedRequests;
      case 2: return rejectedRequests;
      default: return [];
    }
  };

  const renderRequestItem = (request) => {
    const isPending = request.status === REQUEST_STATUS.PENDING;
    const isApproved = request.status === REQUEST_STATUS.APPROVED;
    const isRejected = request.status === REQUEST_STATUS.REJECTED;

    return (
      <Paper key={request.id} sx={{ mb: 2, p: 2 }}>
        <Box display="flex" alignItems="flex-start" gap={2}>
          <Avatar sx={{ bgcolor: 'primary.main' }}>
            <PersonIcon />
          </Avatar>
          
          <Box flex={1}>
            <Box display="flex" alignItems="center" gap={1} mb={0.5}>
              <Typography variant="subtitle1" fontWeight="bold">
                {request.requesterName || request.requesterEmail}
              </Typography>
              {isPending && (
                <Chip 
                  size="small" 
                  label={t('accessRequests.pending') || 'Pending'} 
                  color="warning"
                  icon={<PendingIcon />}
                />
              )}
              {isApproved && (
                <Chip 
                  size="small" 
                  label={t('accessRequests.approved') || 'Approved'} 
                  color="success"
                  icon={<ApprovedIcon />}
                />
              )}
              {isRejected && (
                <Chip 
                  size="small" 
                  label={t('accessRequests.rejected') || 'Rejected'} 
                  color="error"
                  icon={<RejectedIcon />}
                />
              )}
            </Box>
            
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {request.requesterEmail}
            </Typography>
            
            <Box my={1}>
              <Chip 
                size="small" 
                label={`${t('accessRequests.requestedRole')}: ${request.requestedPermission}`}
                variant="outlined"
              />
            </Box>
            
            <Paper variant="outlined" sx={{ p: 1.5, mt: 1, bgcolor: 'grey.50' }}>
              <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                {t('accessRequests.message') || 'Message'}:
              </Typography>
              <Typography variant="body2">
                {request.message}
              </Typography>
            </Paper>
            
            <Typography variant="caption" color="text.secondary" display="block" mt={1}>
              {t('accessRequests.requestedOn')}: {new Date(request.createdAt).toLocaleString()}
            </Typography>
            
            {isApproved && request.grantedPermission && (
              <Typography variant="caption" color="text.secondary" display="block">
                {t('accessRequests.grantedPermission')}: {request.grantedPermission}
              </Typography>
            )}
            
            {isRejected && request.rejectionReason && (
              <Paper variant="outlined" sx={{ p: 1.5, mt: 1, bgcolor: 'error.50' }}>
                <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                  {t('accessRequests.rejectionReason') || 'Rejection Reason'}:
                </Typography>
                <Typography variant="body2">
                  {request.rejectionReason}
                </Typography>
              </Paper>
            )}
          </Box>

          {isPending && (
            <Stack direction="row" spacing={1}>
              <TextField
                select
                size="small"
                defaultValue={request.requestedPermission}
                onChange={(e) => {
                  request._tempPermission = e.target.value;
                }}
                sx={{ minWidth: 120 }}
              >
                {Object.values(PERMISSION_LEVELS).map((level) => (
                  <MenuItem key={level} value={level}>
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </MenuItem>
                ))}
              </TextField>
              
              <Button
                variant="contained"
                color="success"
                size="small"
                startIcon={<ApproveIcon />}
                onClick={() => handleApprove(request.id, request._tempPermission)}
              >
                {t('accessRequests.approve') || 'Approve'}
              </Button>
              
              <Button
                variant="outlined"
                color="error"
                size="small"
                startIcon={<RejectIcon />}
                onClick={() => {
                  const reason = prompt(t('accessRequests.rejectionReasonPrompt') || 'Reason for rejection (optional):');
                  handleReject(request.id, reason || '');
                }}
              >
                {t('accessRequests.reject') || 'Reject'}
              </Button>
            </Stack>
          )}
        </Box>
      </Paper>
    );
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={1}>
            <NotificationsIcon />
            <Typography variant="h6">
              {t('accessRequests.title') || 'Access Requests'}
            </Typography>
            {pendingRequests.length > 0 && (
              <Badge badgeContent={pendingRequests.length} color="error" />
            )}
          </Box>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent dividers>
        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ mb: 3 }}>
          <Tab 
            label={
              <Badge badgeContent={pendingRequests.length} color="error">
                <Box px={1}>{t('accessRequests.pending') || 'Pending'}</Box>
              </Badge>
            } 
          />
          <Tab label={`${t('accessRequests.approved') || 'Approved'} (${approvedRequests.length})`} />
          <Tab label={`${t('accessRequests.rejected') || 'Rejected'} (${rejectedRequests.length})`} />
        </Tabs>

        {loading ? (
          <Box textAlign="center" py={4}>
            <Typography variant="body2" color="text.secondary">
              {t('common.loading') || 'Loading...'}
            </Typography>
          </Box>
        ) : error ? (
          <Alert severity="error">
            {error}
          </Alert>
        ) : getRequestList().length === 0 ? (
          <Box textAlign="center" py={4}>
            <Typography variant="body1" color="text.secondary">
              {tabValue === 0 && (t('accessRequests.noPending') || 'No pending requests')}
              {tabValue === 1 && (t('accessRequests.noApproved') || 'No approved requests')}
              {tabValue === 2 && (t('accessRequests.noRejected') || 'No rejected requests')}
            </Typography>
          </Box>
        ) : (
          <Box>
            {getRequestList().map(renderRequestItem)}
          </Box>
        )}
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose}>
          {t('common.close') || 'Close'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AccessRequestsManager;
