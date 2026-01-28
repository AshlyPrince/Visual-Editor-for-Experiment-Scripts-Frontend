import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Save as SaveIcon } from '@mui/icons-material';
import experimentService from '../services/experimentService.js';

const CreateVersionDialog = ({
  open,
  onClose,
  experimentId,
  currentVersion,
  updatedContent,
  onVersionCreated,
}) => {
  const [commitMessage, setCommitMessage] = useState('');
  const [versionTitle, setVersionTitle] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleSave = async () => {
    if (!commitMessage.trim()) {
      setError('Please enter a commit message describing your changes');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const nextVersionNumber = (currentVersion || 0) + 1;
      const versionData = {
        content: updatedContent,
        commit_message: commitMessage.trim(),
        base_version: currentVersion,
      };

      const newVersion = await experimentService.createVersion(experimentId, versionData);

      setCommitMessage('');
      setVersionTitle('');

      if (onVersionCreated) {
        onVersionCreated(newVersion);
      }

      onClose();
    } catch (err) {
      if (err.response?.status === 409) {
        setError('VERSION_CONFLICT');
        if (onVersionCreated) {
          onVersionCreated(null, { conflict: true, error: err });
        }
      } else {
        setError(err.message || 'Unable to create version. Please try again.');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    if (!saving) {
      setCommitMessage('');
      setVersionTitle('');
      setError(null);
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Save as New Version</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          {error === 'VERSION_CONFLICT' && (
            <Alert severity="error" sx={{ mb: 2 }}>
              <Typography variant="body2" fontWeight={600} gutterBottom>
                Unable to Save Changes
              </Typography>
              <Typography variant="body2" gutterBottom>
                This experiment has been modified by another user since you opened it.
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                Please reload the latest version to continue editing.
              </Typography>
            </Alert>
          )}

          {error && error !== 'VERSION_CONFLICT' && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {!error && (
            <Alert severity="info" sx={{ mb: 3 }}>
              Changes will be saved as Version {(currentVersion || 0) + 1}.
            </Alert>
          )}

          <TextField
            label="Commit Message *"
            fullWidth
            multiline
            rows={3}
            value={commitMessage}
            onChange={(e) => setCommitMessage(e.target.value)}
            placeholder="Describe your changes"
            required
            disabled={saving || error === 'VERSION_CONFLICT'}
            error={error && error !== 'VERSION_CONFLICT' && !commitMessage.trim()}
            helperText={
              error === 'VERSION_CONFLICT'
                ? 'Unable to save due to version conflict'
                : error && !commitMessage.trim()
                ? 'Please enter a commit message'
                : 'Brief description of your changes'
            }
          />
        </Box>
      </DialogContent>
      <DialogActions>
        {error === 'VERSION_CONFLICT' ? (
          <>
            <Button onClick={handleClose} variant="outlined">
              Close
            </Button>
            <Button
              onClick={() => {
                handleClose();
                if (onVersionCreated) {
                  onVersionCreated(null, { conflict: true, shouldReload: true });
                }
              }}
              variant="contained"
              color="warning"
            >
              Reload Latest Version
            </Button>
          </>
        ) : (
          <>
            <Button onClick={handleClose} disabled={saving}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              variant="contained"
              disabled={saving || !commitMessage.trim()}
              startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
            >
              {saving ? 'Saving...' : 'Save Version'}
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default CreateVersionDialog;
