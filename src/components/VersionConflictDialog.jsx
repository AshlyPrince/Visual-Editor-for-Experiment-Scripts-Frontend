import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Alert,
  Typography,
  Box,
  Paper,
  Divider,
  Stack,
  Chip,
} from '@mui/material';
import {
  Warning as WarningIcon,
  Refresh as RefreshIcon,
  FileCopy as CopyIcon,
  OpenInNew as OpenInNewIcon,
} from '@mui/icons-material';

const VersionConflictDialog = ({
  open,
  onClose,
  onReloadLatest,
  onCopyChanges,
  onOpenInNewTab,
  conflictDetails,
}) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  const handleReload = async () => {
    setLoading(true);
    try {
      await onReloadLatest();
      onClose();
    } catch (error) {
      alert(t('version.reloadFailed') + ': ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (onCopyChanges) {
      onCopyChanges();
    }
    onClose();
  };

  const handleOpenNew = () => {
    if (onOpenInNewTab) {
      onOpenInNewTab();
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      disableEscapeKeyDown
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <WarningIcon color="warning" fontSize="large" />
          <Typography variant="h6">{t('version.versionConflict')}</Typography>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Stack spacing={2}>
          <Alert severity="warning" variant="outlined">
            <Typography variant="body2" gutterBottom>
              <strong>{t('version.conflictDetected')}</strong>
            </Typography>
            <Typography variant="body2">
              {t('version.conflictMessage')}
            </Typography>
          </Alert>

          {conflictDetails && (
            <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.default' }}>
              <Typography variant="subtitle2" gutterBottom>
                {t('version.conflictDetails')}
              </Typography>
              <Stack spacing={1}>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">
                    {t('version.yourVersion')}:
                  </Typography>
                  <Chip 
                    label={`v${conflictDetails.yourVersion}`} 
                    size="small" 
                    color="info"
                  />
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">
                    {t('version.latestVersion')}:
                  </Typography>
                  <Chip 
                    label={`v${conflictDetails.currentVersion}`} 
                    size="small" 
                    color="success"
                  />
                </Box>
                {conflictDetails.updatedBy && (
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">
                      {t('version.lastModified')}:
                    </Typography>
                    <Typography variant="body2">
                      {conflictDetails.updatedBy}
                    </Typography>
                  </Box>
                )}
              </Stack>
            </Paper>
          )}

          <Divider />

          <Typography variant="body2" color="text.secondary">
            {t('version.conflictOptions')}:
          </Typography>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 2, flexDirection: 'column', gap: 1, alignItems: 'stretch' }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleReload}
          disabled={loading}
          startIcon={<RefreshIcon />}
          fullWidth
          size="large"
        >
          {t('version.reloadLatestVersion')}
        </Button>
        <Typography variant="caption" color="text.secondary" sx={{ px: 2, textAlign: 'center' }}>
          {t('version.reloadLatestDesc')}
        </Typography>

        <Divider sx={{ my: 1 }} />

        <Button
          variant="outlined"
          onClick={handleCopy}
          startIcon={<CopyIcon />}
          fullWidth
        >
          {t('version.copyChanges')}
        </Button>
        <Typography variant="caption" color="text.secondary" sx={{ px: 2, textAlign: 'center' }}>
          {t('version.copyChangesDesc')}
        </Typography>

        {onOpenInNewTab && (
          <>
            <Button
              variant="outlined"
              onClick={handleOpenNew}
              startIcon={<OpenInNewIcon />}
              fullWidth
            >
              {t('version.openNewTab')}
            </Button>
            <Typography variant="caption" color="text.secondary" sx={{ px: 2, textAlign: 'center' }}>
              {t('version.openNewTabDesc')}
            </Typography>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default VersionConflictDialog;
