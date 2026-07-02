const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');

const SOURCES_DIR = path.join(__dirname, '../sources');

/**
 * Garante que a pasta sources/ existe.
 */
const ensureSourcesDir = () => {
  if (!fs.existsSync(SOURCES_DIR)) {
    fs.mkdirSync(SOURCES_DIR, { recursive: true });
  }
};

/**
 * Gera um slug seguro a partir do nome do produto.
 * Ex: "Ticket Bot Pro" => "ticket-bot-pro"
 */
const toSlug = (nome) => {
  return nome
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

/**
 * Gera um nome único para a pasta da source, evitando colisões.
 */
const gerarNomePasta = (nome) => {
  const slug = toSlug(nome);
  const timestamp = Date.now();
  return `${slug}-${timestamp}`;
};

/**
 * Extrai um arquivo ZIP para a pasta sources/<nomePasta>.
 * Remove o ZIP após a extração.
 *
 * @param {string} zipPath - Caminho completo do arquivo ZIP temporário
 * @param {string} nomeProduto - Nome do produto para gerar o slug
 * @returns {string} - Nome da pasta criada (sourceRef)
 */
const extrairSource = async (zipPath, nomeProduto) => {
  ensureSourcesDir();

  const nomePasta = gerarNomePasta(nomeProduto);
  const destino = path.join(SOURCES_DIR, nomePasta);

  fs.mkdirSync(destino, { recursive: true });

  const zip = new AdmZip(zipPath);
  zip.extractAllTo(destino, true);

  // Remover ZIP temporário após extração
  if (fs.existsSync(zipPath)) {
    fs.unlinkSync(zipPath);
  }

  return nomePasta;
};

/**
 * Remove a pasta de uma source do disco.
 *
 * @param {string} sourceRef - Nome da pasta da source
 */
const removerSource = (sourceRef) => {
  const dir = path.join(SOURCES_DIR, sourceRef);
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
};

/**
 * Retorna o caminho absoluto de uma source.
 *
 * @param {string} sourceRef - Nome da pasta da source
 * @returns {string|null} - Caminho absoluto ou null se não existir
 */
const getCaminhoSource = (sourceRef) => {
  const dir = path.join(SOURCES_DIR, sourceRef);
  return fs.existsSync(dir) ? dir : null;
};

/**
 * Lista todas as sources disponíveis no disco.
 */
const listarSources = () => {
  ensureSourcesDir();
  return fs.readdirSync(SOURCES_DIR).filter((item) => {
    return fs.statSync(path.join(SOURCES_DIR, item)).isDirectory();
  });
};

module.exports = {
  extrairSource,
  removerSource,
  getCaminhoSource,
  listarSources,
  SOURCES_DIR,
};
