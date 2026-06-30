const { Application, Deploy, Log, Produto } = require('../models');
const discloud = require('./discloud');
const sourcesService = require('./sources');

/**
 * Serviço de Deploy de Bots
 *
 * Orquestra o processo completo de provisionamento de um bot para um cliente,
 * utilizando a source do produto correspondente.
 */
class DeployService {
  /**
   * Executa o deploy completo de um bot.
   *
   * @param {Object} pagamento - Documento do pagamento aprovado
   * @param {Object} botConfig - Configurações do bot { token, nome, discordApplicationId }
   * @returns {Object} - Documento da Application criada
   */
  async execute(pagamento, botConfig) {
    const { token, nome, discordApplicationId } = botConfig;

    let application = null;
    let deploy = null;

    try {
      // Etapa 1: Validar configurações do bot
      if (!nome) throw new Error('Nome do bot é obrigatório');

      // Etapa 2: Buscar produto e sua source
      const produto = await Produto.findById(pagamento.produto).select('+sourceRef');
      if (!produto) throw new Error('Produto não encontrado');
      if (!produto.sourceRef) throw new Error('Source do produto não configurada');

      // Etapa 3: Localizar pasta da source no disco
      const caminhoSource = sourcesService.getCaminhoSource(produto.sourceRef);
      if (!caminhoSource) {
        throw new Error(`Source não encontrada no disco: ${produto.sourceRef}`);
      }

      // Etapa 4: Criar registro da Application no banco
      application = await Application.create({
        ownerDiscordId: pagamento.discordId,
        produto: pagamento.produto,
        pagamento: pagamento._id,
        nomeBot: nome,
        discordApplicationId: discordApplicationId || `pending-${Date.now()}`,
        status: 'provisionando',
      });

      // Etapa 5: Criar registro de Deploy
      deploy = await Deploy.create({
        application: application._id,
        status: 'em_andamento',
        etapaAtual: 4,
      });

      await Log.registrar({
        nivel: 'info',
        origem: 'deploy',
        mensagem: `Deploy iniciado para o bot "${nome}" (produto: ${produto.nome})`,
        discordId: pagamento.discordId,
        metadata: {
          applicationId: application._id,
          produtoId: produto._id,
          sourceRef: produto.sourceRef,
          caminhoSource,
        },
      });

      // Etapa 6: Upload para Discloud (usando a source do produto)
      // TODO: Implementar upload real para Discloud com o código da source
      // const uploadResult = await discloud.upload(caminhoSource, nome);
      // application.discloudAppId = uploadResult.appId;

      // Etapa 7: Finalizar deploy
      application.status = 'online';
      await application.save();

      deploy.status = 'concluido';
      deploy.etapaAtual = 8;
      await deploy.save();

      await Log.registrar({
        nivel: 'info',
        origem: 'deploy',
        mensagem: `Deploy concluído para o bot "${nome}"`,
        discordId: pagamento.discordId,
        metadata: { applicationId: application._id },
      });

      return application;
    } catch (err) {
      // Registrar falha no deploy
      if (deploy) {
        deploy.status = 'falhou';
        deploy.erro = err.message;
        await deploy.save().catch(() => {});
      }

      if (application) {
        application.status = 'erro';
        await application.save().catch(() => {});
      }

      await Log.registrar({
        nivel: 'error',
        origem: 'deploy',
        mensagem: `Falha no deploy: ${err.message}`,
        discordId: pagamento.discordId,
        metadata: { pagamentoId: pagamento._id, erro: err.message },
      }).catch(() => {});

      throw err;
    }
  }
}

module.exports = new DeployService();
