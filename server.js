const express = require('express');
const path = require('path');
const session = require('express-session');
const passport = require('passport');
const DiscordStrategy = require('passport-discord').Strategy;
const dotenv = require('dotenv');
const cors = require('cors');
const fs = require('fs');
const axios = require('axios');
const { MercadoPagoConfig, Payment } = require('mercadopago');
const fetch = require('node-fetch');

dotenv.config();
const app = express();
const PORT = 8080;
const WEBHOOK_URL = process.env.WEBHOOK_URL;

// ================== CONFIGURAÇÕES ==================
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(__dirname));
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/database', express.static(path.join(__dirname, 'database')));

app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: process.env.SESSION_SECRET || 'umsegredoseguro',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  }
}));

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

passport.use(new DiscordStrategy({
  clientID: process.env.DISCORD_CLIENT_ID,
  clientSecret: process.env.DISCORD_CLIENT_SECRET,
  callbackURL: process.env.DISCORD_CALLBACK_URL,
  scope: ['identify', 'email']
}, (accessToken, refreshToken, profile, done) => {
  profile.accessToken = accessToken;
  process.nextTick(() => done(null, profile));
}));

// ================== ROTAS PÁGINAS ==================
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.get('/dashboard', (req, res) => !req.isAuthenticated() ? res.redirect('/') : res.sendFile(path.join(__dirname, 'public', 'dashboard.html')));
app.get('/planos', (req, res) => res.sendFile(path.join(__dirname, 'public', 'plans.html')));
app.get('/login', (req, res) => res.sendFile(path.join(__dirname, 'public', 'login.html')));
app.get('/adicionais', (req, res) => res.sendFile(path.join(__dirname, 'public', 'adicionais.html')));
app.get('/order', (req, res) => res.sendFile(path.join(__dirname, 'public', 'order.html')));
app.get('/gerenciar/:appId', (req, res) => !req.isAuthenticated() ? res.redirect('/') : res.sendFile(path.join(__dirname, 'public', 'gerenciar.html')));

// ================== LOGS EM MEMÓRIA ==================
const botLogs = {};
function addLog(appId, message) {
  if (!botLogs[appId]) botLogs[appId] = [];
  botLogs[appId].push(`[${new Date().toISOString()}] ${message}`);
  if (botLogs[appId].length > 100) botLogs[appId].shift();
}

// ================== APIs ==================
app.get('/api/bot/:appId', (req, res) => {
  const dbPath = path.join(__dirname, 'DataBaseJson', 'applications.json');
  try {
    const bots = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    const bot = Object.values(bots).find(bot => bot.idapp === req.params.appId);
    if (!bot) return res.status(404).json({ error: 'Bot não encontrado' });
    return res.json({ ...bot, status: bot.status || 'off' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro ao carregar os bots' });
  }
});

app.get('/api/bot/:appId/logs', (req, res) => {
  if (!botLogs[req.params.appId]) return res.status(404).send('Nenhum log disponível para este bot.');
  res.type('text/plain').send(botLogs[req.params.appId].join('\n'));
});

app.get('/api/bots', (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).json({ error: 'Não autenticado' });
  const userId = req.user.id;
  const dbPath = path.join(__dirname, 'DataBaseJson', 'applications.json');
  let apps = {};
  try {
    apps = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  } catch (e) {
    return res.json({ bots: [] });
  }
  const bots = Object.values(apps).filter(app => app.owner === userId);
  res.json({ bots });
});

app.post('/api/bot/:appId/start', (req, res) => { addLog(req.params.appId, 'Bot iniciado'); res.json({ message: 'Bot iniciado!' }); });
app.post('/api/bot/:appId/stop', (req, res) => { addLog(req.params.appId, 'Bot desligado'); res.json({ message: 'Bot desligado!' }); });
app.post('/api/bot/:appId/restart', (req, res) => { addLog(req.params.appId, 'Bot reiniciado'); res.json({ message: 'Bot reiniciado!' }); });

// ================== LOGIN DISCORD ==================
app.get('/auth/discord', passport.authenticate('discord'));

async function sendLoginWebhook(user, req) {
  if (!WEBHOOK_URL) return;
  const embed = {
    title: 'Novo login no site',
    color: 0x00b0f4,
    fields: [
      { name: 'Usuário', value: `${user.username} || ''} (${user.id})` },
      { name: 'Data/Hora', value: new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }) },
      { name: 'IP', value: req.ip },
      { name: 'Email', value: user.email }
    ],
    thumbnail: { url: `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png` }
  };
  await axios.post(WEBHOOK_URL, { embeds: [embed] }).catch(() => {});
}

const databaseDir = path.join(__dirname, 'database');
const userDBPath = path.join(databaseDir, 'usuarios.json');

async function saveUserToDB(user, req) {
  try {
    await fs.promises.mkdir(databaseDir, { recursive: true });

    let users = [];
    if (fs.existsSync(userDBPath)) {
      const data = await fs.promises.readFile(userDBPath, 'utf-8');
      if (data.trim().length > 0) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) {
          users = parsed;
        } else {
          users = [];
        }
      } else {
        users = [];
      }
    }

    const newUser = {
      id: user.id,
      username: user.username,
      email: user.email || 'Não informado',
      avatar: user.avatar,
      ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
      login_at: new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })
    };

    const existingIndex = users.findIndex(u => u.id === user.id);
    if (existingIndex !== -1) users[existingIndex] = newUser;
    else users.push(newUser);

    await fs.promises.writeFile(userDBPath, JSON.stringify(users, null, 2));
    console.log(`Usuário ${user.id} salvo com sucesso em ${userDBPath}`);
  } catch (err) {
    console.error('Erro ao salvar usuário:', err);
  }
}


app.get('/auth/callback', passport.authenticate('discord', {
  failureRedirect: '/'
}), async (req, res) => {
  if (req.isAuthenticated() && req.user && req.user.accessToken) {
    await sendLoginWebhook(req.user, req);
    await saveUserToDB(req.user, req);
    res.redirect(`/dashboard?token=${req.user.accessToken}`);
  } else {
    res.redirect('/login');
  }
});

// Rota de status de autenticação melhorada
app.get('/auth/status', (req, res) => {
  if (req.isAuthenticated()) {
    const { id, username, discriminator, avatar } = req.user;
    res.json({ 
      isAuthenticated: true, 
      user: { 
        id, 
        username, 
        discriminator,
        avatar,
        fullUsername: `${username}#${discriminator}`
      } 
    });
  } else {
    res.json({ isAuthenticated: false });
  }
});

// Rota de logout melhorada
app.get('/auth/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    req.session.destroy(() => {
      res.clearCookie('connect.sid');
      res.json({ success: true });
    });
  });
});

// Bots filtrados por dono
app.get('/api/cupom/listar', (req, res) => {
  const dbPath = path.join(__dirname, 'database', 'cupons.json');

  try {
    if (!fs.existsSync(dbPath)) return res.json({ cupons: [] });

    const data = fs.readFileSync(dbPath, 'utf8');
    const cupons = data.trim().length > 0 ? JSON.parse(data) : [];
    res.json({ cupons });
  } catch (err) {
    console.error('Erro ao ler cupons:', err);
    res.status(500).json({ error: 'Erro ao carregar os cupons' });
  }
});

app.get('/api/bots', (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).json({ error: 'Não autenticado' });

  const userId = req.user.id;
  const dbPath = path.join(__dirname, 'DataBaseJson', 'applications.json');

  let apps = {};
  try {
    apps = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  } catch (e) {
    return res.json({ bots: [] });
  }

  const bots = Object.values(apps).filter(app => app.owner === userId);
  res.json({ bots });
});

// Endpoints para ligar, desligar e reiniciar bot (exemplo básico)
app.post('/api/bot/:appId/start', (req, res) => {
  const appId = req.params.appId;

  // Sua lógica para iniciar o bot aqui...

  addLog(appId, 'Bot iniciado');
  res.json({ message: 'Bot iniciado!' });
});

app.post('/api/bot/:appId/stop', (req, res) => {
  const appId = req.params.appId;

  // Sua lógica para parar o bot aqui...

  addLog(appId, 'Bot desligado');
  res.json({ message: 'Bot desligado!' });
});

app.post('/api/bot/:appId/restart', (req, res) => {
  const appId = req.params.appId;

  // Sua lógica para reiniciar o bot aqui...

  addLog(appId, 'Bot reiniciado');
  res.json({ message: 'Bot reiniciado!' });
});

// Middleware de erro
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Algo deu errado!');
});

// Mercado Pago setup
const mpClient = new MercadoPagoConfig({ accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN });
const payment = new Payment(mpClient);

app.post('/create-payment', async (req, res) => {
  try {
    const { title, price, email } = req.body;

    const payment_data = {
      transaction_amount: Number(price),
      description: title,
      payment_method_id: 'pix',
      payer: {
        email: email || 'comprador@email.com',
        first_name: 'Comprador',
        last_name: 'Comprador'
      }
    };

    const result = await payment.create({ body: payment_data });
    console.log('Mercado Pago payment result:', result);

    const payment_id = result.id;
    const qr_code = result.point_of_interaction?.transaction_data?.qr_code;
    const qr_code_base64 = result.point_of_interaction?.transaction_data?.qr_code_base64;

    if (!qr_code_base64) {
      console.error('QR Code base64 não retornado pelo Mercado Pago!');
    }

    res.json({ payment_id, qr_code, qr_code_base64 });
  } catch (error) {
    console.error(error.response?.data || error);
    res.status(500).json({ error: 'Erro ao criar pagamento' });
  }
});

// Lista de IDs de administradores do Discord
const ADMIN_IDS = process.env.ADMIN_IDS ? process.env.ADMIN_IDS.split(',').map(id => id.trim()) : [];

// Middleware de autenticação Discord (simples, para exemplo)
function requireDiscordAuth(req, res, next) {
  if (!req.session || !req.session.user) {
    // Se for uma requisição de página, redirecione para /login
    if (req.accepts('html')) {
      return res.redirect('/login');
    }
    // Se for API, retorna erro JSON
    return res.status(401).json({ error: 'Não autenticado' });
  }
  next();
}

function requireAdmin(req, res, next) {
  if (!req.session || !req.session.user || !ADMIN_IDS.includes(req.session.user.id)) {
    return res.status(403).json({ error: 'Acesso negado: não é admin' });
  }
  next();
}

// Endpoint para frontend saber quem está logado
app.get('/api/me', requireDiscordAuth, (req, res) => {
  res.json({ id: req.session.user.id, username: req.session.user.username });
});

// Middleware de autenticação admin por sessão
function requireAdminSession(req, res, next) {
  if (!req.session || !req.session.admin) {
    if (req.accepts('html')) {
      return res.redirect('/admin/login');
    }
    return res.status(401).json({ error: 'Não autenticado' });
  }
  next();
}

// Página de login admin
// Função para gerar o HTML do formulário, recebe mensagem de erro opcional
function renderLoginPage(errorMessage = '') {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Login Admin</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Poppins&display=swap');
    * {
      box-sizing: border-box;
    }
    body {
      margin: 0;
      font-family: 'Poppins', sans-serif;
      background: linear-gradient(135deg, #1f2235, #2b2f50);
      color: #fff;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      padding: 1rem;
    }
    .login-container {
      background: #2c2f55;
      padding: 3rem 2.5rem;
      border-radius: 12px;
      box-shadow: 0 8px 20px rgba(0, 210, 230, 0.2);
      width: 100%;
      max-width: 400px;
      text-align: center;
    }
    h2 {
      margin-bottom: 1.5rem;
      font-weight: 600;
      letter-spacing: 1px;
      color: #00d2e6;
      text-shadow: 0 0 8px #00d2e6aa;
    }
    form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    input {
      padding: 0.75rem 1rem;
      border-radius: 8px;
      border: 1.5px solid #444;
      background: #1e213a;
      color: #ddd;
      font-size: 1rem;
      transition: border-color 0.3s ease;
    }
    input:focus {
      outline: none;
      border-color: #00d2e6;
      box-shadow: 0 0 8px #00d2e6cc;
      background: #222540;
      color: #fff;
    }
    button {
      margin-top: 0.5rem;
      padding: 0.85rem 0;
      background: #00d2e6;
      border: none;
      border-radius: 8px;
      font-weight: 700;
      font-size: 1.1rem;
      color: #111;
      cursor: pointer;
      transition: background-color 0.3s ease;
      box-shadow: 0 0 12px #00d2e6bb;
    }
    button:hover {
      background: #00b4c8;
      box-shadow: 0 0 16px #00b4c8dd;
    }
    .error-message {
      background: #ff4d4d;
      padding: 0.75rem 1rem;
      border-radius: 6px;
      margin-bottom: 1rem;
      font-weight: 600;
      color: #fff;
      text-shadow: 0 0 3px #ff1a1a;
      user-select: none;
    }
    @media (max-width: 480px) {
      .login-container {
        padding: 2rem 1.5rem;
      }
    }
  </style>
</head>
<body>
  <div class="login-container" role="main" aria-label="Formulário de login admin">
    <h2>Login Admin</h2>
    ${errorMessage ? `<div class="error-message" role="alert">${errorMessage}</div>` : ''}
    <form method="POST" action="/admin/login" autocomplete="off" novalidate>
      <input name="user" type="text" placeholder="Usuário" required autocomplete="username" aria-label="Usuário" />
      <input name="pass" type="password" placeholder="Senha" required autocomplete="current-password" aria-label="Senha" />
      <button type="submit" aria-label="Entrar">Entrar</button>
    </form>
  </div>
</body>
</html>`;
}

// GET login
app.get('/admin/login', (req, res) => {
  res.send(renderLoginPage());
});

// POST login
app.post('/admin/login', express.urlencoded({ extended: true }), (req, res) => {
  const { user, pass } = req.body;
  if (user === process.env.ADMIN_USER && pass === process.env.ADMIN_PASS) {
    req.session.admin = true;
    return res.redirect('/admin');
  }
  res.status(401).send(renderLoginPage('Usuário ou senha incorretos'));
});

// Logout
app.get('/admin/logout', (req, res) => {
  req.session.admin = false;
  res.redirect('/admin/login');
});

// Página admin (protegida)
app.get('/admin', requireAdminSession, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Função para buscar apps da SquareCloud
async function getSquareCloudApps() {
  const token = process.env.SQUARECLOUD_TOKEN;
  if (!token) throw new Error('Token SquareCloud não configurado');
  const res = await fetch('https://api.squarecloud.app/v1/app/list', {
    headers: {
      'Authorization': token
    }
  });
  if (!res.ok) throw new Error(`Erro na API SquareCloud: ${res.status}`);
  const data = await res.json();
  return data.apps || [];
}

// Endpoint para listar bots hospedados na SquareCloud (sem filtro)
app.get('/api/squarecloud/bots', async (req, res) => {
  try {
    const apps = await getSquareCloudApps();
    const bots = apps.map(bot => ({
      id: bot.id || bot._id,
      name: bot.name,
      status: bot.status || 'offline'
    }));
    res.json(bots);
  } catch (err) {
    console.error('Erro ao buscar bots da SquareCloud:', err.message);
    res.status(500).json([]);
  }
});

// Endpoint para verificar status do sistema
app.get('/api/status', (req, res) => {
  const mercadoPagoAtivo = !!process.env.MERCADO_PAGO_ACCESS_TOKEN;
  const squareCloudAtivo = !!process.env.SQUARECLOUD_TOKEN;

  res.json({
    mercadopago: mercadoPagoAtivo ? 'online' : 'offline',
    hosting: squareCloudAtivo ? 'online' : 'offline'
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
