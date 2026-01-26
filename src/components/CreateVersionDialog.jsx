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
      };

      const newVersion = await experimentService.createVersion(experimentId, versionData);

      
      setCommitMessage('');
      setVersionTitle('');

      
      if (onVersionCreated) {
        onVersionCreated(newVersion);
      }

      onClose();
    } catch (err) {
      setError(err.message || 'Unable to create version. Please try again.');
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
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Alert severity="info" sx={{ mb: 3 }}>
            Your changes will be saved as Version {(currentVersion || 0) + 1}. The previous
            version will remain in the version history.
          </Alert>

          <TextField
            label="Commit Message *"
            fullWidth
            multiline
            rows={3}
            value={commitMessage}
            onChange={(e) => setCommitMessage(e.target.value)}
            placeholder="Describe what changes you made (e.g., Added safety warnings, Updated procedure steps)"
            required
            disabled={saving}
            error={error && !commitMessage.trim()}
            helperText={
              error && !commitMessage.trim()
                ? 'Commit message is required'
                : 'Describe the changes you made in this version'
            }
          />

          <Box sx={{ mt: 2, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
            <Typography variant="caption" color="text.secondary">
              <strong>Tip:</strong> Write clear commit messages to help you identify versions
              later. Examples: "Added safety section", "Fixed typo in materials list", "Updated
              procedure with teacher feedback"
            </Typography>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
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
      </DialogActions>
    </Dialog>
  );
};

export default CreateVersionDialog;
