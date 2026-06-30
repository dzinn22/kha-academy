const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Bot Store API',
      version: '2.0.0',
      description: 'API backend completa para plataforma SaaS de hospedagem de bots do Discord. Inclui sistema administrativo, CRUD de produtos com sources, gerenciamento de clientes, pedidos, cupons, estatísticas, configurações e logs de auditoria.',
      contact: {
        name: 'Suporte',
      },
    },
    servers: [
      {
        url: '/v1',
        description: 'API v1',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Token JWT obtido via autenticação Discord OAuth2',
        },
      },
      schemas: {
        Produto: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            nome: { type: 'string' },
            descricao: { type: 'string' },
            categoria: { type: 'string', enum: ['Security', 'Tickets', 'Moderação', 'Economia', 'Outros'] },
            preco: { type: 'number' },
            desconto: { type: 'number' },
            banner: { type: 'string' },
            imagem: { type: 'string' },
            status: { type: 'string', enum: ['ativo', 'inativo', 'em_breve'] },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Pagamento: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            mercadoPagoId: { type: 'string' },
            produto: { type: 'string' },
            discordId: { type: 'string' },
            valor: { type: 'number' },
            status: { type: 'string', enum: ['pending', 'approved', 'rejected', 'cancelled', 'refunded'] },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Cupom: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            codigo: { type: 'string' },
            desconto: { type: 'number' },
            tipo: { type: 'string', enum: ['percentual', 'fixo'] },
            expiracao: { type: 'string', format: 'date-time' },
            limiteUsos: { type: 'number', nullable: true },
            totalUsos: { type: 'number' },
            ativo: { type: 'boolean' },
          },
        },
        Log: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            nivel: { type: 'string', enum: ['info', 'warn', 'error', 'audit'] },
            origem: { type: 'string' },
            mensagem: { type: 'string' },
            discordId: { type: 'string' },
            metadata: { type: 'object' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Pagination: {
          type: 'object',
          properties: {
            total: { type: 'integer' },
            page: { type: 'integer' },
            limit: { type: 'integer' },
            pages: { type: 'integer' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            details: { type: 'array', items: { type: 'object' } },
          },
        },
      },
    },
    tags: [
      { name: 'Público', description: 'Endpoints públicos sem autenticação' },
      { name: 'Usuário', description: 'Endpoints para usuários autenticados' },
      { name: 'Admin', description: 'Endpoints administrativos (requer ADMIN_IDS)' },
      { name: 'Produtos', description: 'Gerenciamento de produtos' },
      { name: 'Usuários', description: 'Gerenciamento de clientes' },
      { name: 'Pedidos', description: 'Gerenciamento de pedidos' },
      { name: 'Cupons', description: 'Gerenciamento de cupons de desconto' },
      { name: 'Estatísticas', description: 'Estatísticas da plataforma' },
      { name: 'Configurações', description: 'Configurações globais da plataforma' },
      { name: 'Logs', description: 'Logs de auditoria' },
    ],
  },
  apis: ['./routes/*.js'],
};

const specs = swaggerJsdoc(options);

module.exports = specs;
