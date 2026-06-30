const mongoose = require('mongoose');

/**
 * clientes — perfil comercial do comprador.
 *
 * Separado de `users` (identidade de login) para manter o histórico de
 * compras e aplicações mesmo que a lógica de autenticação mude no
 * futuro. Ligado ao usuário pelo `discordId`.
 */
const clienteSchema = new mongoose.Schema(
  {
    discordId: { type: String, required: true, unique: true, index: true },
    nome: { type: String },
    email: { type: String },
    totalCompras: { type: Number, default: 0 },
    aplicacoes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Application' }],
  },
  { timestamps: true, collection: 'clientes' }
);

module.exports = mongoose.models.Cliente || mongoose.model('Cliente', clienteSchema);
