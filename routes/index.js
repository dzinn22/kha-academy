/**
 * routes/index.js — Mantido para compatibilidade retroativa.
 *
 * Este arquivo era o ponto único de rotas na v1.0.
 * Na v2.0, as rotas foram modularizadas em:
 *   - routes/public.js  (rotas públicas e de usuário)
 *   - routes/admin.js   (rotas administrativas)
 *
 * O server.js agora usa diretamente os novos arquivos de rotas.
 * Este arquivo é preservado para referência histórica.
 */

const publicRoutes = require('./public');
const adminRoutes = require('./admin');

module.exports = { publicRoutes, adminRoutes };
