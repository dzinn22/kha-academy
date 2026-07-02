const { Cliente, Pagamento, Application, Produto } = require('../models');

/**
 * GET /admin/stats
 * Retorna estatísticas completas da plataforma.
 */
const getStats = async (req, res, next) => {
  try {
    const agora = new Date();
    const inicioDia = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate());
    const inicioMes = new Date(agora.getFullYear(), agora.getMonth(), 1);

    const [
      totalClientes,
      totalPedidos,
      totalProdutosCadastrados,
      botsAtivos,
      botsOffline,
      receitaTotalAgg,
      receitaMensalAgg,
      receitaDiariaAgg,
      produtosVendidosAgg,
    ] = await Promise.all([
      // Total de clientes cadastrados
      Cliente.countDocuments(),

      // Total de pedidos (todos os status)
      Pagamento.countDocuments(),

      // Total de produtos cadastrados
      Produto.countDocuments(),

      // Bots ativos (online)
      Application.countDocuments({ status: 'online' }),

      // Bots offline
      Application.countDocuments({ status: 'offline' }),

      // Receita total (apenas pagamentos aprovados)
      Pagamento.aggregate([
        { $match: { status: 'approved' } },
        { $group: { _id: null, total: { $sum: '$valor' } } },
      ]),

      // Receita do mês atual
      Pagamento.aggregate([
        { $match: { status: 'approved', createdAt: { $gte: inicioMes } } },
        { $group: { _id: null, total: { $sum: '$valor' } } },
      ]),

      // Receita do dia atual
      Pagamento.aggregate([
        { $match: { status: 'approved', createdAt: { $gte: inicioDia } } },
        { $group: { _id: null, total: { $sum: '$valor' } } },
      ]),

      // Produtos vendidos (contagem de pagamentos aprovados por produto)
      Pagamento.aggregate([
        { $match: { status: 'approved' } },
        { $group: { _id: '$produto', quantidade: { $sum: 1 } } },
        { $lookup: { from: 'produtos', localField: '_id', foreignField: '_id', as: 'produto' } },
        { $unwind: { path: '$produto', preserveNullAndEmptyArrays: true } },
        { $project: { _id: 0, produtoId: '$_id', nome: '$produto.nome', quantidade: 1 } },
        { $sort: { quantidade: -1 } },
        { $limit: 10 },
      ]),
    ]);

    res.json({
      totalClientes,
      totalPedidos,
      totalProdutosCadastrados,
      botsAtivos,
      botsOffline,
      receitaTotal: receitaTotalAgg[0]?.total || 0,
      receitaMensal: receitaMensalAgg[0]?.total || 0,
      receitaDiaria: receitaDiariaAgg[0]?.total || 0,
      produtosVendidos: produtosVendidosAgg,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getStats };
