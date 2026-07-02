const jwt = require('jsonwebtoken');
const config = require('../config');

class AuthController {
  /**
   * Retorna os dados do usuário logado (GET /auth/me)
   */
  async me(req, res) {
    if (!req.user) {
      return res.status(401).json({ error: 'Não autenticado' });
    }
    res.json(req.user);
  }

  /**
   * Callback do Discord (GET /auth/callback)
   * Gera o token JWT e redireciona para o frontend
   */
  async callback(req, res) {
    try {
      if (!req.user) {
        return res.redirect(`${config.allowedOrigins[0]}/login?error=auth_failed`);
      }

      // Gera o token JWT para compatibilidade com o middleware existente
      const token = jwt.sign(
        {
          id: req.user.discordId,
          username: req.user.username,
          isAdmin: req.user.isAdmin,
        },
        config.jwtSecret,
        { expiresIn: '7d' }
      );

      // Redireciona para o frontend passando o token
      // O frontend deve salvar este token no localStorage/cookie
      res.redirect(`${config.allowedOrigins[0]}/auth/success?token=${token}`);
    } catch (err) {
      console.error('[AuthCallback] Erro:', err);
      res.redirect(`${config.allowedOrigins[0]}/login?error=server_error`);
    }
  }

  /**
   * Logout (POST /auth/logout)
   */
  async logout(req, res) {
    req.logout((err) => {
      if (err) return res.status(500).json({ error: 'Erro ao fazer logout' });
      res.json({ message: 'Logout realizado com sucesso' });
    });
  }

  /**
   * Refresh Token (POST /auth/refresh)
   * Neste caso, como usamos JWT de 7 dias, apenas renovamos se o token atual for válido
   */
  async refresh(req, res) {
    try {
      const token = jwt.sign(
        {
          id: req.user.discordId,
          username: req.user.username,
          isAdmin: req.user.isAdmin,
        },
        config.jwtSecret,
        { expiresIn: '7d' }
      );
      res.json({ token });
    } catch (err) {
      res.status(500).json({ error: 'Erro ao renovar token' });
    }
  }
}

module.exports = new AuthController();
