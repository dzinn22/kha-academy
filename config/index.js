require('dotenv').config();

module.exports = {
  port: process.env.PORT || 4000,
  mongoUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET || 'api-secret-key',

  // Mercado Pago
  mercadoPago: {
    accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN,
  },

  // Discloud
  discloud: {
    apiToken: process.env.DISCLOUD_API_TOKEN,
    apiUrl: 'https://api.discloud.app/v2',
  },

  // Discord OAuth2
  discord: {
    clientId: process.env.DISCORD_CLIENT_ID,
    clientSecret: process.env.DISCORD_CLIENT_SECRET,
    redirectUri: process.env.DISCORD_REDIRECT_URI,
  },

  // Administradores (Discord IDs autorizados)
  adminIds: (process.env.ADMIN_IDS || '').split(',').map((id) => id.trim()).filter(Boolean),

  // CORS
  allowedOrigins: (process.env.ALLOWED_ORIGINS || 'http://localhost:3000').split(',').map((o) => o.trim()),

  // Criptografia
  encryptionKey: process.env.ENCRYPTION_KEY,

  // Upload
  upload: {
    maxFileSize: 50 * 1024 * 1024, // 50MB
    allowedImageTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    allowedZipTypes: ['application/zip', 'application/x-zip-compressed', 'application/octet-stream'],
  },
};
