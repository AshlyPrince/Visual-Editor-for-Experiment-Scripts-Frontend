import React from 'react';
import { 
  TextField, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  FormHelperText,
  Checkbox,
  FormControlLabel,
  Radio,
  RadioGroup,
  Switch,
  Slider,
  Box,
  Typography,
  Chip
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { createFormStyles } from '../../styles/components';
import { borderRadius, colors } from '../../styles/tokens';

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: borderRadius.md,
    '&.Mui-focused fieldset': {
      borderWidth: 2
    }
  },
  '& .MuiInputLabel-root': {
    fontWeight: 600
  }
}));

const StyledFormControl = styled(FormControl)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: borderRadius.md
  },
  '& .MuiInputLabel-root': {
    fontWeight: 600
  }
}));

const StyledSelect = styled(Select)(({ theme }) => ({
  borderRadius: borderRadius.md
}));

export const TextInput = ({ 
  label, 
  error, 
  helperText, 
  required = false, 
  ...props 
}) => (
  <StyledTextField
    label={label}
    error={!!error}
    helperText={error || helperText}
    required={required}
    fullWidth
    variant="outlined"
    {...props}
  />
);

export const SelectInput = ({ 
  label, 
  options = [], 
  error, 
  helperText, 
  required = false,
  multiple = false,
  ...props 
}) => (
  <StyledFormControl fullWidth error={!!error}>
    <InputLabel required={required}>{label}</InputLabel>
    <StyledSelect
      label={label}
      multiple={multiple}
      renderValue={multiple ? (selected) => (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          {selected.map((value) => (
            <Chip 
              key={value} 
              label={options.find(opt => opt.value === value)?.label || value}
              size="small" 
            />
          ))}
        </Box>
      ) : undefined}
      {...props}
    >
      {options.map((option) => (
        <MenuItem key={option.value} value={option.value}>
          {option.label}
        </MenuItem>
      ))}
    </StyledSelect>
    {(error || helperText) && (
      <FormHelperText>{error || helperText}</FormHelperText>
    )}
  </StyledFormControl>
);

export const CheckboxInput = ({ 
  label, 
  checked, 
  onChange, 
  color = 'primary',
  ...props 
}) => (
  <FormControlLabel
    control={
      <Checkbox
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        color={color}
        {...props}
      />
    }
    label={label}
  />
);

export const RadioInput = ({ 
  label, 
  options = [], 
  value, 
  onChange, 
  row = false,
  ...props 
}) => (
  <FormControl component="fieldset">
    {label && (
      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
        {label}
      </Typography>
    )}
    <RadioGroup
      value={value}
      onChange={(e) => onChange(e.target.value)}
      row={row}
      {...props}
    >
      {options.map((option) => (
        <FormControlLabel
          key={option.value}
          value={option.value}
          control={<Radio />}
          label={option.label}
        />
      ))}
    </RadioGroup>
  </FormControl>
);

export const SwitchInput = ({ 
  label, 
  checked, 
  onChange, 
  color = 'primary',
  ...props 
}) => (
  <FormControlLabel
    control={
      <Switch
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        color={color}
        {...props}
      />
    }
    label={label}
  />
);

export const SliderInput = ({ 
  label, 
  value, 
  onChange, 
  min = 0, 
  max = 100, 
  step = 1,
  marks = false,
  valueLabelDisplay = 'auto',
  ...props 
}) => (
  <Box sx={{ px: 1 }}>
    {label && (
      <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
        {label}
      </Typography>
    )}
    <Slider
      value={value}
      onChange={(e, newValue) => onChange(newValue)}
      min={min}
      max={max}
      step={step}
      marks={marks}
      valueLabelDisplay={valueLabelDisplay}
      sx={{
        color: colors.primary.main,
        '& .MuiSlider-thumb': {
          backgroundColor: colors.primary.main
        },
        '& .MuiSlider-track': {
          backgroundColor: colors.primary.main
        }
      }}
      {...props}
    />
  </Box>
);

export const FormField = ({ children, ...props }) => (
  <Box sx={{ ...createFormStyles().field, ...props.sx }} {...props}>
    {children}
  </Box>
);

export const FormGroup = ({ children, columns = 1, ...props }) => (
  <Box 
    sx={{ 
      display: 'grid', 
      gap: 2,
      gridTemplateColumns: { 
        xs: '1fr', 
        md: `repeat(${columns}, 1fr)` 
      },
      ...props.sx 
    }} 
    {...props}
  >
    {children}
  </Box>
);

export const FormSection = ({ title, children, ...props }) => (
  <Box sx={{ mb: 4, ...props.sx }} {...props}>
    {title && (
      <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
        {title}
      </Typography>
    )}
    {children}
  </Box>
);

export default TextInput;
