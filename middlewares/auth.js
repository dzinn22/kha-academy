const jwt = require('jsonwebtoken');
const config = require('../config');

/**
 * Verifica se o token JWT é válido e injeta req.user.
 * Mantém compatibilidade total com o sistema existente.
 */
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(403).json({ error: 'Token não fornecido' });

  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido' });
  }
};

/**
 * Verifica se o usuário autenticado é administrador.
 * Usa a lista ADMIN_IDS da variável de ambiente.
 * Deve ser usado APÓS verifyToken.
 */
const isAdmin = (req, res, next) => {
  if (req.user && config.adminIds.includes(req.user.id)) {
    return next();
  }
  return res.status(403).json({ error: 'Acesso negado: requer privilégios de administrador' });
};

/**
 * Middleware combinado: verifica token + admin em uma única chamada.
 * Útil para rotas /admin/* que exigem ambas as verificações.
 */
const adminAuth = [verifyToken, isAdmin];

module.exports = { verifyToken, isAdmin, adminAuth };
