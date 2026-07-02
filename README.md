# Bot Store API — v2.0.0

API backend completa para plataforma SaaS de hospedagem de bots do Discord. Construída com Node.js, Express e MongoDB.

---

## Estrutura do Projeto

```
.
├── config/
│   ├── database.js        # Conexão com MongoDB
│   ├── index.js           # Configurações centrais (env vars)
│   └── swagger.js         # Configuração do Swagger/OpenAPI
├── controllers/
│   ├── adminController.js       # /admin/me e /admin/dashboard
│   ├── produtoController.js     # CRUD de produtos + upload de sources
│   ├── usuarioController.js     # Gerenciamento de clientes
│   ├── pedidoController.js      # Gerenciamento de pedidos
│   ├── cupomController.js       # CRUD de cupons
│   ├── statsController.js       # Estatísticas da plataforma
│   ├── configuracaoController.js# Configurações globais
│   └── logController.js         # Logs de auditoria
├── middlewares/
│   ├── auth.js            # JWT + verificação de admin
│   ├── errorHandler.js    # Tratamento global de erros
│   ├── upload.js          # Multer (imagens e ZIPs)
│   └── validate.js        # Validação com express-validator
├── models/
│   ├── User.js            # Identidade Discord
│   ├── Cliente.js         # Perfil comercial do comprador
│   ├── Produto.js         # Catálogo de bots
│   ├── Pagamento.js       # Pagamentos Mercado Pago
│   ├── Application.js     # Bots hospedados
│   ├── Deploy.js          # Rastreamento de deploys
│   ├── Log.js             # Auditoria e logs
│   ├── Cupom.js           # Cupons de desconto
│   ├── Configuracao.js    # Configurações globais (singleton)
│   └── index.js           # Barrel de exports
├── routes/
│   ├── public.js          # Rotas públicas e de usuário
│   └── admin.js           # Rotas administrativas
├── services/
│   ├── deploy.js          # Orquestração de deploys
│   ├── discloud.js        # Wrapper da API Discloud
│   └── sources.js         # Gerenciamento de pastas de sources
├── uploads/               # Arquivos enviados (criado automaticamente)
│   ├── images/            # Logos, banners, imagens
│   └── temp/              # ZIPs temporários (removidos após extração)
├── sources/               # Código-fonte dos bots (criado automaticamente)
│   └── <slug-do-produto>/ # Uma pasta por produto
├── .env.example           # Modelo de variáveis de ambiente
├── .gitignore
├── package.json
└── server.js              # Ponto de entrada da aplicação
```

---

## Instalação

```bash
# Instalar dependências
npm install

# Copiar e configurar variáveis de ambiente
cp .env.example .env
# Editar o arquivo .env com suas credenciais

# Iniciar em desenvolvimento
npm run dev

# Iniciar em produção
npm start
```

---

## Variáveis de Ambiente

| Variável | Descrição | Obrigatório |
|---|---|---|
| `PORT` | Porta do servidor (padrão: 4000) | Não |
| `MONGODB_URI` | URI de conexão com MongoDB | Sim |
| `JWT_SECRET` | Chave secreta para assinar tokens JWT | Sim |
| `ADMIN_IDS` | Discord IDs dos administradores (separados por vírgula) | Sim |
| `MERCADO_PAGO_ACCESS_TOKEN` | Token de acesso do Mercado Pago | Sim |
| `DISCLOUD_API_TOKEN` | Token da API Discloud | Sim |
| `DISCORD_CLIENT_ID` | Client ID do app Discord | Sim |
| `DISCORD_CLIENT_SECRET` | Client Secret do app Discord | Sim |
| `DISCORD_REDIRECT_URI` | URI de callback OAuth2 | Sim |
| `ALLOWED_ORIGINS` | Origens CORS permitidas (separadas por vírgula) | Não |
| `ENCRYPTION_KEY` | Chave AES-256 para criptografia de tokens | Recomendado |

---

## Endpoints da API

A documentação interativa completa está disponível em `/docs` (Swagger UI) após iniciar o servidor.

### Públicos (sem autenticação)

| Método | Rota | Descrição |
|---|---|---|
| GET | `/v1/products` | Lista produtos ativos |
| GET | `/v1/products/:id` | Detalhes de um produto |
| POST | `/v1/coupons/validate` | Valida um cupom de desconto |
| GET | `/health` | Health check da API |

### Usuário (requer JWT)

| Método | Rota | Descrição |
|---|---|---|
| POST | `/v1/deploy/start` | Inicia deploy de bot após pagamento |
| GET | `/v1/my-bots` | Lista bots do usuário autenticado |

### Administrativos (requer JWT + ADMIN_IDS)

| Método | Rota | Descrição |
|---|---|---|
| GET | `/v1/admin/me` | Dados do admin autenticado |
| GET | `/v1/admin/dashboard` | Resumo do painel |
| GET | `/v1/admin/stats` | Estatísticas completas |
| GET/PUT | `/v1/admin/settings` | Configurações da plataforma |
| GET | `/v1/admin/logs` | Logs de auditoria |
| GET/POST | `/v1/admin/products` | Listar/criar produtos |
| GET/PUT/DELETE | `/v1/admin/products/:id` | Gerenciar produto |
| GET | `/v1/admin/users` | Listar clientes |
| GET/PUT/DELETE | `/v1/admin/users/:id` | Gerenciar cliente |
| POST | `/v1/admin/users/:id/suspend` | Suspender cliente |
| POST | `/v1/admin/users/:id/activate` | Reativar cliente |
| GET | `/v1/admin/orders` | Listar pedidos |
| GET/PUT/DELETE | `/v1/admin/orders/:id` | Gerenciar pedido |
| GET/POST | `/v1/admin/coupons` | Listar/criar cupons |
| GET/PUT/DELETE | `/v1/admin/coupons/:id` | Gerenciar cupom |

---

## Sistema de Sources

Cada produto possui uma pasta dedicada em `sources/` contendo o código-fonte do bot. O fluxo é:

1. Admin cria produto enviando um arquivo `.zip` via `POST /admin/products`
2. A API extrai o ZIP para `sources/<slug-do-produto>-<timestamp>/`
3. O ZIP temporário é removido automaticamente
4. O campo `sourceRef` (privado, nunca exposto ao frontend) aponta para essa pasta
5. Quando um cliente compra e inicia o deploy, o sistema usa `sourceRef` para localizar o código correto

---

## Segurança

A API implementa as seguintes camadas de segurança:

- **Helmet**: Headers HTTP de segurança (CSP, HSTS, etc.)
- **Rate Limiting**: 100 req/15min global, 200 req/15min para rotas admin
- **CORS configurável**: Via variável `ALLOWED_ORIGINS`
- **Autenticação JWT**: Verificação em todas as rotas protegidas
- **Autorização por Discord ID**: Lista `ADMIN_IDS` para acesso administrativo
- **Validação de uploads**: Tipo e tamanho de arquivo verificados
- **Sanitização de sourceRef**: Nunca exposto em respostas da API
- **Tratamento global de erros**: Respostas padronizadas sem vazamento de stack traces em produção
- **Logs de auditoria**: Todas as ações administrativas são registradas

---

## Sincronização Dinâmica de Configurações

A API v2.0 introduz um sistema de sincronização dinâmica para credenciais do Discord OAuth2, Mercado Pago e Discloud.

- **Prioridade**: As configurações salvas no banco de dados (via Painel Admin) têm precedência sobre as variáveis de ambiente (`.env`).
- **Hot-Reload**: Alterações feitas no Painel Admin são aplicadas instantaneamente à engine de autenticação sem necessidade de reiniciar o servidor.
- **Fallback**: Caso não existam configurações no banco, o sistema utiliza automaticamente os valores definidos no `.env`.

---

## Compatibilidade

Esta versão 2.0 mantém 100% de compatibilidade com a versão anterior:

- Login via Discord OAuth2: inalterado
- Dashboard do cliente (`/my-bots`): inalterado
- Deploy de bots (`/deploy/start`): mantido e aprimorado
- Mercado Pago e webhooks: inalterados
- Todos os modelos existentes: preservados e estendidos
- Rotas existentes: todas funcionando normalmente
