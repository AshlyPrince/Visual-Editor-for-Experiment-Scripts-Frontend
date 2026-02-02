import { useState } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
  const [commitMessage, setCommitMessage] = useState('');
  const [versionTitle, setVersionTitle] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleSave = async () => {
    if (!commitMessage.trim()) {
      setError(t('version.commitMessageRequired'));
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const nextVersionNumber = (currentVersion || 0) + 1;
      
      const contentWithPermissions = {
        ...updatedContent.content,
        permissions: updatedContent.content?.permissions || updatedContent.permissions
      };
      
      const versionData = {
        title: updatedContent.title,
        estimated_duration: updatedContent.estimated_duration,
        course: updatedContent.course,
        program: updatedContent.program,
        content: contentWithPermissions,
        commit_message: commitMessage.trim(),
        base_version: currentVersion,
      };

      console.log('[CreateVersionDialog] Saving version with data:', {
        title: versionData.title,
        experimentId,
        contentSections: versionData.content?.sections?.length,
        hasPermissions: !!versionData.content?.permissions,
        userPermissions: versionData.content?.permissions?.userPermissions?.length
      });

      const newVersion = await experimentService.createVersion(experimentId, versionData);

      console.log('[CreateVersionDialog] Version created:', {
        id: newVersion.id,
        title: newVersion.title,
        version_number: newVersion.version_number
      });

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
        setError(err.message || t('version.createVersionError'));
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
      <DialogTitle>{t('buttons.saveAsNewVersion')}</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          {error === 'VERSION_CONFLICT' && (
            <Alert severity="error" sx={{ mb: 2 }}>
              <Typography variant="body2" fontWeight={600} gutterBottom>
                {t('version.unableToSave')}
              </Typography>
              <Typography variant="body2" gutterBottom>
                {t('version.modifiedByAnother')}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                {t('version.reloadToContinue')}
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
              {t('version.changesWillBeSaved', { version: (currentVersion || 0) + 1 })}
            </Alert>
          )}

          <TextField
            label={t('version.commitMessage')}
            fullWidth
            multiline
            rows={3}
            value={commitMessage}
            onChange={(e) => setCommitMessage(e.target.value)}
            placeholder={t('version.describeChanges')}
            required
            disabled={saving || error === 'VERSION_CONFLICT'}
            error={error && error !== 'VERSION_CONFLICT' && !commitMessage.trim()}
            helperText={
              error === 'VERSION_CONFLICT'
                ? t('version.unableToSaveConflict')
                : error && !commitMessage.trim()
                ? t('version.enterCommitMessage')
                : t('version.briefDescription')
            }
          />
        </Box>
      </DialogContent>
      <DialogActions>
        {error === 'VERSION_CONFLICT' ? (
          <>
            <Button onClick={handleClose} variant="outlined">
              {t('common.close')}
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
              {t('version.reloadLatestVersion')}
            </Button>
          </>
        ) : (
          <>
            <Button onClick={handleClose} disabled={saving}>
              {t('common.cancel')}
            </Button>
            <Button
              onClick={handleSave}
              variant="contained"
              disabled={saving || !commitMessage.trim()}
              startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
            >
              {saving ? t('common.saving') : t('buttons.saveVersion')}
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default CreateVersionDialog;
