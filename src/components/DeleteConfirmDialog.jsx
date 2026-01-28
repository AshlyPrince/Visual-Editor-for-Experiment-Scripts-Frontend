import React from 'react';
import { useTranslation } from 'react-i18next';
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
  title,
  itemName,
  itemType = 'item',
  loading = false,
  additionalInfo,
}) => {
  const { t } = useTranslation();
  
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
          <Typography variant="h6">{title || t('messages.deleteConfirm')}</Typography>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Alert severity="warning" sx={{ mb: 2 }}>
          <strong>{t('common.warning')}:</strong> {t('messages.actionCannotBeUndone')}
        </Alert>
        
        <DialogContentText>
          {t('messages.confirmDelete', { itemName })}
        </DialogContentText>
        
        {additionalInfo && (
          <DialogContentText sx={{ mt: 2 }}>
            {additionalInfo}
          </DialogContentText>
        )}
        
        <DialogContentText sx={{ mt: 2, fontStyle: 'italic', fontSize: '0.875rem' }}>
          {t('messages.itemWillBeRemoved', { itemType })}
        </DialogContentText>
      </DialogContent>
      
      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button 
          onClick={onClose} 
          disabled={loading}
          variant="outlined"
        >
          {t('common.cancel')}
        </Button>
        <Button
          onClick={onConfirm}
          color="error"
          variant="contained"
          disabled={loading}
          startIcon={<DeleteIcon />}
        >
          {loading ? t('messages.deleting') : t('common.delete')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteConfirmDialog;
