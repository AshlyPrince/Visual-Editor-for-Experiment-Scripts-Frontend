import React from 'react';
import { 
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Typography,
  Box,
  Slide
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Close as CloseIcon } from '@mui/icons-material';
import { createDialogStyles } from '../../styles/components';
import { borderRadius } from '../../styles/tokens';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    ...createDialogStyles(theme).paper
  }
}));

const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
  ...createDialogStyles(theme).title,
  position: 'relative'
}));

const StyledDialogContent = styled(DialogContent)(({ theme }) => ({
  ...createDialogStyles(theme).content
}));

const StyledDialogActions = styled(DialogActions)(({ theme }) => ({
  ...createDialogStyles(theme).actions
}));

const TitleIcon = styled(Box)(({ theme }) => ({
  ...createDialogStyles(theme).titleIcon
}));

const CloseButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  right: theme.spacing(1),
  top: theme.spacing(1),
  color: theme.palette.grey[500]
}));

const Modal = ({
  open = false,
  onClose,
  title,
  titleIcon,
  children,
  actions,
  maxWidth = 'sm',
  fullWidth = true,
  showCloseButton = true,
  ...props
}) => {
  return (
    <StyledDialog
      open={open}
      onClose={onClose}
      TransitionComponent={Transition}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      {...props}
    >
      {(title || titleIcon) && (
        <StyledDialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {titleIcon && (
              <TitleIcon>
                {titleIcon}
              </TitleIcon>
            )}
            <Typography variant="h6" component="h2" sx={{ fontWeight: 600 }}>
              {title}
            </Typography>
          </Box>
          {showCloseButton && (
            <CloseButton onClick={onClose}>
              <CloseIcon />
            </CloseButton>
          )}
        </StyledDialogTitle>
      )}

      <StyledDialogContent>
        {children}
      </StyledDialogContent>

      {actions && (
        <StyledDialogActions>
          {actions}
        </StyledDialogActions>
      )}
    </StyledDialog>
  );
};

export default Modal;
