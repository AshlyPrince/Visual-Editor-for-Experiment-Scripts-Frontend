import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  TextField,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Alert,
  Stack,
  Chip,
  IconButton
} from '@mui/material';
import {
  Close as CloseIcon,
  Send as SendIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Share as ShareIcon,
  AdminPanelSettings as AdminIcon
} from '@mui/icons-material';

const PERMISSION_LEVELS = {
  VIEWER: 'viewer',
  COMMENTER: 'commenter',
  EDITOR: 'editor',
  ADMIN: 'admin'
};

const PERMISSION_OPTIONS = [
  {
    value: PERMISSION_LEVELS.VIEWER,
    label: 'Viewer',
    description: 'View the experiment',
    icon: <VisibilityIcon />
  },
  {
    value: PERMISSION_LEVELS.COMMENTER,
    label: 'Commenter',
    description: 'View and comment on the experiment',
    icon: <ShareIcon />
  },
  {
    value: PERMISSION_LEVELS.EDITOR,
    label: 'Editor',
    description: 'View and edit the experiment',
    icon: <EditIcon />
  },
  {
    value: PERMISSION_LEVELS.ADMIN,
    label: 'Admin',
    description: 'Full control including permissions management',
    icon: <AdminIcon />
  }
];

const AccessRequestDialog = ({ 
  open, 
  onClose, 
  experimentId,
  experimentTitle,
  ownerName,
  onSubmit 
}) => {
  const { t } = useTranslation();
  
  const [requestedPermission, setRequestedPermission] = useState(PERMISSION_LEVELS.VIEWER);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!message.trim()) {
      alert(t('accessRequest.messageRequired') || 'Please provide a reason for your request');
      return;
    }

    setSubmitting(true);
    
    try {
      await onSubmit({
        experimentId,
        requestedPermission,
        message: message.trim()
      });
      
      setSubmitted(true);
      
      // Auto-close after showing success
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (error) {
      console.error('Failed to submit access request:', error);
      alert(t('accessRequest.submitError') || 'Failed to submit access request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setRequestedPermission(PERMISSION_LEVELS.VIEWER);
    setMessage('');
    setSubmitted(false);
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">
            {t('accessRequest.title') || 'Request Access'}
          </Typography>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent dividers>
        {submitted ? (
          <Alert severity="success">
            {t('accessRequest.submitted') || 'Your access request has been submitted successfully! The owner will be notified.'}
          </Alert>
        ) : (
          <Stack spacing={3}>
            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                {t('accessRequest.experimentLabel') || 'Experiment'}
              </Typography>
              <Typography variant="h6" gutterBottom>
                {experimentTitle}
              </Typography>
              {ownerName && (
                <Typography variant="body2" color="text.secondary">
                  {t('accessRequest.owner')}: {ownerName}
                </Typography>
              )}
            </Box>

            <Box>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                {t('accessRequest.requestedAccess') || 'Requested Access Level'}
              </Typography>
              <FormControl component="fieldset" fullWidth>
                <RadioGroup
                  value={requestedPermission}
                  onChange={(e) => setRequestedPermission(e.target.value)}
                >
                  {PERMISSION_OPTIONS.map((option) => (
                    <FormControlLabel
                      key={option.value}
                      value={option.value}
                      control={<Radio />}
                      label={
                        <Box display="flex" alignItems="center" gap={1}>
                          {option.icon}
                          <Box>
                            <Typography variant="body1">
                              {option.label}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {option.description}
                            </Typography>
                          </Box>
                        </Box>
                      }
                      sx={{ py: 1 }}
                    />
                  ))}
                </RadioGroup>
              </FormControl>
            </Box>

            <Box>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                {t('accessRequest.messageLabel') || 'Reason for Request'} *
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={4}
                placeholder={t('accessRequest.messagePlaceholder') || 'Please explain why you need access to this experiment...'}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                helperText={t('accessRequest.messageHelp') || 'This message will be sent to the experiment owner'}
              />
            </Box>

            <Alert severity="info">
              {t('accessRequest.info') || 'Your request will be sent to the experiment owner for approval. You will be notified once they respond.'}
            </Alert>
          </Stack>
        )}
      </DialogContent>
      
      {!submitted && (
        <DialogActions>
          <Button onClick={handleClose}>
            {t('common.cancel') || 'Cancel'}
          </Button>
          <Button 
            variant="contained" 
            onClick={handleSubmit}
            disabled={submitting || !message.trim()}
            startIcon={<SendIcon />}
          >
            {submitting 
              ? (t('accessRequest.submitting') || 'Submitting...') 
              : (t('accessRequest.submit') || 'Send Request')
            }
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
};

export default AccessRequestDialog;
