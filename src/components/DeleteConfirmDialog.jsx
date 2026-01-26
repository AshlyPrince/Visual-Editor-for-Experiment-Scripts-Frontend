import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Box,
  Typography,
  Alert,
} from '@mui/material';
import {
  Warning as WarningIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';

const DeleteConfirmDialog = ({
  open,
  onClose,
  onConfirm,
  title = 'Delete Item?',
  itemName,
  itemType = 'item',
  loading = false,
  additionalInfo,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <WarningIcon color="error" />
          <Typography variant="h6">{title}</Typography>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Alert severity="warning" sx={{ mb: 2 }}>
          <strong>Warning:</strong> This action cannot be undone.
        </Alert>
        
        <DialogContentText>
          Are you sure you want to delete{' '}
          <strong>"{itemName}"</strong>?
        </DialogContentText>
        
        {additionalInfo && (
          <DialogContentText sx={{ mt: 2 }}>
            {additionalInfo}
          </DialogContentText>
        )}
        
        <DialogContentText sx={{ mt: 2, fontStyle: 'italic', fontSize: '0.875rem' }}>
          The {itemType} will be permanently removed from the system.
        </DialogContentText>
      </DialogContent>
      
      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button 
          onClick={onClose} 
          disabled={loading}
          variant="outlined"
        >
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          color="error"
          variant="contained"
          disabled={loading}
          startIcon={<DeleteIcon />}
        >
          {loading ? 'Deleting...' : 'Delete'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteConfirmDialog;
