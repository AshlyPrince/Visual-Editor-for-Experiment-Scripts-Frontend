import React, { useState } from 'react';
import {
  Box,
  Button,
  IconButton,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Chip,
  Stack,
  Alert,
  LinearProgress,
  Dialog,
  DialogContent,
  Grid
} from '@mui/material';
import {
  CloudUpload,
  Delete,
  PlayCircle,
  Image as ImageIcon,
  VideoLibrary,
  Close,
  ZoomIn
} from '@mui/icons-material';
import SafetyIconLibrary from './SafetyIconLibrary.jsx';
import HazardIconLibrary from './HazardIconLibrary.jsx';

const MediaUploader = ({
  media = [],
  onChange,
  maxFiles = 10,
  maxSize = 10, 
  acceptImages = true,
  acceptVideos = true,
  showCaptions = true,
  showSafetyIcons = false,
  showHazardIcons = false,
  label = 'Attach Images or Videos'
}) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewMedia, setPreviewMedia] = useState(null);
  
  
  const uploaderId = React.useMemo(() => `media-upload-${Math.random().toString(36).substr(2, 9)}`, []);

  
  const acceptTypes = [
    acceptImages && 'image/*',
    acceptVideos && 'video/*'
  ].filter(Boolean).join(',');

  
  const compressImage = async (file) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      img.onload = () => {
        
        const maxWidth = 1920;
        const maxHeight = 1920;
        
        let width = img.width;
        let height = img.height;
        
        
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = width * ratio;
          height = height * ratio;
        }
        
        
        canvas.width = width;
        canvas.height = height;
        
        
        ctx.drawImage(img, 0, 0, width, height);
        
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to compress image'));
            }
          },
          file.type,
          0.85 
        );
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  };

  
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  
  const validateFile = (file) => {
    
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSize) {
      return `File "${file.name}" exceeds ${maxSize}MB limit`;
    }

    
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');
    
    if (!isImage && !isVideo) {
      return `File "${file.name}" is not a supported media type`;
    }

    if (isImage && !acceptImages) {
      return `Images are not accepted`;
    }

    if (isVideo && !acceptVideos) {
      return `Videos are not accepted`;
    }

    return null;
  };

  
  const handleFileSelect = async (event) => {
    const files = Array.from(event.target.files);
    
    if (files.length === 0) return;

    
    if (media.length + files.length > maxFiles) {
      setError(`Maximum ${maxFiles} files allowed`);
      return;
    }

    setError(null);
    setUploading(true);

    try {
      const newMediaItems = [];

      for (const file of files) {
        
        const validationError = validateFile(file);
        if (validationError) {
          setError(validationError);
          continue;
        }

        let processedFile = file;
        
        
        if (file.type.startsWith('image/')) {
          try {
            const compressedBlob = await compressImage(file);
            processedFile = new File([compressedBlob], file.name, { type: file.type });
          } catch (compressError) {
            processedFile = file;
          }
        }

        
        const base64Data = await fileToBase64(processedFile);

        
        const type = file.type.startsWith('image/') ? 'image' : 'video';

        
        const mediaItem = {
          id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type,
          data: base64Data,
          name: file.name,
          size: processedFile.size,
          mimeType: file.type,
          caption: '',
          uploadedAt: new Date().toISOString()
        };

        newMediaItems.push(mediaItem);
      }

      
      onChange([...media, ...newMediaItems]);

    } catch (err) {
      // Error is displayed to user via Alert component
      setError('Failed to upload files. Please try again.');
    } finally {
      setUploading(false);
      
      event.target.value = null;
    }
  };

  
  const handleRemove = (mediaId) => {
    onChange(media.filter(item => item.id !== mediaId));
  };

  
  const handleCaptionChange = (mediaId, caption) => {
    onChange(
      media.map(item => 
        item.id === mediaId ? { ...item, caption } : item
      )
    );
  };

  
  const handlePreview = (mediaItem) => {
    setPreviewMedia(mediaItem);
    setPreviewOpen(true);
  };

  
  const handleSafetyIconsSelected = (icons) => {
    const newMedia = icons.map(icon => ({
      ...icon,
      id: `media-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    }));
    onChange([...media, ...newMedia]);
  };

  
  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <Box>
      <Box sx={{ mb: 2 }}>
        <input
          accept={acceptTypes}
          style={{ display: 'none' }}
          id={uploaderId}
          type="file"
          multiple
          onChange={handleFileSelect}
          disabled={uploading || media.length >= maxFiles}
        />
        <label htmlFor={uploaderId}>
          <Button
            variant="outlined"
            component="span"
            startIcon={<CloudUpload />}
            disabled={uploading || media.length >= maxFiles}
            fullWidth
          >
            {label} ({media.length}/{maxFiles})
          </Button>
        </label>
        
        {showSafetyIcons && (
          <Box sx={{ mt: 1 }}>
            <SafetyIconLibrary onIconsSelected={handleSafetyIconsSelected} />
          </Box>
        )}
        
        {showHazardIcons && (
          <Box sx={{ mt: 1 }}>
            <HazardIconLibrary onIconsSelected={handleSafetyIconsSelected} />
          </Box>
        )}
        
        {uploading && (
          <LinearProgress sx={{ mt: 1 }} />
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {media.length > 0 && (
        <Grid container spacing={2}>
          {media.map((item) => (
            <Grid item xs={12} sm={6} md={4} key={item.id}>
              <Card sx={{ position: 'relative', height: '100%' }}>
                <Box
                  sx={{
                    position: 'relative',
                    paddingTop: '75%', 
                    backgroundColor: '#f5f5f5',
                    cursor: 'pointer'
                  }}
                  onClick={() => handlePreview(item)}
                >
                  {item.type?.startsWith('image') ? (
                    <CardMedia
                      component="img"
                      image={item.data}
                      alt={item.name}
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                  ) : (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#000'
                      }}
                    >
                      <video
                        src={item.data}
                        style={{
                          maxWidth: '100%',
                          maxHeight: '100%',
                          objectFit: 'contain'
                        }}
                      />
                      <PlayCircle
                        sx={{
                          position: 'absolute',
                          fontSize: 48,
                          color: 'white',
                          opacity: 0.8
                        }}
                      />
                    </Box>
                  )}
                  
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      backgroundColor: 'rgba(0,0,0,0.6)',
                      borderRadius: 1,
                      padding: 0.5
                    }}
                  >
                    <ZoomIn sx={{ color: 'white', fontSize: 20 }} />
                  </Box>
                </Box>

                <CardContent>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                    {item.type?.startsWith('image') ? (
                      <ImageIcon fontSize="small" color="primary" />
                    ) : (
                      <VideoLibrary fontSize="small" color="primary" />
                    )}
                    <Typography variant="body2" noWrap sx={{ flexGrow: 1 }}>
                      {item.name}
                    </Typography>
                  </Stack>

                  {showCaptions && (
                    <input
                      type="text"
                      placeholder="Add caption..."
                      value={item.caption || ''}
                      onChange={(e) => handleCaptionChange(item.id, e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        fontSize: '14px',
                        marginBottom: '8px'
                      }}
                    />
                  )}

                  <Button
                    size="small"
                    color="error"
                    startIcon={<Delete />}
                    onClick={() => handleRemove(item.id)}
                    fullWidth
                  >
                    Remove
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogContent sx={{ position: 'relative', p: 0 }}>
          <IconButton
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              zIndex: 1,
              backgroundColor: 'rgba(0,0,0,0.6)',
              '&:hover': { backgroundColor: 'rgba(0,0,0,0.8)' }
            }}
            onClick={() => setPreviewOpen(false)}
          >
            <Close sx={{ color: 'white' }} />
          </IconButton>

          {previewMedia && (
            <Box>
              {previewMedia.type?.startsWith('image') ? (
                <img
                  src={previewMedia.data}
                  alt={previewMedia.name}
                  style={{
                    width: '100%',
                    height: 'auto',
                    display: 'block'
                  }}
                />
              ) : (
                <video
                  src={previewMedia.data}
                  controls
                  autoPlay
                  style={{
                    width: '100%',
                    height: 'auto',
                    display: 'block',
                    backgroundColor: '#000'
                  }}
                />
              )}
              
              {previewMedia.caption && (
                <Box sx={{ p: 2, backgroundColor: '#f5f5f5' }}>
                  <Typography variant="body2" color="text.secondary">
                    {previewMedia.caption}
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default MediaUploader;
