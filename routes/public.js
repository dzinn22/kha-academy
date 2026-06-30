/**
 * Rotas Públicas — /v1/*
 *
 * Rotas acessíveis sem autenticação ou com autenticação de usuário comum.
 * Mantém 100% de compatibilidade com as rotas existentes.
 */
const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/auth');
const { Produto, Pagamento, Application, Log } = require('../models');
const deployService = require('../services/deploy');
const cupomController = require('../controllers/cupomController');

// ─── Produtos Públicos ────────────────────────────────────────────────────────
/**
 * @swagger
 * /products:
 *   get:
 *     summary: Lista produtos ativos (público)
 *     tags: [Público]
 *     responses:
 *       200:
 *         description: Lista de produtos ativos
 */
router.get('/products', async (req, res, next) => {
  try {
    const { categoria } = req.query;
    const filtro = { status: 'ativo' };
    if (categoria) filtro.categoria = categoria;
    const products = await Produto.find(filtro).sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Retorna detalhes de um produto ativo
 *     tags: [Público]
 */
router.get('/products/:id', async (req, res, next) => {
  try {
    const product = await Produto.findOne({ _id: req.params.id, status: 'ativo' });
    if (!product) return res.status(404).json({ error: 'Produto não encontrado' });
    res.json(product);
  } catch (err) {
    next(err);
  }
});

// ─── Cupons (validação pública para checkout) ─────────────────────────────────
/**
 * @swagger
 * /coupons/validate:
 *   post:
 *     summary: Valida um cupom de desconto
 *     tags: [Público]
 */
router.post('/coupons/validate', cupomController.validar);

// ─── Deploy (protegido por token de usuário) ──────────────────────────────────
/**
 * @swagger
 * /deploy/start:
 *   post:
 *     summary: Inicia o deploy de um bot após pagamento aprovado
 *     tags: [Usuário]
 *     security:
 *       - bearerAuth: []
 */
router.post('/deploy/start', verifyToken, async (req, res, next) => {
  try {
    const { pagamentoId, token, nome } = req.body;
    const pagamento = await Pagamento.findOne({
      _id: pagamentoId,
      discordId: req.user.id,
      status: 'approved',
    });

    if (!pagamento) return res.status(400).json({ error: 'Pagamento não validado' });

    const result = await deployService.execute(pagamento, { token, nome });

    await Log.registrar({
      nivel: 'audit',
      origem: 'deploy',
      mensagem: `Bot iniciado pelo usuário ${req.user.id}`,
      discordId: req.user.id,
      metadata: { pagamentoId, nomeBot: nome },
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /my-bots:
 *   get:
 *     summary: Lista os bots do usuário autenticado
 *     tags: [Usuário]
 *     security:
 *       - bearerAuth: []
 */
router.get('/my-bots', verifyToken, async (req, res, next) => {
  try {
    const bots = await Application.find({ ownerDiscordId: req.user.id })
      .populate('produto', 'nome imagem categoria')
      .sort({ createdAt: -1 });
    res.json(bots);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
