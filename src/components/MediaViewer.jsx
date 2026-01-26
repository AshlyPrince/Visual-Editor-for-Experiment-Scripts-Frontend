import React, { useState } from 'react';
import {
  Box,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Grid,
  Dialog,
  DialogContent,
  IconButton,
  Chip
} from '@mui/material';
import {
  Close,
  PlayCircle,
  Image as ImageIcon,
  VideoLibrary,
  ZoomIn
} from '@mui/icons-material';

const MediaViewer = ({
  media = [],
  columns = { xs: 12, sm: 6, md: 4 },
  showCaptions = true,
  compact = false
}) => {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewMedia, setPreviewMedia] = useState(null);

  if (!media || media.length === 0) {
    return null;
  }

  const handlePreview = (mediaItem) => {
    setPreviewMedia(mediaItem);
    setPreviewOpen(true);
  };

  return (
    <Box>
      <Grid container spacing={compact ? 1 : 2}>
        {media.map((item, index) => (
          <Grid item {...columns} key={item.id || index}>
            <Card
              sx={{
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'scale(1.02)',
                  boxShadow: 4
                }
              }}
              onClick={() => handlePreview(item)}
            >
              <Box
                sx={{
                  position: 'relative',
                  paddingTop: compact ? '40%' : '56.25%', 
                  backgroundColor: '#f5f5f5'
                }}
              >
                {item.type === 'image' ? (
                  <CardMedia
                    component="img"
                    image={item.data}
                    alt={item.caption || item.name || 'Image'}
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
                        fontSize: compact ? 32 : 48,
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
                  <ZoomIn sx={{ color: 'white', fontSize: compact ? 16 : 20 }} />
                </Box>

                <Chip
                  icon={item.type === 'image' ? <ImageIcon /> : <VideoLibrary />}
                  label={item.type === 'image' ? 'Image' : 'Video'}
                  size="small"
                  sx={{
                    position: 'absolute',
                    bottom: 8,
                    left: 8,
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    color: 'white',
                    '& .MuiChip-icon': { color: 'white' }
                  }}
                />
              </Box>

              {showCaptions && item.caption && (
                <CardContent sx={{ py: compact ? 1 : 2 }}>
                  <Typography
                    variant={compact ? 'caption' : 'body2'}
                    color="text.secondary"
                  >
                    {item.caption}
                  </Typography>
                </CardContent>
              )}
            </Card>
          </Grid>
        ))}
      </Grid>

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
              {previewMedia.type === 'image' ? (
                <img
                  src={previewMedia.data}
                  alt={previewMedia.caption || previewMedia.name || 'Image'}
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

              {showCaptions && previewMedia.caption && (
                <Box sx={{ p: 2, backgroundColor: '#f5f5f5' }}>
                  <Typography variant="body1">
                    {previewMedia.caption}
                  </Typography>
                </Box>
              )}

              {previewMedia.name && (
                <Box sx={{ p: 2, borderTop: '1px solid #eee' }}>
                  <Typography variant="caption" color="text.secondary">
                    {previewMedia.name}
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

export default MediaViewer;
