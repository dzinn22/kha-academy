/**
 * Rotas Administrativas — /v1/admin/*
 *
 * Todas as rotas aqui exigem autenticação JWT + Discord ID na lista ADMIN_IDS.
 */
const express = require('express');
const router = express.Router();
const { adminAuth } = require('../middlewares/auth');
const { uploadImage, uploadZip } = require('../middlewares/upload');

// Controllers
const adminController = require('../controllers/adminController');
const produtoController = require('../controllers/produtoController');
const usuarioController = require('../controllers/usuarioController');
const pedidoController = require('../controllers/pedidoController');
const cupomController = require('../controllers/cupomController');
const statsController = require('../controllers/statsController');
const configuracaoController = require('../controllers/configuracaoController');
const logController = require('../controllers/logController');

// Aplicar autenticação admin em todas as rotas deste router
router.use(adminAuth);

// ─── Admin Info ───────────────────────────────────────────────────────────────
/**
 * @swagger
 * /admin/me:
 *   get:
 *     summary: Retorna informações do administrador autenticado
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dados do administrador
 */
router.get('/me', adminController.getMe);

/**
 * @swagger
 * /admin/dashboard:
 *   get:
 *     summary: Retorna resumo do painel administrativo
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dados do dashboard
 */
router.get('/dashboard', adminController.getDashboard);

// ─── Produtos ─────────────────────────────────────────────────────────────────
/**
 * @swagger
 * /admin/products:
 *   get:
 *     summary: Lista todos os produtos
 *     tags: [Produtos]
 *     security:
 *       - bearerAuth: []
 */
router.get('/products', produtoController.listar);

/**
 * @swagger
 * /admin/products/{id}:
 *   get:
 *     summary: Busca produto por ID
 *     tags: [Produtos]
 *     security:
 *       - bearerAuth: []
 */
router.get('/products/:id', produtoController.buscarPorId);

/**
 * @swagger
 * /admin/products:
 *   post:
 *     summary: Cria novo produto com upload de source (ZIP)
 *     tags: [Produtos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [nome, preco, source]
 *             properties:
 *               nome:
 *                 type: string
 *               descricao:
 *                 type: string
 *               categoria:
 *                 type: string
 *               preco:
 *                 type: number
 *               desconto:
 *                 type: number
 *               status:
 *                 type: string
 *               source:
 *                 type: string
 *                 format: binary
 *               banner:
 *                 type: string
 *                 format: binary
 *               imagem:
 *                 type: string
 *                 format: binary
 */
router.post(
  '/products',
  uploadZip.fields([
    { name: 'source', maxCount: 1 },
    { name: 'banner', maxCount: 1 },
    { name: 'imagem', maxCount: 1 },
  ]),
  produtoController.criar
);

/**
 * @swagger
 * /admin/products/{id}:
 *   put:
 *     summary: Atualiza produto existente
 *     tags: [Produtos]
 *     security:
 *       - bearerAuth: []
 */
router.put(
  '/products/:id',
  uploadZip.fields([
    { name: 'source', maxCount: 1 },
    { name: 'banner', maxCount: 1 },
    { name: 'imagem', maxCount: 1 },
  ]),
  produtoController.atualizar
);

/**
 * @swagger
 * /admin/products/{id}:
 *   delete:
 *     summary: Remove produto e sua source
 *     tags: [Produtos]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/products/:id', produtoController.remover);

// ─── Usuários / Clientes ──────────────────────────────────────────────────────
/**
 * @swagger
 * /admin/users:
 *   get:
 *     summary: Lista todos os clientes
 *     tags: [Usuários]
 *     security:
 *       - bearerAuth: []
 */
router.get('/users', usuarioController.listar);

/**
 * @swagger
 * /admin/users/{id}:
 *   get:
 *     summary: Retorna detalhes de um cliente
 *     tags: [Usuários]
 *     security:
 *       - bearerAuth: []
 */
router.get('/users/:id', usuarioController.buscarPorId);

/**
 * @swagger
 * /admin/users/{id}:
 *   put:
 *     summary: Atualiza dados de um cliente
 *     tags: [Usuários]
 *     security:
 *       - bearerAuth: []
 */
router.put('/users/:id', usuarioController.atualizar);

/**
 * @swagger
 * /admin/users/{id}:
 *   delete:
 *     summary: Remove um cliente
 *     tags: [Usuários]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/users/:id', usuarioController.remover);

/**
 * @swagger
 * /admin/users/{id}/suspend:
 *   post:
 *     summary: Suspende um cliente
 *     tags: [Usuários]
 *     security:
 *       - bearerAuth: []
 */
router.post('/users/:id/suspend', usuarioController.suspender);

/**
 * @swagger
 * /admin/users/{id}/activate:
 *   post:
 *     summary: Reativa um cliente suspenso
 *     tags: [Usuários]
 *     security:
 *       - bearerAuth: []
 */
router.post('/users/:id/activate', usuarioController.ativar);

// ─── Pedidos ──────────────────────────────────────────────────────────────────
/**
 * @swagger
 * /admin/orders:
 *   get:
 *     summary: Lista todos os pedidos com filtros
 *     tags: [Pedidos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, approved, rejected, cancelled, refunded]
 */
router.get('/orders', pedidoController.listar);
router.get('/orders/:id', pedidoController.buscarPorId);
router.put('/orders/:id', pedidoController.atualizar);
router.delete('/orders/:id', pedidoController.remover);

// ─── Cupons ───────────────────────────────────────────────────────────────────
/**
 * @swagger
 * /admin/coupons:
 *   get:
 *     summary: Lista todos os cupons
 *     tags: [Cupons]
 *     security:
 *       - bearerAuth: []
 */
router.get('/coupons', cupomController.listar);
router.get('/coupons/:id', cupomController.buscarPorId);
router.post('/coupons', cupomController.criar);
router.put('/coupons/:id', cupomController.atualizar);
router.delete('/coupons/:id', cupomController.remover);

// ─── Estatísticas ─────────────────────────────────────────────────────────────
/**
 * @swagger
 * /admin/stats:
 *   get:
 *     summary: Retorna estatísticas completas da plataforma
 *     tags: [Estatísticas]
 *     security:
 *       - bearerAuth: []
 */
router.get('/stats', statsController.getStats);

// ─── Configurações ────────────────────────────────────────────────────────────
/**
 * @swagger
 * /admin/settings:
 *   get:
 *     summary: Retorna configurações da plataforma
 *     tags: [Configurações]
 *     security:
 *       - bearerAuth: []
 */
router.get('/settings', configuracaoController.getSettings);

/**
 * @swagger
 * /admin/settings:
 *   put:
 *     summary: Atualiza configurações da plataforma
 *     tags: [Configurações]
 *     security:
 *       - bearerAuth: []
 */
router.put(
  '/settings',
  uploadImage.fields([
    { name: 'logo', maxCount: 1 },
    { name: 'banner', maxCount: 1 },
  ]),
  configuracaoController.updateSettings
);

// ─── Logs ─────────────────────────────────────────────────────────────────────
/**
 * @swagger
 * /admin/logs:
 *   get:
 *     summary: Lista logs de auditoria
 *     tags: [Logs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: discordId
 *         schema:
 *           type: string
 *       - in: query
 *         name: nivel
 *         schema:
 *           type: string
 *           enum: [info, warn, error, audit]
 *       - in: query
 *         name: origem
 *         schema:
 *           type: string
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 */
router.get('/logs', logController.listar);

module.exports = router;
