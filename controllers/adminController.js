const { User, Cliente, Pagamento, Application, Produto, Log } = require('../models');
const config = require('../config');

/**
 * GET /admin/me
 * Retorna informações do administrador autenticado.
 */
const getMe = async (req, res, next) => {
  try {
    const user = await User.findOne({ discordId: req.user.id });
    res.json({
      discordId: req.user.id,
      isAdmin: true,
      user: user || null,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /admin/dashboard
 * Retorna um resumo rápido para o painel administrativo.
 */
const getDashboard = async (req, res, next) => {
  try {
    const [
      totalClientes,
      totalPedidos,
      pedidosAprovados,
      totalBots,
      botsOnline,
      botsOffline,
      totalProdutos,
      logsRecentes,
    ] = await Promise.all([
      Cliente.countDocuments(),
      Pagamento.countDocuments(),
      Pagamento.countDocuments({ status: 'approved' }),
      Application.countDocuments({ status: { $ne: 'removido' } }),
      Application.countDocuments({ status: 'online' }),
      Application.countDocuments({ status: 'offline' }),
      Produto.countDocuments({ status: 'ativo' }),
      Log.find().sort({ createdAt: -1 }).limit(10),
    ]);

    // Receita total
    const receitaAgg = await Pagamento.aggregate([
      { $match: { status: 'approved' } },
      { $group: { _id: null, total: { $sum: '$valor' } } },
    ]);
    const receitaTotal = receitaAgg[0]?.total || 0;

    res.json({
      totalClientes,
      totalPedidos,
      pedidosAprovados,
      receitaTotal,
      totalBots,
      botsOnline,
      botsOffline,
      totalProdutos,
      logsRecentes,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getMe, getDashboard };
