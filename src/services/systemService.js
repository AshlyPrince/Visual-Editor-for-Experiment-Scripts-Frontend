import api from '../lib/api.js';

class SystemService {
  
  
  async getHealth() {
    try {
      const response = await api.get('/health');
      return response.data;
    } catch {
      return {
        status: 'error',
        error: error.message,
        time: new Date().toISOString()
      };
    }
  }

  
  async getDatabaseStatus() {
    try {
      const response = await api.get('/db/ping');
      return response.data;
    } catch {
      return {
        db: 'down',
        error: error.message
      };
    }
  }

  
  async getSystemStatus() {
    try {
      const [health, database] = await Promise.allSettled([
        this.getHealth(),
        this.getDatabaseStatus()
      ]);

      return {
        system: health.status === 'fulfilled' ? health.value : { status: 'error', error: health.reason },
        database: database.status === 'fulfilled' ? database.value : { db: 'down', error: database.reason },
        timestamp: new Date().toISOString()
      };
    } catch {
      return {
        system: { status: 'error', error: error.message },
        database: { db: 'down', error: error.message },
        timestamp: new Date().toISOString()
      };
    }
  }
}

const systemService = new SystemService();

export default systemService;
