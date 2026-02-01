import api from '../lib/api.js';
import keycloakService from './keycloakService.js';
import { toCanonical } from '../utils/experimentCanonical.js';

class ExperimentService {
  async getExperiments(params = {}, t = null) {
    const { page = 1, limit = 20, search = '' } = params;
    const queryParams = new URLSearchParams({ page, limit });
    
    if (search) {
      queryParams.append('search', search);
    }

    const url = `/api/experiments?${queryParams}`;
    
    try {
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      if (!t) {
        if (error.response?.status === 404) {
          throw new Error('Experiments could not be found. Please try again.');
        } else if (error.response?.status === 500) {
          throw new Error('Server error occurred while loading experiments. Please try again later.');
        } else if (!error.response) {
          throw new Error('Unable to connect to the server. Please check your internet connection.');
        }
        throw new Error('Unable to load experiments. Please try again.');
      }
      
      if (error.response?.status === 404) {
        throw new Error(t('errors.experimentsNotFound'));
      } else if (error.response?.status === 500) {
        throw new Error(t('errors.serverError'));
      } else if (!error.response) {
        throw new Error(t('errors.connectionError'));
      }
      throw new Error(t('errors.loadExperimentsFailed'));
    }
  }

  async getExperiment(id) {
    const response = await api.get(`/api/experiments/${id}`);
    return response.data;
  }

  async createExperiment(experimentData) {
    const response = await api.post('/api/experiments', experimentData);
    return response.data;
  }

  async updateExperiment(id, updateData) {
    const response = await api.put(`/api/experiments/${id}`, updateData);
    return response.data;
  }

  async deleteExperiment(id) {
    const response = await api.delete(`/api/experiments/${id}`);
    return response.data;
  }

  async duplicateExperiment(id, duplicateData) {
    const response = await api.post(`/api/experiments/${id}/duplicate`, duplicateData);
    return response.data;
  }

  async createVersion(experimentId, versionData) {
    const response = await api.post(`/api/experiments/${experimentId}/versions`, versionData);
    return response.data;
  }

  async getVersionHistory(experimentId) {
    const response = await api.get(`/api/experiments/${experimentId}/versions`);
    return response.data;
  }

  async checkoutVersion(experimentId, versionId) {
    const response = await api.post(`/api/experiments/${experimentId}/versions/${versionId}/checkout`);
    return response.data;
  }

  async getActivityLog(experimentId, limit = 50) {
    const response = await api.get(`/api/experiments/${experimentId}/activity?limit=${limit}`);
    return response.data;
  }

  async getPublicExperiment(id, versionId = null) {
    const queryParams = versionId ? `?version_id=${versionId}` : '';
    const response = await api.get(`/api/experiments/${id}/view${queryParams}`);
    return response.data;
  }

  async createFromWizard(wizardData, t = null) {
    const { name, description, duration, subject, gradeLevel, sections, permissions } = wizardData;
    
    const userInfo = keycloakService.getUserInfo();
    const isAuthenticated = keycloakService.isAuthenticated();
    const userId = userInfo?.id || userInfo?.sub || userInfo?.preferred_username || userInfo?.email;
    
    if (!userId || !isAuthenticated) {
      const errorMsg = t 
        ? t('errors.userNotAuthenticated')
        : 'User not authenticated. Please log in to create experiments.';
      throw new Error(errorMsg);
    }
    
    const defaultTitle = t ? t('experiment.untitledExperiment') : 'Untitled Experiment';
    const commitMsg = t ? t('experiment.createdWithWizard') : 'Created with Experiment Wizard';
    
    const experimentData = {
      title: name || defaultTitle,
      ...(description && { description }),
      created_by: userId,
      content: {
        config: {
          duration: duration || '',
          subject: subject || '',
          gradeLevel: gradeLevel || ''
        },
        sections: sections,
        permissions: permissions  // Include permissions in content
      },
      html_content: this.generateHTMLFromSections(sections, { name, duration, subject, gradeLevel }, t),
      commit_message: commitMsg
    };

    try {
      return await this.createExperiment(experimentData);
    } catch (error) {
      if (error.response?.status === 400) {
        const errorMessage = error.response?.data?.message || error.response?.data?.error || 
          (t ? t('errors.invalidExperimentData') : 'Invalid experiment data');
        
        if (errorMessage.includes('created_by') && errorMessage.includes('null')) {
          const authError = t 
            ? t('errors.authenticationError')
            : 'Authentication error: Unable to verify user identity. Please log out and log in again. If the problem persists, contact support.';
          throw new Error(authError);
        }
        
        const validationError = t
          ? t('errors.invalidExperimentDataWithDetails', { errorMessage })
          : `Invalid experiment data: ${errorMessage}. Please check all required fields are filled correctly.`;
        throw new Error(validationError);
      } else if (error.response?.status === 500) {
        const serverError = t
          ? t('errors.serverErrorCreating')
          : 'Server error occurred while creating the experiment. Please try again.';
        throw new Error(serverError);
      }
      const generalError = t
        ? t('errors.unableToCreateExperiment')
        : 'Unable to create experiment. Please try again or contact support.';
      throw new Error(generalError);
    }
  }

  
  async updateFromWizard(experimentId, wizardData, t = null) {
    const currentExperiment = await this.getExperiment(experimentId);
    const canonical = toCanonical(currentExperiment);
    
    const defaultVersionName = t ? t('experiment.updated') : 'Updated';
    const commitMsg = t ? t('experiment.updatedWithWizard') : 'Updated with Experiment Wizard';
    
    const versionData = {
      title: `${t ? t('experiment.version') : 'Version'} - ${wizardData.name || defaultVersionName}`,
      content: {
        ...canonical.content,
        config: {
          ...canonical.content.config,
          duration: wizardData.duration || '',
          subject: wizardData.subject || '',
          gradeLevel: wizardData.gradeLevel || ''
        },
        sections: wizardData.sections
      },
      html_content: this.generateHTMLFromSections(
        wizardData.sections, 
        { 
          name: wizardData.name,
          duration: wizardData.duration,
          subject: wizardData.subject,
          gradeLevel: wizardData.gradeLevel 
        },
        t
      ),
      commit_message: commitMsg
    };

    return this.createVersion(experimentId, versionData);
  }

  generateHTMLFromSections(sections, config = {}, t = null) {
    const defaultTitle = t ? t('experiment.untitledExperiment') : 'Untitled Experiment';
    
    let html = `
      <div class="experiment-document">
        <header class="experiment-header">
          <h1>${config.name || defaultTitle}</h1>
          <div class="experiment-meta">
            ${config.gradeLevel ? `<span class="grade-level">${config.gradeLevel}</span>` : ''}
            ${config.subject ? `<span class="subject">${config.subject}</span>` : ''}
            ${config.duration ? `<span class="duration">${config.duration}</span>` : ''}
          </div>
          ${config.description ? `<p class="description">${config.description}</p>` : ''}
        </header>
        <main class="experiment-content">
    `;

    sections.forEach(section => {
      html += `
        <section class="experiment-section" id="section-${section.id}">
          <h2>${section.icon} ${section.name}</h2>
          <div class="section-content">
      `;

      if (section.content) {
        if (section.id === 'materials' && section.content.materials) {
          html += `<ul>${section.content.materials.map(item => `<li>${item}</li>`).join('')}</ul>`;
        } else if (section.id === 'procedure' && section.content.steps) {
          html += `<ol>${section.content.steps.map(step => `<li>${step}</li>`).join('')}</ol>`;
        } else if (section.content.text) {
          html += `<p>${section.content.text}</p>`;
        }
      }

      html += `
          </div>
        </section>
      `;
    });

    html += `
        </main>
      </div>
    `;

    return html;
  }

  
  
  

  
  formatExperimentForList(experiment) {
    return {
      id: experiment.id,
      title: experiment.title,
      description: experiment.content?.config?.description || '',
      subject: experiment.content?.config?.subject || '',
      gradeLevel: experiment.content?.config?.gradeLevel || '',
      version: experiment.version_number || 1,
      updatedAt: new Date(experiment.updated_at),
      createdAt: new Date(experiment.created_at),
      isEducational: experiment.content?.type === 'educational_experiment'
    };
  }

  extractWizardData(experiment, t = null) {
    if (experiment.content?.type === 'educational_experiment') {
      return {
        sections: experiment.content.sections || [],
        config: experiment.content.config || {}
      };
    }
    
    const legacyDescription = t
      ? t('experiment.legacyDescription')
      : 'Legacy experiment - edit to convert to educational format';
    
    return {
      sections: [],
      config: {
        name: experiment.title,
        description: legacyDescription
      }
    };
  }

  // ============= PERMISSIONS & ACCESS CONTROL =============
  
  /**
   * Get permissions for an experiment
   */
  async getExperimentPermissions(experimentId) {
    const response = await api.get(`/api/experiments/${experimentId}/permissions`);
    return response.data;
  }

  /**
   * Update experiment permissions
   */
  async updateExperimentPermissions(experimentId, permissionsData) {
    const response = await api.put(`/api/experiments/${experimentId}/permissions`, permissionsData);
    return response.data;
  }

  /**
   * Check if current user has specific permission for an experiment
   */
  async checkUserPermission(experimentId, permission) {
    try {
      const response = await api.get(`/api/experiments/${experimentId}/permissions/check`, {
        params: { permission }
      });
      return response.data.hasPermission;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get current user's permission level for an experiment
   */
  async getUserPermissionLevel(experimentId) {
    try {
      const response = await api.get(`/api/experiments/${experimentId}/permissions/user`);
      return response.data.permissionLevel;
    } catch (error) {
      return null;
    }
  }

  // ============= ACCESS REQUESTS =============
  
  /**
   * Submit an access request for an experiment
   */
  async submitAccessRequest(experimentId, requestData) {
    const response = await api.post(`/api/experiments/${experimentId}/access-requests`, requestData);
    return response.data;
  }

  /**
   * Get all access requests for an experiment (owner only)
   */
  async getAccessRequests(experimentId, status = null) {
    const params = status ? { status } : {};
    const response = await api.get(`/api/experiments/${experimentId}/access-requests`, { params });
    return response.data;
  }

  /**
   * Get user's own access requests
   */
  async getUserAccessRequests(status = null) {
    const params = status ? { status } : {};
    const response = await api.get('/api/access-requests/my-requests', { params });
    return response.data;
  }

  /**
   * Approve an access request
   */
  async approveAccessRequest(experimentId, requestId, approvalData) {
    const response = await api.post(
      `/api/experiments/${experimentId}/access-requests/${requestId}/approve`, 
      approvalData
    );
    return response.data;
  }

  /**
   * Reject an access request
   */
  async rejectAccessRequest(experimentId, requestId, rejectionData) {
    const response = await api.post(
      `/api/experiments/${experimentId}/access-requests/${requestId}/reject`, 
      rejectionData
    );
    return response.data;
  }

  /**
   * Cancel user's own access request
   */
  async cancelAccessRequest(requestId) {
    const response = await api.delete(`/api/access-requests/${requestId}`);
    return response.data;
  }

  /**
   * Get count of pending access requests for an experiment
   */
  async getPendingAccessRequestsCount(experimentId) {
    try {
      const response = await api.get(`/api/experiments/${experimentId}/access-requests/count`, {
        params: { status: 'pending' }
      });
      return response.data.count || 0;
    } catch (error) {
      return 0;
    }
  }
}

const experimentService = new ExperimentService();

export default experimentService;
