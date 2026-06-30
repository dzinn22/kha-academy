const mongoose = require('mongoose');

/**
 * applications — bots hospedados de cada cliente.
 *
 * Guarda o vínculo entre cliente, produto comprado, aplicação do
 * Discord e aplicação na Discloud, conforme exigido pelo "Sistema de
 * Bots Hospedados" do projeto.
 *
 * SEGURANÇA: `botTokenEncrypted` deve guardar o token do bot já
 * criptografado (nunca em texto puro). A criptografia em si (ex.
 * AES-256-GCM com chave em variável de ambiente) faz parte da fase de
 * Segurança — este campo só está reservado aqui para não exigir uma
 * migração de schema depois.
 */
const applicationSchema = new mongoose.Schema(
  {
    ownerDiscordId: { type: String, required: true, index: true },
    produto: { type: mongoose.Schema.Types.ObjectId, ref: 'Produto', required: true },
    pagamento: { type: mongoose.Schema.Types.ObjectId, ref: 'Pagamento' },
    nomeBot: { type: String, required: true },
    discordApplicationId: { type: String, required: true },
    discloudAppId: { type: String },
    botTokenEncrypted: { type: String, select: false },
    status: {
      type: String,
      enum: ['provisionando', 'online', 'offline', 'erro', 'removido'],
      default: 'provisionando',
      index: true,
    },
  },
  { timestamps: true, collection: 'applications' }
);

module.exports =
  mongoose.models.Application || mongoose.model('Application', applicationSchema);
