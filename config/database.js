const mongoose = require('mongoose');
const config = require('./index');

const connectDB = async () => {
  try {
    await mongoose.connect(config.mongoUri);
    console.log('[DB] Conectado ao MongoDB com sucesso.');
  } catch (err) {
    console.error('[DB] Erro ao conectar ao MongoDB:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
