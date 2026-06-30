const { Log } = require('../models');

/**
 * GET /admin/logs
 * Lista os logs de auditoria com filtros por usuário, data e tipo.
 */
const listar = async (req, res, next) => {
  try {
    const {
      discordId,
      nivel,
      origem,
      startDate,
      endDate,
      page = 1,
      limit = 50,
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const filtro = {};

    if (discordId) filtro.discordId = discordId;
    if (nivel) filtro.nivel = nivel;
    if (origem) filtro.origem = { $regex: origem, $options: 'i' };
    if (startDate || endDate) {
      filtro.createdAt = {};
      if (startDate) filtro.createdAt.$gte = new Date(startDate);
      if (endDate) filtro.createdAt.$lte = new Date(endDate);
    }

    const [logs, total] = await Promise.all([
      Log.find(filtro)
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ createdAt: -1 }),
      Log.countDocuments(filtro),
    ]);

    res.json({
      data: logs,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { listar };
