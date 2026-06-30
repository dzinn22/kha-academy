const mongoose = require('mongoose');

/**
 * users — identidade de login (Discord OAuth2).
 *
 * Representa quem é a pessoa autenticada no site. Dados comerciais
 * (compras, bots) ficam em `clientes` e `applications`, ligados por
 * `discordId`, para manter a identidade de login separada do histórico
 * comercial.
 */
const userSchema = new mongoose.Schema(
  {
    discordId: { type: String, required: true, unique: true, index: true },
    username: { type: String, required: true },
    discriminator: { type: String },
    email: { type: String },
    avatar: { type: String },
    isAdmin: { type: Boolean, default: false },
    isSuspended: { type: Boolean, default: false },
    lastLoginAt: { type: Date },
    lastLoginIp: { type: String },
  },
  { timestamps: true, collection: 'users' }
);

module.exports = mongoose.models.User || mongoose.model('User', userSchema);
