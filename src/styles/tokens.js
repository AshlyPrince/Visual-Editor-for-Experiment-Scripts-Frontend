

export const colors = {
  
  primary: {
    main: '#1E3A8A',     
    light: '#3B82F6',    
    dark: '#1E40AF',     
    50: '#EFF6FF',
    100: '#DBEAFE',
    200: '#BFDBFE',
    300: '#93C5FD',
    400: '#60A5FA',
    500: '#3B82F6',
    600: '#2563EB',
    700: '#1D4ED8',
    800: '#1E40AF',
    900: '#1E3A8A',
  },
  
  secondary: {
    main: '#1E3A8A',     
    light: '#3B82F6',    
    dark: '#0F172A',     
    50: '#F8FAFC',
    100: '#F1F5F9',
    200: '#E2E8F0',
    300: '#CBD5E1',
    400: '#94A3B8',
    500: '#64748B',
    600: '#475569',
    700: '#334155',
    800: '#1E293B',
    900: '#0F172A',
  },
  success: {
    main: '#2563EB',     
    light: '#60A5FA',
    dark: '#1E40AF',
  },
  warning: {
    main: '#FF9800',     
    light: '#FFB74D',
    dark: '#F57C00',
  },
  error: {
    main: '#F44336',     
    light: '#EF5350',
    dark: '#D32F2F',
  },
  info: {
    main: '#2196F3',     
    light: '#42A5F5',
    dark: '#1976D2',
  },
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
    main: '#6b7280',
    light: '#9ca3af',
    dark: '#374151',
  }
};

export const corporateColors = {
  
  black: '#0F172A',         
  white: '#FFFFFF',         
  darkBlue: '#1E3A8A',      
  navyBlue: '#1E40AF',      
  
  
  charcoal: '#1E293B',      
  slate: '#64748B',         
  platinum: '#F1F5F9',      
  lightGray: '#F8FAFC',     
};

export const gradients = {
  
  primary: colors.primary.main,
  secondary: colors.secondary.main,
  success: colors.success.main,
  warning: colors.warning.main,
  info: colors.info.main,
  corporate: colors.primary.main,
  professional: corporateColors.charcoal,
};

export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  hover: '0 8px 25px rgba(0,0,0,0.1)',
  focus: '0 0 0 3px rgba(59, 130, 246, 0.1)',
};

export const animations = {
  fadeInUp: 'fadeInUp 0.6s ease-out',
  slideInRight: 'slideInRight 0.4s ease-out',
  pulse: 'pulse 2s infinite',
  shimmer: 'shimmer 2s infinite',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  round: '50%',
};

export const typography = {
  fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  fontSize: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
  },
  fontWeight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
};
