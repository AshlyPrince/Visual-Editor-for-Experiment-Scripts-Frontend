
import { useState, useCallback, useEffect } from 'react';
import { experimentService, authService } from '../services/exports';

export const useExperimentTemplate = (initialTemplate = null) => {
  const [template, setTemplate] = useState(initialTemplate);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const updateTemplate = useCallback((updates) => {
    setTemplate(prev => ({
      ...prev,
      ...updates,
      lastModified: new Date().toISOString()
    }));
  }, []);

  const validateTemplate = useCallback(() => {
    if (!template) return { isValid: false, errors: ['Template is required'] };
    
    const errors = [];
    if (!template.name?.trim()) errors.push('Template name is required');
    if (!template.description?.trim()) errors.push('Template description is required');
    if (!template.sections?.length) errors.push('At least one section is required');

    return { isValid: errors.length === 0, errors };
  }, [template]);

  const resetTemplate = useCallback(() => {
    setTemplate(null);
    setError(null);
  }, []);

  return {
    template,
    setTemplate,
    updateTemplate,
    validateTemplate,
    resetTemplate,
    loading,
    setLoading,
    error,
    setError
  };
};

export const useWizardSteps = (steps = []) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const [stepData, setStepData] = useState({});

  const nextStep = useCallback(() => {
    setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
  }, [steps.length]);

  const previousStep = useCallback(() => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  }, []);

  const goToStep = useCallback((stepIndex) => {
    if (stepIndex >= 0 && stepIndex < steps.length) {
      setCurrentStep(stepIndex);
    }
  }, [steps.length]);

  const markStepComplete = useCallback((stepIndex) => {
    setCompletedSteps(prev => new Set([...prev, stepIndex]));
  }, []);

  const updateStepData = useCallback((stepIndex, data) => {
    setStepData(prev => ({
      ...prev,
      [stepIndex]: { ...prev[stepIndex], ...data }
    }));
  }, []);

  const isStepComplete = useCallback((stepIndex) => {
    return completedSteps.has(stepIndex);
  }, [completedSteps]);

  const canProceedToNext = useCallback(() => {
    return currentStep < steps.length - 1;
  }, [currentStep, steps.length]);

  const canGoBack = useCallback(() => {
    return currentStep > 0;
  }, [currentStep]);

  const resetWizard = useCallback(() => {
    setCurrentStep(0);
    setCompletedSteps(new Set());
    setStepData({});
  }, []);

  return {
    currentStep,
    completedSteps,
    stepData,
    nextStep,
    previousStep,
    goToStep,
    markStepComplete,
    updateStepData,
    isStepComplete,
    canProceedToNext,
    canGoBack,
    resetWizard
  };
};

export const useAsyncOperation = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const execute = useCallback(async (asyncFunction, ...args) => {
    try {
      setLoading(true);
      setError(null);
      const result = await asyncFunction(...args);
      setData(result);
      return result;
    } catch (err) {
      setError(err.message || 'An error occurred');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setData(null);
  }, []);

  return {
    loading,
    error,
    data,
    execute,
    reset
  };
};

export const useExperimentCreation = () => {
  const [experiment, setExperiment] = useState(null);
  const [status, setStatus] = useState('draft'); 
  const { execute: executeCreate, loading: creating, error: createError } = useAsyncOperation();

  const initializeExperiment = useCallback((templateId, initialData = {}) => {
    setExperiment({
      id: null,
      templateId,
      name: '',
      description: '',
      parameters: {},
      status: 'draft',
      createdAt: new Date().toISOString(),
      ...initialData
    });
    setStatus('draft');
  }, []);

  const updateExperiment = useCallback((updates) => {
    setExperiment(prev => ({
      ...prev,
      ...updates,
      lastModified: new Date().toISOString()
    }));
  }, []);

  const createExperiment = useCallback(async () => {
    if (!experiment) return;

    try {
      setStatus('creating');
      const result = await executeCreate(experimentService.createExperiment, experiment);
      setExperiment(result);
      setStatus('created');
      return result;
    } catch {
      setStatus('error');
      throw error;
    }
  }, [experiment, executeCreate]);

  const resetExperiment = useCallback(() => {
    setExperiment(null);
    setStatus('draft');
  }, []);

  return {
    experiment,
    status,
    creating,
    createError,
    initializeExperiment,
    updateExperiment,
    createExperiment,
    resetExperiment
  };
};

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const authUser = await authService.getCurrentUser();
        if (authUser) {
          setUser(authUser);
          setIsAuthenticated(true);
        }
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = useCallback(async (credentials) => {
    setLoading(true);
    try {
      const authUser = await authService.login(credentials);
      setUser(authUser);
      setIsAuthenticated(true);
      return authUser;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await authService.logout();
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    user,
    isAuthenticated,
    loading,
    login,
    logout
  };
};

export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = useCallback((notification) => {
    const id = Date.now() + Math.random();
    const newNotification = {
      id,
      type: 'info',
      autoHideDuration: 5000,
      ...notification
    };
    
    setNotifications(prev => [...prev, newNotification]);

    if (newNotification.autoHideDuration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, newNotification.autoHideDuration);
    }

    return id;
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  return {
    notifications,
    addNotification,
    removeNotification,
    clearNotifications
  };
};
