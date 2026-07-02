const express = require('express');
const passport = require('passport');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken } = require('../middlewares/auth');

/**
 * @swagger
 * tags:
 *   name: Autenticação
 *   description: Endpoints de autenticação via Discord OAuth2
 */

/**
 * @swagger
 * /auth/discord:
 *   get:
 *     summary: Inicia o fluxo de autenticação do Discord
 *     tags: [Autenticação]
 */
router.get('/discord', passport.authenticate('discord'));

/**
 * @swagger
 * /auth/callback:
 *   get:
 *     summary: Callback do Discord OAuth2
 *     tags: [Autenticação]
 */
router.get(
  '/callback',
  passport.authenticate('discord', { failureRedirect: '/login?error=failed' }),
  authController.callback
);

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Retorna os dados do usuário autenticado
 *     tags: [Autenticação]
 *     security:
 *       - bearerAuth: []
 */
router.get('/me', verifyToken, authController.me);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Realiza o logout do usuário
 *     tags: [Autenticação]
 */
router.post('/logout', authController.logout);

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Renova o token de acesso
 *     tags: [Autenticação]
 *     security:
 *       - bearerAuth: []
 */
router.post('/refresh', verifyToken, authController.refresh);

module.exports = router;
