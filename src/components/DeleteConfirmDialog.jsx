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
  CircularProgress,
} from '@mui/material';
import {
  Warning as WarningIcon,
  Delete as DeleteIcon,
  CheckCircle as SuccessIcon,
} from '@mui/icons-material';

const DeleteConfirmDialog = ({
  open,
  onClose,
  onConfirm,
  title,
  itemName,
  itemType = 'item',
  loading = false,
  success = false,
  additionalInfo,
}) => {
  const { t } = useTranslation();
  
  return (
    <Dialog
      open={open}
      onClose={success ? onClose : (loading ? undefined : onClose)}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          {success ? (
            <>
              <SuccessIcon color="success" />
              <Typography variant="h6">{t('messages.deleteSuccess', 'Deleted Successfully')}</Typography>
            </>
          ) : (
            <>
              <WarningIcon color="error" />
              <Typography variant="h6">{title || t('messages.deleteConfirm')}</Typography>
            </>
          )}
        </Box>
      </DialogTitle>
      
      <DialogContent>
        {success ? (
          <Alert severity="success">
            <Typography variant="body2">
              {t('messages.itemDeletedSuccessfully', { itemName })}
            </Typography>
          </Alert>
        ) : loading ? (
          <Box display="flex" flexDirection="column" alignItems="center" gap={2} py={3}>
            <CircularProgress size={48} />
            <Typography variant="body1" color="text.secondary">
              {t('messages.deletingItem', 'Deleting...')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('messages.pleaseWait', 'Please wait while we process your request.')}
            </Typography>
          </Box>
        ) : (
          <>
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
          </>
        )}
      </DialogContent>
      
      <DialogActions sx={{ p: 2, gap: 1 }}>
        {success ? (
          <Button 
            onClick={onClose} 
            variant="contained"
            color="primary"
          >
            {t('common.close')}
          </Button>
        ) : (
          <>
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
              startIcon={loading ? <CircularProgress size={16} /> : <DeleteIcon />}
            >
              {loading ? t('messages.deleting', 'Deleting...') : t('common.delete')}
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default DeleteConfirmDialog;
