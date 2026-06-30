const { Cupom, Log } = require('../models');

/**
 * GET /admin/coupons
 * Lista todos os cupons.
 */
const listar = async (req, res, next) => {
  try {
    const { ativo, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const filtro = {};
    if (ativo !== undefined) filtro.ativo = ativo === 'true';

    const [cupons, total] = await Promise.all([
      Cupom.find(filtro).skip(skip).limit(parseInt(limit)).sort({ createdAt: -1 }),
      Cupom.countDocuments(filtro),
    ]);

    res.json({
      data: cupons,
      pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /admin/coupons/:id
 * Retorna um cupom pelo ID.
 */
const buscarPorId = async (req, res, next) => {
  try {
    const cupom = await Cupom.findById(req.params.id);
    if (!cupom) return res.status(404).json({ error: 'Cupom não encontrado' });
    res.json(cupom);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /admin/coupons
 * Cria um novo cupom.
 */
const criar = async (req, res, next) => {
  try {
    const { codigo, desconto, tipo, expiracao, limiteUsos } = req.body;

    const cupom = await Cupom.create({
      codigo: codigo.toUpperCase(),
      desconto,
      tipo: tipo || 'percentual',
      expiracao: expiracao ? new Date(expiracao) : undefined,
      limiteUsos: limiteUsos || null,
    });

    await Log.registrar({
      nivel: 'audit',
      origem: 'admin:cupons',
      mensagem: `Cupom criado: ${cupom.codigo}`,
      discordId: req.user.id,
      metadata: { cupomId: cupom._id, codigo: cupom.codigo },
    });

    res.status(201).json(cupom);
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /admin/coupons/:id
 * Atualiza um cupom existente.
 */
const atualizar = async (req, res, next) => {
  try {
    const { codigo, desconto, tipo, expiracao, limiteUsos, ativo } = req.body;
    const update = {};

    if (codigo !== undefined) update.codigo = codigo.toUpperCase();
    if (desconto !== undefined) update.desconto = desconto;
    if (tipo !== undefined) update.tipo = tipo;
    if (expiracao !== undefined) update.expiracao = expiracao ? new Date(expiracao) : null;
    if (limiteUsos !== undefined) update.limiteUsos = limiteUsos;
    if (ativo !== undefined) update.ativo = ativo;

    const cupom = await Cupom.findByIdAndUpdate(
      req.params.id,
      { $set: update },
      { new: true, runValidators: true }
    );

    if (!cupom) return res.status(404).json({ error: 'Cupom não encontrado' });

    await Log.registrar({
      nivel: 'audit',
      origem: 'admin:cupons',
      mensagem: `Cupom atualizado: ${cupom.codigo}`,
      discordId: req.user.id,
      metadata: { cupomId: cupom._id },
    });

    res.json(cupom);
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /admin/coupons/:id
 * Remove um cupom.
 */
const remover = async (req, res, next) => {
  try {
    const cupom = await Cupom.findByIdAndDelete(req.params.id);
    if (!cupom) return res.status(404).json({ error: 'Cupom não encontrado' });

    await Log.registrar({
      nivel: 'audit',
      origem: 'admin:cupons',
      mensagem: `Cupom removido: ${cupom.codigo}`,
      discordId: req.user.id,
      metadata: { cupomId: cupom._id, codigo: cupom.codigo },
    });

    res.json({ message: 'Cupom removido com sucesso' });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /v1/coupons/validate
 * Valida um cupom (rota pública para o checkout).
 */
const validar = async (req, res, next) => {
  try {
    const { codigo } = req.body;
    if (!codigo) return res.status(400).json({ error: 'Código do cupom é obrigatório' });

    const cupom = await Cupom.findOne({ codigo: codigo.toUpperCase() });
    if (!cupom) return res.status(404).json({ error: 'Cupom não encontrado' });

    if (!cupom.isValido()) {
      return res.status(400).json({ error: 'Cupom inválido, expirado ou esgotado' });
    }

    res.json({
      valido: true,
      codigo: cupom.codigo,
      desconto: cupom.desconto,
      tipo: cupom.tipo,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { listar, buscarPorId, criar, atualizar, remover, validar };
