const { Produto, Log } = require('../models');
const sourcesService = require('../services/sources');
const path = require('path');
const fs = require('fs');

/**
 * GET /admin/products
 * Lista todos os produtos (admin vê todos os status).
 */
const listar = async (req, res, next) => {
  try {
    const { status, categoria, page = 1, limit = 20 } = req.query;
    const filtro = {};
    if (status) filtro.status = status;
    if (categoria) filtro.categoria = categoria;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [produtos, total] = await Promise.all([
      Produto.find(filtro).skip(skip).limit(parseInt(limit)).sort({ createdAt: -1 }),
      Produto.countDocuments(filtro),
    ]);

    res.json({
      data: produtos,
      pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /admin/products/:id
 * Retorna um produto pelo ID (admin pode ver o sourceRef).
 */
const buscarPorId = async (req, res, next) => {
  try {
    const produto = await Produto.findById(req.params.id).select('+sourceRef');
    if (!produto) return res.status(404).json({ error: 'Produto não encontrado' });
    res.json(produto);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /admin/products
 * Cria um novo produto com upload do ZIP da source.
 */
const criar = async (req, res, next) => {
  try {
    const { nome, descricao, categoria, preco, desconto, status } = req.body;

    // Validar presença do arquivo ZIP
    if (!req.files || !req.files.source || req.files.source.length === 0) {
      return res.status(400).json({ error: 'O arquivo ZIP da source é obrigatório' });
    }

    const zipFile = req.files.source[0];
    const bannerFile = req.files.banner ? req.files.banner[0] : null;
    const imagemFile = req.files.imagem ? req.files.imagem[0] : null;

    // Extrair ZIP para sources/<slug>
    const sourceRef = await sourcesService.extrairSource(zipFile.path, nome);

    // Montar paths de imagens
    const banner = bannerFile ? `/uploads/images/${bannerFile.filename}` : '';
    const imagem = imagemFile ? `/uploads/images/${imagemFile.filename}` : '';

    const produto = await Produto.create({
      nome,
      descricao: descricao || '',
      categoria: categoria || 'Outros',
      preco: parseFloat(preco),
      desconto: parseFloat(desconto) || 0,
      banner,
      imagem,
      status: status || 'ativo',
      sourceRef,
    });

    await Log.registrar({
      nivel: 'audit',
      origem: 'admin:produtos',
      mensagem: `Produto criado: ${nome} (source: ${sourceRef})`,
      discordId: req.user.id,
      metadata: { produtoId: produto._id, sourceRef },
    });

    // Retornar sem sourceRef (segurança)
    res.status(201).json(produto);
  } catch (err) {
    // Limpar arquivo ZIP temporário em caso de erro
    if (req.files?.source?.[0]?.path && fs.existsSync(req.files.source[0].path)) {
      fs.unlinkSync(req.files.source[0].path);
    }
    next(err);
  }
};

/**
 * PUT /admin/products/:id
 * Atualiza um produto. Se um novo ZIP for enviado, substitui a source.
 */
const atualizar = async (req, res, next) => {
  try {
    const produto = await Produto.findById(req.params.id).select('+sourceRef');
    if (!produto) return res.status(404).json({ error: 'Produto não encontrado' });

    const { nome, descricao, categoria, preco, desconto, status } = req.body;

    // Atualizar campos textuais
    if (nome !== undefined) produto.nome = nome;
    if (descricao !== undefined) produto.descricao = descricao;
    if (categoria !== undefined) produto.categoria = categoria;
    if (preco !== undefined) produto.preco = parseFloat(preco);
    if (desconto !== undefined) produto.desconto = parseFloat(desconto);
    if (status !== undefined) produto.status = status;

    // Atualizar imagens se enviadas
    if (req.files?.banner?.[0]) {
      produto.banner = `/uploads/images/${req.files.banner[0].filename}`;
    }
    if (req.files?.imagem?.[0]) {
      produto.imagem = `/uploads/images/${req.files.imagem[0].filename}`;
    }

    // Substituir source se novo ZIP enviado
    if (req.files?.source?.[0]) {
      const oldSourceRef = produto.sourceRef;
      const novoNome = nome || produto.nome;
      const novaSourceRef = await sourcesService.extrairSource(req.files.source[0].path, novoNome);

      // Remover source antiga
      if (oldSourceRef) sourcesService.removerSource(oldSourceRef);

      produto.sourceRef = novaSourceRef;

      await Log.registrar({
        nivel: 'audit',
        origem: 'admin:produtos',
        mensagem: `Source do produto atualizada: ${produto.nome}`,
        discordId: req.user.id,
        metadata: { produtoId: produto._id, sourceAnterior: oldSourceRef, sourceNova: novaSourceRef },
      });
    }

    await produto.save();

    await Log.registrar({
      nivel: 'audit',
      origem: 'admin:produtos',
      mensagem: `Produto atualizado: ${produto.nome}`,
      discordId: req.user.id,
      metadata: { produtoId: produto._id },
    });

    res.json(produto);
  } catch (err) {
    if (req.files?.source?.[0]?.path && fs.existsSync(req.files.source[0].path)) {
      fs.unlinkSync(req.files.source[0].path);
    }
    next(err);
  }
};

/**
 * DELETE /admin/products/:id
 * Remove um produto e sua source do disco.
 */
const remover = async (req, res, next) => {
  try {
    const produto = await Produto.findById(req.params.id).select('+sourceRef');
    if (!produto) return res.status(404).json({ error: 'Produto não encontrado' });

    // Remover source do disco
    if (produto.sourceRef) {
      sourcesService.removerSource(produto.sourceRef);
    }

    await Produto.findByIdAndDelete(req.params.id);

    await Log.registrar({
      nivel: 'audit',
      origem: 'admin:produtos',
      mensagem: `Produto removido: ${produto.nome}`,
      discordId: req.user.id,
      metadata: { produtoId: produto._id, sourceRef: produto.sourceRef },
    });

    res.json({ message: 'Produto removido com sucesso' });
  } catch (err) {
    next(err);
  }
};

module.exports = { listar, buscarPorId, criar, atualizar, remover };
