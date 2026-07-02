const mongoose = require('mongoose');

/**
 * deploys — acompanha cada execução do fluxo pós-pagamento (etapas 1 a 8
 * descritas no documento de requisitos: coletar token/nome, validar,
 * localizar source, aplicar config, deploy na Discloud, salvar no banco,
 * avisar o usuário, redirecionar).
 */
const deploySchema = new mongoose.Schema(
  {
    application: { type: mongoose.Schema.Types.ObjectId, ref: 'Application', required: true },
    discloudAppId: { type: String },
    etapaAtual: { type: Number, min: 1, max: 8, default: 1 },
    status: {
      type: String,
      enum: ['em_andamento', 'concluido', 'falhou'],
      default: 'em_andamento',
      index: true,
    },
    erro: { type: String },
  },
  { timestamps: true, collection: 'deploys' }
);

module.exports = mongoose.models.Deploy || mongoose.model('Deploy', deploySchema);
