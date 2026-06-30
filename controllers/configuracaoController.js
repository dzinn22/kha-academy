const { Configuracao, Log } = require('../models');

/**
 * Obtém ou cria o documento singleton de configurações.
 */
const getOrCreate = async () => {
  let config = await Configuracao.findOne({ chave: 'global' });
  if (!config) {
    config = await Configuracao.create({ chave: 'global' });
  }
  return config;
};

/**
 * GET /admin/settings
 * Retorna as configurações atuais da plataforma.
 * Campos sensíveis (tokens/secrets) são mascarados.
 */
const getSettings = async (req, res, next) => {
  try {
    const config = await getOrCreate();
    const obj = config.toObject();

    // Mascarar campos sensíveis
    if (obj.mercadoPago?.accessToken) {
      obj.mercadoPago.accessToken = obj.mercadoPago.accessToken.replace(/(.{8}).*(.{4})/, '$1****$2');
    }
    if (obj.discord?.clientSecret) {
      obj.discord.clientSecret = '****';
    }
    if (obj.discloud?.apiToken) {
      obj.discloud.apiToken = obj.discloud.apiToken.replace(/(.{8}).*(.{4})/, '$1****$2');
    }

    res.json(obj);
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /admin/settings
 * Atualiza as configurações da plataforma.
 */
const updateSettings = async (req, res, next) => {
  try {
    const {
      nomeSite,
      manutencao,
      mensagemManutencao,
      mercadoPago,
      discord,
      discloud,
    } = req.body;

    const config = await getOrCreate();

    if (nomeSite !== undefined) config.nomeSite = nomeSite;
    if (manutencao !== undefined) config.manutencao = manutencao;
    if (mensagemManutencao !== undefined) config.mensagemManutencao = mensagemManutencao;

    // Atualizar logo/banner se enviados via upload
    if (req.files?.logo?.[0]) {
      config.logo = `/uploads/images/${req.files.logo[0].filename}`;
    }
    if (req.files?.banner?.[0]) {
      config.banner = `/uploads/images/${req.files.banner[0].filename}`;
    }

    // Mercado Pago (não sobrescrever token se não enviado)
    if (mercadoPago) {
      if (mercadoPago.accessToken && !mercadoPago.accessToken.includes('****')) {
        config.mercadoPago.accessToken = mercadoPago.accessToken;
      }
      if (mercadoPago.ativo !== undefined) config.mercadoPago.ativo = mercadoPago.ativo;
    }

    // Discord OAuth2
    if (discord) {
      if (discord.clientId) config.discord.clientId = discord.clientId;
      if (discord.clientSecret && discord.clientSecret !== '****') {
        config.discord.clientSecret = discord.clientSecret;
      }
      if (discord.redirectUri) config.discord.redirectUri = discord.redirectUri;
    }

    // Discloud
    if (discloud) {
      if (discloud.apiToken && !discloud.apiToken.includes('****')) {
        config.discloud.apiToken = discloud.apiToken;
      }
      if (discloud.ativo !== undefined) config.discloud.ativo = discloud.ativo;
    }

    await config.save();

    await Log.registrar({
      nivel: 'audit',
      origem: 'admin:configuracoes',
      mensagem: 'Configurações da plataforma atualizadas',
      discordId: req.user.id,
      metadata: { campos: Object.keys(req.body) },
    });

    res.json({ message: 'Configurações atualizadas com sucesso' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getSettings, updateSettings };
