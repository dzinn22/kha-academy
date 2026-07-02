const mongoose = require('mongoose');

/**
 * pagamentos — registro de cada cobrança PIX gerada via Mercado Pago.
 */
const pagamentoSchema = new mongoose.Schema(
  {
    mercadoPagoId: { type: String, required: true, unique: true, index: true },
    produto: { type: mongoose.Schema.Types.ObjectId, ref: 'Produto', required: true },
    discordId: { type: String, required: true, index: true },
    valor: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'cancelled', 'refunded'],
      default: 'pending',
      index: true,
    },
    qrCode: { type: String },
    qrCodeBase64: { type: String },
    pixCopiaCola: { type: String },
    confirmadoEm: { type: Date },
  },
  { timestamps: true, collection: 'pagamentos' }
);

module.exports = mongoose.models.Pagamento || mongoose.model('Pagamento', pagamentoSchema);
