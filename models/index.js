/**
 * Ponto único de importação dos models.
 * Em vez de `require('./models/User')` em cada arquivo, use:
 *   const { User, Produto, Cliente, Pagamento, Application, Deploy, Log } = require('./models');
 */
module.exports = {
  User: require('./User'),
  Produto: require('./Produto'),
  Cliente: require('./Cliente'),
  Pagamento: require('./Pagamento'),
  Application: require('./Application'),
  Deploy: require('./Deploy'),
  Log: require('./Log'),
  Cupom: require('./Cupom'),
  Configuracao: require('./Configuracao'),
};
