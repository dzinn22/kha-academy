const passport = require('passport');
const DiscordStrategy = require('passport-discord').Strategy;
const config = require('../config');
const { User, Cliente } = require('../models');

class AuthEngine {
  constructor() {
    this.init();
  }

  init() {
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
          clientID: config.discord.clientId,
          clientSecret: config.discord.clientSecret,
          callbackURL: config.discord.redirectUri,
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
