const multer = require('multer');
const path = require('path');
const fs = require('fs');
const config = require('../config');

// Garantir que as pastas de upload existam
const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

// Storage para imagens (logo, banner, imagens de produtos)
const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../uploads/images');
    ensureDir(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

// Storage temporário para ZIPs de bots (serão extraídos e removidos)
const zipStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../uploads/temp');
    ensureDir(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}.zip`);
  },
});

// Filtro para imagens
const imageFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de arquivo inválido. Apenas JPEG, PNG, GIF e WebP são aceitos.'), false);
  }
};

// Filtro para ZIPs
const zipFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ext === '.zip') {
    cb(null, true);
  } else {
    cb(new Error('Apenas arquivos .zip são aceitos para sources de bots.'), false);
  }
};

// Uploader de imagens
const uploadImage = multer({
  storage: imageStorage,
  fileFilter: imageFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

// Uploader de ZIPs
const uploadZip = multer({
  storage: zipStorage,
  fileFilter: zipFilter,
  limits: { fileSize: config.upload.maxFileSize }, // 50MB
});

module.exports = { uploadImage, uploadZip };
