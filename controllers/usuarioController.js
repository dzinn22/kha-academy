const { User, Cliente, Pagamento, Application, Log } = require('../models');

/**
 * GET /admin/users
 * Lista todos os clientes com dados resumidos.
 */
const listar = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20, search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const filtro = {};
    if (search) {
      filtro.$or = [
        { nome: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { discordId: { $regex: search, $options: 'i' } },
      ];
    }

    const [clientes, total] = await Promise.all([
      Cliente.find(filtro)
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ createdAt: -1 })
        .populate('aplicacoes', 'nomeBot status'),
      Cliente.countDocuments(filtro),
    ]);

    // Enriquecer com dados do User (status, isAdmin)
    const discordIds = clientes.map((c) => c.discordId);
    const users = await User.find({ discordId: { $in: discordIds } });
    const userMap = {};
    users.forEach((u) => { userMap[u.discordId] = u; });

    const data = clientes.map((c) => ({
      ...c.toObject(),
      user: userMap[c.discordId] || null,
    }));

    res.json({
      data,
      pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /admin/users/:id
 * Retorna detalhes completos de um cliente: compras, gastos, bots, status.
 */
const buscarPorId = async (req, res, next) => {
  try {
    const cliente = await Cliente.findOne({ discordId: req.params.id })
      .populate('aplicacoes');

    if (!cliente) return res.status(404).json({ error: 'Cliente não encontrado' });

    const [user, pagamentos, bots] = await Promise.all([
      User.findOne({ discordId: req.params.id }),
      Pagamento.find({ discordId: req.params.id }).populate('produto', 'nome preco'),
      Application.find({ ownerDiscordId: req.params.id }).populate('produto', 'nome'),
    ]);

    const gastoTotal = pagamentos
      .filter((p) => p.status === 'approved')
      .reduce((acc, p) => acc + p.valor, 0);

    res.json({
      cliente,
      user,
      compras: pagamentos,
      gastos: gastoTotal,
      bots,
      status: user?.isAdmin ? 'admin' : 'ativo',
      dataCadastro: cliente.createdAt,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /admin/users/:id
 * Atualiza dados de um cliente.
 */
const atualizar = async (req, res, next) => {
  try {
    const { nome, email } = req.body;
    const cliente = await Cliente.findOneAndUpdate(
      { discordId: req.params.id },
      { $set: { nome, email } },
      { new: true, runValidators: true }
    );

    if (!cliente) return res.status(404).json({ error: 'Cliente não encontrado' });

    await Log.registrar({
      nivel: 'audit',
      origem: 'admin:usuarios',
      mensagem: `Cliente atualizado: ${req.params.id}`,
      discordId: req.user.id,
      metadata: { clienteId: req.params.id, alteracoes: { nome, email } },
    });

    res.json(cliente);
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /admin/users/:id
 * Remove um cliente e seus dados associados.
 */
const remover = async (req, res, next) => {
  try {
    const cliente = await Cliente.findOne({ discordId: req.params.id });
    if (!cliente) return res.status(404).json({ error: 'Cliente não encontrado' });

    await Promise.all([
      Cliente.deleteOne({ discordId: req.params.id }),
      User.deleteOne({ discordId: req.params.id }),
    ]);

    await Log.registrar({
      nivel: 'audit',
      origem: 'admin:usuarios',
      mensagem: `Cliente removido: ${req.params.id}`,
      discordId: req.user.id,
      metadata: { clienteId: req.params.id },
    });

    res.json({ message: 'Cliente removido com sucesso' });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /admin/users/:id/suspend
 * Suspende um cliente (marca bots como offline).
 */
const suspender = async (req, res, next) => {
  try {
    const user = await User.findOne({ discordId: req.params.id });
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });

    // Marcar todos os bots como offline
    await Application.updateMany(
      { ownerDiscordId: req.params.id, status: 'online' },
      { $set: { status: 'offline' } }
    );

    // Adicionar flag de suspenso no user
    user.isSuspended = true;
    await user.save();

    await Log.registrar({
      nivel: 'audit',
      origem: 'admin:usuarios',
      mensagem: `Cliente suspenso: ${req.params.id}`,
      discordId: req.user.id,
      metadata: { clienteId: req.params.id },
    });

    res.json({ message: 'Cliente suspenso com sucesso' });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /admin/users/:id/activate
 * Reativa um cliente suspenso.
 */
const ativar = async (req, res, next) => {
  try {
    const user = await User.findOne({ discordId: req.params.id });
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });

    user.isSuspended = false;
    await user.save();

    await Log.registrar({
      nivel: 'audit',
      origem: 'admin:usuarios',
      mensagem: `Cliente reativado: ${req.params.id}`,
      discordId: req.user.id,
      metadata: { clienteId: req.params.id },
    });

    res.json({ message: 'Cliente reativado com sucesso' });
  } catch (err) {
    next(err);
  }
};

module.exports = { listar, buscarPorId, atualizar, remover, suspender, ativar };
