

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https:

const mockTemplates = [
  {
    id: '1',
    name: 'Basic Survey Template',
    description: 'A simple survey template for gathering user feedback',
    category: 'survey',
    sections: [
      { id: 's1', name: 'Demographics', type: 'form', required: true },
      { id: 's2', name: 'Questions', type: 'survey', required: true },
      { id: 's3', name: 'Feedback', type: 'text', required: false }
    ],
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-20T15:30:00Z',
    version: '1.0'
  },
  {
    id: '2',
    name: 'A/B Testing Template',
    description: 'Template for conducting A/B tests with variant management',
    category: 'testing',
    sections: [
      { id: 's1', name: 'Test Setup', type: 'configuration', required: true },
      { id: 's2', name: 'Variants', type: 'comparison', required: true },
      { id: 's3', name: 'Metrics', type: 'analytics', required: true }
    ],
    createdAt: '2024-01-10T14:20:00Z',
    updatedAt: '2024-01-18T09:15:00Z',
    version: '1.2'
  }
];

const mockExperiments = [
  {
    id: 'exp1',
    templateId: '1',
    name: 'User Satisfaction Survey Q1 2024',
    description: 'Quarterly user satisfaction assessment',
    status: 'active',
    parameters: {
      targetAudience: 'all-users',
      duration: '2-weeks',
      sampleSize: 500
    },
    createdAt: '2024-01-25T08:00:00Z',
    createdBy: 'user123'
  }
];

class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL;
    
    this.developmentMode = true; 
  }

  async request(endpoint, options = {}) {
    
    if (this.developmentMode) {
      return this.handleMockRequest(endpoint, options);
    }

    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch {
      throw error;
    }
  }

  async handleMockRequest(endpoint, options = {}) {
    
    
    await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 700));

    const method = options.method || 'GET';
    
    
    if (endpoint === '/templates' && method === 'GET') {
      return { data: mockTemplates };
    }
    
    if (endpoint.match(/^\/templates\/\w+$/) && method === 'GET') {
      const templateId = endpoint.split('/').pop();
      const template = mockTemplates.find(t => t.id === templateId);
      if (!template) throw new Error('Template not found');
      return { data: template };
    }
    
    if (endpoint === '/experiments' && method === 'GET') {
      return { data: mockExperiments };
    }
    
    if (endpoint === '/experiments' && method === 'POST') {
      const newExperiment = {
        id: `exp${Date.now()}`,
        ...JSON.parse(options.body),
        createdAt: new Date().toISOString(),
        status: 'draft'
      };
      mockExperiments.push(newExperiment);
      return { data: newExperiment };
    }

    throw new Error(`Mock endpoint not implemented: ${method} ${endpoint}`);
  }
}

import authService from './authService.js';
import keycloakService from './keycloakService.js';
import experimentService from './experimentService.js';
import llmService from './llmService.js';
export { experimentService, authService, keycloakService, llmService };
