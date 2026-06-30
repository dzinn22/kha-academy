const axios = require('axios');
const config = require('../config');

class DiscloudService {
  constructor() {
    this.api = axios.create({
      baseURL: config.discloud.apiUrl,
      headers: { 'api-token': config.discloud.apiToken }
    });
  }

  async upload(fileBuffer, fileName) {
    // Lógica de upload usando FormData (omitida para brevidade, similar à anterior)
  }

  async action(appId, method) {
    try {
      const response = await this.api.put(`/app/${appId}/${method}`);
      return response.data;
    } catch (err) {
      throw new Error(`Erro na Discloud: ${err.message}`);
    }
  }

  async getStatus(appId) {
    try {
      const response = await this.api.get(`/app/${appId}/status`);
      return response.data;
    } catch (err) {
      return null;
    }
  }
}

module.exports = new DiscloudService();
