const mongoose = require('mongoose');

/**
 * produtos — catálogo de bots vendidos na plataforma.
 *
 * IMPORTANTE: `sourceRef` é a referência interna (chave/identificador)
 * para localizar o código-fonte no armazenamento privado durante o
 * deploy automático. Ela NUNCA deve chegar ao frontend — por isso o
 * `toJSON`/`toObject` abaixo a remove de qualquer resposta serializada.
 * Use sempre `produto.toJSON()` (ou deixe o Express/Mongoose serializar
 * normalmente) ao responder requisições da API.
 *
 * Para rotas administrativas que precisam do sourceRef, use:
 *   Produto.findById(id).select('+sourceRef')
 */
const produtoSchema = new mongoose.Schema(
  {
    nome: { type: String, required: true, trim: true },
    descricao: { type: String, default: '' },
    categoria: {
      type: String,
      enum: ['Security', 'Tickets', 'Moderação', 'Economia', 'Outros'],
      default: 'Outros',
    },
    preco: { type: Number, required: true, min: 0 },
    desconto: { type: Number, default: 0, min: 0, max: 100 }, // percentual de desconto
    banner: { type: String, default: '' },
    imagem: { type: String, default: '' },
    status: {
      type: String,
      enum: ['ativo', 'inativo', 'em_breve'],
      default: 'ativo',
    },
    // Referência interna ao storage privado das sources. Nunca expor ao frontend.
    sourceRef: { type: String, required: true, select: false },
  },
  {
    timestamps: true,
    collection: 'produtos',
    toJSON: {
      transform(doc, ret) {
        delete ret.sourceRef;
        return ret;
      },
    },
    toObject: {
      transform(doc, ret) {
        delete ret.sourceRef;
        return ret;
      },
    },
  }
);

module.exports = mongoose.models.Produto || mongoose.model('Produto', produtoSchema);
