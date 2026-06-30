const mongoose = require('mongoose');

/**
 * logs — auditoria e rastreamento de eventos do sistema (login,
 * pagamento, deploy, erros). Use `Log.registrar(...)` em vez de inserir
 * documentos manualmente, para manter o formato consistente.
 */
const logSchema = new mongoose.Schema(
  {
    nivel: { type: String, enum: ['info', 'warn', 'error', 'audit'], default: 'info' },
    origem: { type: String, required: true }, // ex: 'auth', 'pagamento', 'deploy'
    mensagem: { type: String, required: true },
    discordId: { type: String },
    metadata: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true, collection: 'logs' }
);

logSchema.statics.registrar = function registrar({
  nivel = 'info',
  origem,
  mensagem,
  discordId,
  metadata,
}) {
  return this.create({ nivel, origem, mensagem, discordId, metadata });
};

module.exports = mongoose.models.Log || mongoose.model('Log', logSchema);
