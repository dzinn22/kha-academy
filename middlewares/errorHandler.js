const { Log } = require('../models');

/**
 * Middleware global de tratamento de erros.
 * Captura todos os erros não tratados e retorna resposta padronizada.
 */
const errorHandler = async (err, req, res, next) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Erro interno do servidor';

  // Registrar erro crítico no log de auditoria
  if (status >= 500) {
    try {
      await Log.registrar({
        nivel: 'error',
        origem: 'sistema',
        mensagem: `Erro interno: ${message}`,
        discordId: req.user?.id,
        metadata: {
          method: req.method,
          path: req.path,
          stack: err.stack,
        },
      });
    } catch (_) {
      // Evitar loop infinito de erros
    }
  }

  // Erros de validação do Mongoose
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ error: 'Erro de validação', details: errors });
  }

  // Erro de chave duplicada do MongoDB
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'campo';
    return res.status(409).json({ error: `Valor duplicado para o campo: ${field}` });
  }

  // Erro de CastError (ID inválido)
  if (err.name === 'CastError') {
    return res.status(400).json({ error: 'ID inválido' });
  }

  return res.status(status).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;
