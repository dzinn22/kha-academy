const { Pagamento, Log } = require('../models');

/**
 * GET /admin/orders
 * Lista todos os pedidos com filtros por status.
 */
const listar = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20, discordId, startDate, endDate } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const filtro = {};
    if (status) filtro.status = status;
    if (discordId) filtro.discordId = discordId;
    if (startDate || endDate) {
      filtro.createdAt = {};
      if (startDate) filtro.createdAt.$gte = new Date(startDate);
      if (endDate) filtro.createdAt.$lte = new Date(endDate);
    }

    const [pedidos, total] = await Promise.all([
      Pagamento.find(filtro)
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ createdAt: -1 })
        .populate('produto', 'nome preco categoria'),
      Pagamento.countDocuments(filtro),
    ]);

    res.json({
      data: pedidos,
      pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /admin/orders/:id
 * Retorna detalhes de um pedido específico.
 */
const buscarPorId = async (req, res, next) => {
  try {
    const pedido = await Pagamento.findById(req.params.id).populate('produto');
    if (!pedido) return res.status(404).json({ error: 'Pedido não encontrado' });
    res.json(pedido);
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /admin/orders/:id
 * Atualiza o status de um pedido manualmente.
 */
const atualizar = async (req, res, next) => {
  try {
    const { status } = req.body;
    const statusValidos = ['pending', 'approved', 'rejected', 'cancelled', 'refunded'];

    if (!statusValidos.includes(status)) {
      return res.status(400).json({ error: `Status inválido. Use: ${statusValidos.join(', ')}` });
    }

    const pedido = await Pagamento.findByIdAndUpdate(
      req.params.id,
      { $set: { status, ...(status === 'approved' ? { confirmadoEm: new Date() } : {}) } },
      { new: true }
    ).populate('produto', 'nome');

    if (!pedido) return res.status(404).json({ error: 'Pedido não encontrado' });

    await Log.registrar({
      nivel: 'audit',
      origem: 'admin:pedidos',
      mensagem: `Status do pedido atualizado para "${status}"`,
      discordId: req.user.id,
      metadata: { pedidoId: req.params.id, novoStatus: status },
    });

    res.json(pedido);
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /admin/orders/:id
 * Remove um pedido do sistema.
 */
const remover = async (req, res, next) => {
  try {
    const pedido = await Pagamento.findByIdAndDelete(req.params.id);
    if (!pedido) return res.status(404).json({ error: 'Pedido não encontrado' });

    await Log.registrar({
      nivel: 'audit',
      origem: 'admin:pedidos',
      mensagem: `Pedido removido: ${req.params.id}`,
      discordId: req.user.id,
      metadata: { pedidoId: req.params.id, mercadoPagoId: pedido.mercadoPagoId },
    });

    res.json({ message: 'Pedido removido com sucesso' });
  } catch (err) {
    next(err);
  }
};

module.exports = { listar, buscarPorId, atualizar, remover };
