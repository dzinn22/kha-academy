const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
const swaggerUi = require('swagger-ui-express');

const config = require('./config');
const connectDB = require('./config/database');
const swaggerSpecs = require('./config/swagger');
const errorHandler = require('./middlewares/errorHandler');

// Rotas
const publicRoutes = require('./routes/public');
const adminRoutes = require('./routes/admin');
const authRoutes = require('./routes/auth');
const session = require('express-session');
const passport = require('passport');
const app = express();

// ─── Segurança ────────────────────────────────────────────────────────────────

// Helmet: define headers HTTP de segurança
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }, // Permite servir imagens de uploads
}));

// CORS configurável via variável de ambiente
app.use(cors({
  origin: (origin, callback) => {
    // Permitir requisições sem origin (ex: Postman, apps mobile)
    if (!origin) return callback(null, true);
    if (config.allowedOrigins.includes(origin) || config.allowedOrigins.includes('*')) {
      return callback(null, true);
    }
    return callback(new Error(`Origem não permitida pelo CORS: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Rate Limiting global: 100 req/15min por IP
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Muitas requisições. Tente novamente em alguns minutos.' },
});
app.use(globalLimiter);

// Rate Limiting mais restrito para rotas administrativas
const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { error: 'Limite de requisições administrativas atingido.' },
});

// ─── Parsers ──────────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── Logging ──────────────────────────────────────────────────────────────────
app.use(morgan('dev'));

// ─── Sessão e Passport ────────────────────────────────────────────────────────
app.use(
  session({
    secret: config.jwtSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

// ─── Arquivos Estáticos (uploads) ─────────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ─── Documentação Swagger ─────────────────────────────────────────────────────
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Bot Store API - Documentação',
}));

// Expor o JSON do Swagger para ferramentas externas
app.get('/docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpecs);
});

// ─── Rotas ────────────────────────────────────────────────────────────────────

// Health check (sem rate limit)
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'vendas-api',
    version: '2.0.0',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Rotas da API v1
app.use('/v1/auth', authRoutes);
app.use('/v1', publicRoutes);
app.use('/v1/admin', adminLimiter, adminRoutes);

// ─── 404 ──────────────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Rota não encontrada: ${req.method} ${req.path}` });
});

// ─── Tratamento Global de Erros ───────────────────────────────────────────────
app.use(errorHandler);

// ─── Inicialização ────────────────────────────────────────────────────────────
const start = async () => {
  await connectDB();
  
  // Inicializa a engine de autenticação após a conexão com o banco
  const authEngine = require('./services/authEngine');
  await authEngine.init();

  app.listen(config.port, () => {
    console.log(`[API] Servidor rodando na porta ${config.port}`);
    console.log(`[API] Documentação disponível em http://localhost:${config.port}/docs`);
    console.log(`[API] Administradores configurados: ${config.adminIds.join(', ') || 'nenhum'}`);
  });
};

start();
