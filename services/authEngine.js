const passport = require('passport');
const DiscordStrategy = require('passport-discord').Strategy;
const config = require('../config');
const { User, Cliente } = require('../models');

class AuthEngine {
  async init() {
    // 0. Tenta carregar configurações do banco de dados (singleton)
    let discordConfig = { ...config.discord };
    try {
      const { Configuracao } = require('../models');
      const dbConfig = await Configuracao.findOne({ chave: 'global' });
      if (dbConfig && dbConfig.discord && dbConfig.discord.clientId) {
        discordConfig.clientId = dbConfig.discord.clientId;
        discordConfig.clientSecret = dbConfig.discord.clientSecret;
        discordConfig.redirectUri = dbConfig.discord.redirectUri;
        console.log('[AuthEngine] Usando configurações do Discord vindas do banco de dados');
      } else {
        console.log('[AuthEngine] Usando configurações do Discord vindas das variáveis de ambiente');
      }
    } catch (err) {
      console.error('[AuthEngine] Erro ao carregar config do banco, usando env:', err.message);
    }

    // Limpa estratégias anteriores se houver (para permitir re-init)
    passport.unuse('discord');

    passport.serializeUser((user, done) => {
      done(null, user.discordId);
    });

    passport.deserializeUser(async (discordId, done) => {
      try {
        const user = await User.findOne({ discordId });
        done(null, user);
      } catch (err) {
        done(err, null);
      }
    });

    passport.use(
      new DiscordStrategy(
        {
          clientID: discordConfig.clientId,
          clientSecret: discordConfig.clientSecret,
          callbackURL: discordConfig.redirectUri,
          scope: ['identify', 'email'],
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            // 1. Upsert no User (Identidade de Login)
            let user = await User.findOne({ discordId: profile.id });

            const userData = {
              discordId: profile.id,
              username: profile.username,
              discriminator: profile.discriminator,
              email: profile.email,
              avatar: profile.avatar,
              lastLoginAt: new Date(),
            };

            if (!user) {
              // Se for o primeiro login, verifica se deve ser admin
              if (config.adminIds.includes(profile.id)) {
                userData.isAdmin = true;
              }
              user = await User.create(userData);
            } else {
              // Atualiza dados existentes
              Object.assign(user, userData);
              await user.save();
            }

            // 2. Sincroniza com Cliente (Dados Comerciais)
            let cliente = await Cliente.findOne({ discordId: profile.id });
            if (!cliente) {
              await Cliente.create({
                discordId: profile.id,
                nome: profile.username,
                email: profile.email,
              });
            } else {
              cliente.nome = profile.username;
              cliente.email = profile.email;
              await cliente.save();
            }

            return done(null, user);
          } catch (err) {
            return done(err, null);
          }
        }
      )
    );
  }
}

module.exports = new AuthEngine();
