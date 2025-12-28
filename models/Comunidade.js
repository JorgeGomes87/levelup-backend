const mongoose = require('mongoose');

const ComunidadeSchema = new mongoose.Schema({
  nome: { type: String, required: true, unique: true },
  // O Passo 2 pede um array de objetos de quiz
  quizzes: [{
    pergunta: { type: String, required: true },
    opcoes: [{ type: String, required: true }], // Array de strings (A, B, C, D)
    correta: { type: String, required: true }  // A resposta certa
  }],
  // Lista de IDs de usuários que entraram na comunidade (Passo 3)
  membros: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
});

module.exports = mongoose.model('Comunidade', ComunidadeSchema);