const express = require('express');
const router = express.Router();
const Comunidade = require('../models/Comunidade');
const auth = require('../auth');
const User = require('../models/User'); 

// --- CRIAR COMUNIDADE ---
router.post('/', auth, async (req, res) => {
  try {
    const { nome, quizzes } = req.body;
    const novaComunidade = new Comunidade({ nome, quizzes });
    await novaComunidade.save();
    res.status(201).json({ mensagem: "🏰 Comunidade criada!", comunidade: novaComunidade });
  } catch (error) {
    res.status(500).json({ erro: "Erro ao criar", detalhe: error.message });
  }
});

// --- ENTRAR NA COMUNIDADE ---
router.post('/:id/entrar', auth, async (req, res) => {
  try {
    const comunidadeId = req.params.id;
    const usuarioId = req.usuarioId;

    const comunidade = await Comunidade.findById(comunidadeId);
    if (!comunidade) return res.status(404).json({ erro: "Comunidade não encontrada" });

    if (comunidade.membros.includes(usuarioId)) {
      return res.status(400).json({ mensagem: "Você já faz parte desta comunidade!" });
    }

    comunidade.membros.push(usuarioId);
    await comunidade.save();

    // Cria o registro de progresso inicial
    await User.findByIdAndUpdate(usuarioId, {
      $push: { progresso: { comunidade: comunidadeId, pontos: 0 } }
    });

    res.json({ mensagem: "🚀 Você entrou na comunidade!" });
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

// --- RESPONDER E GANHAR PONTOS (Atualizado) ---
router.post('/:id/responder', auth, async (req, res) => {
  try {
    const { perguntaIndex, resposta } = req.body;
    const comunidadeId = req.params.id;
    const comunidade = await Comunidade.findById(comunidadeId);

    if (!comunidade) return res.status(404).json({ erro: "Comunidade não encontrada" });

    const pergunta = comunidade.quizzes[perguntaIndex];
    if (!pergunta) return res.status(404).json({ erro: "Pergunta não encontrada" });

    const eCorreta = pergunta.correta === resposta;

    if (eCorreta) {
      // 1. Atualiza pontos GERAIS (para o Ranking)
      // 2. Atualiza pontos da COMUNIDADE específica (dentro do array progresso)
      await User.findOneAndUpdate(
        { _id: req.usuarioId, "progresso.comunidade": comunidadeId },
        { 
          $inc: { 
            "pontos": 10, 
            "progresso.$.pontos": 10 
          } 
        }
      );

      res.json({ correto: true, mensagem: "🔥 Resposta correta! +10 pontos no ranking." });
    } else {
      res.json({ correto: false, mensagem: "❌ Errado! Tente novamente." });
    }
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

// LISTAR
router.get('/', async (req, res) => {
    const comunidades = await Comunidade.find();
    res.json(comunidades);
});

// ADICIONAR PERGUNTAS
router.put('/:id/adicionar-perguntas', auth, async (req, res) => {
  try {
    const { novasQuizzes } = req.body; 
    const comunidade = await Comunidade.findById(req.params.id);
    if (!comunidade) return res.status(404).json({ erro: "Comunidade não encontrada" });

    comunidade.quizzes.push(...novasQuizzes);
    await comunidade.save();
    res.json({ mensagem: "Perguntas adicionadas!", total: comunidade.quizzes.length });
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

module.exports = router;