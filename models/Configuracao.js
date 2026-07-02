const mongoose = require('mongoose');

/**
 * configuracoes — configurações globais da plataforma persistidas no banco.
 * Apenas um documento deve existir (singleton).
 */
const configuracaoSchema = new mongoose.Schema(
  {
    // Identificador único do documento singleton
    chave: { type: String, default: 'global', unique: true },

    // Identidade do site
    nomeSite: { type: String, default: 'Bot Store' },
    logo: { type: String, default: '' },
    banner: { type: String, default: '' },

    // Modo manutenção
    manutencao: { type: Boolean, default: false },
    mensagemManutencao: { type: String, default: 'Sistema em manutenção. Voltamos em breve.' },

    // Mercado Pago
    mercadoPago: {
      accessToken: { type: String, default: '' },
      ativo: { type: Boolean, default: false },
    },

    // Discord OAuth2
    discord: {
      clientId: { type: String, default: '' },
      clientSecret: { type: String, default: '' },
      redirectUri: { type: String, default: '' },
    },

    // Discloud
    discloud: {
      apiToken: { type: String, default: '' },
      ativo: { type: Boolean, default: false },
    },
  },
  { timestamps: true, collection: 'configuracoes' }
);

module.exports = mongoose.models.Configuracao || mongoose.model('Configuracao', configuracaoSchema);
