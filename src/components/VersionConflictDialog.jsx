import { useState } from 'react';
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
  const [loading, setLoading] = useState(false);

  const handleReload = async () => {
    setLoading(true);
    try {
      await onReloadLatest();
      onClose();
    } catch (error) {
      alert('Failed to reload: ' + error.message);
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
          <Typography variant="h6">Version Conflict Detected</Typography>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Stack spacing={2}>
          <Alert severity="warning" variant="outlined">
            <Typography variant="body2" gutterBottom>
              <strong>Version Conflict Detected</strong>
            </Typography>
            <Typography variant="body2">
              Another user has saved changes to this experiment. Please reload the latest version before continuing.
            </Typography>
          </Alert>

          {conflictDetails && (
            <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.default' }}>
              <Typography variant="subtitle2" gutterBottom>
                Conflict Information
              </Typography>
              <Stack spacing={1}>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">
                    Your version:
                  </Typography>
                  <Chip 
                    label={`v${conflictDetails.yourVersion}`} 
                    size="small" 
                    color="info"
                  />
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">
                    Current version:
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
                      Modified by:
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
            Please choose an action to resolve this conflict:
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
          Reload Latest Version
        </Button>
        <Typography variant="caption" color="text.secondary" sx={{ px: 2, textAlign: 'center' }}>
          Load the current version and discard your changes
        </Typography>

        <Divider sx={{ my: 1 }} />

        <Button
          variant="outlined"
          onClick={handleCopy}
          startIcon={<CopyIcon />}
          fullWidth
        >
          Copy Changes to Clipboard
        </Button>
        <Typography variant="caption" color="text.secondary" sx={{ px: 2, textAlign: 'center' }}>
          Save your changes before reloading
        </Typography>

        {onOpenInNewTab && (
          <>
            <Button
              variant="outlined"
              onClick={handleOpenNew}
              startIcon={<OpenInNewIcon />}
              fullWidth
            >
              Open in New Tab
            </Button>
            <Typography variant="caption" color="text.secondary" sx={{ px: 2, textAlign: 'center' }}>
              View your changes in a separate window
            </Typography>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default VersionConflictDialog;
