const mongoose = require('mongoose');

/**
 * cupons — descontos aplicáveis durante o processo de compra.
 */
const cupomSchema = new mongoose.Schema(
  {
    codigo: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    desconto: {
      type: Number,
      required: true,
      min: 0,
    },
    tipo: {
      type: String,
      enum: ['percentual', 'fixo'],
      default: 'percentual',
    },
    expiracao: {
      type: Date,
    },
    limiteUsos: {
      type: Number,
      default: null, // null = ilimitado
    },
    totalUsos: {
      type: Number,
      default: 0,
    },
    ativo: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true, collection: 'cupons' }
);

// Verificar se o cupom ainda é válido
cupomSchema.methods.isValido = function () {
  if (!this.ativo) return false;
  if (this.expiracao && new Date() > this.expiracao) return false;
  if (this.limiteUsos !== null && this.totalUsos >= this.limiteUsos) return false;
  return true;
};

module.exports = mongoose.models.Cupom || mongoose.model('Cupom', cupomSchema);
