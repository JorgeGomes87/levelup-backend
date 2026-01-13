const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Comunidade = require('../models/Comunidade');
const User = require('../models/User');
const auth = require('../auth');

/* =====================================================
   FUNÇÃO AUXILIAR – VALIDAR OBJECT ID
===================================================== */
function validarObjectId(id, res) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400).json({ erro: "ID inválido" });
    return false;
  }
  return true;
}

/* =====================================================
   1. LISTAR TODAS AS COMUNIDADES
   GET /comunidades
===================================================== */
router.get('/', async (req, res) => {
  try {
    const comunidades = await Comunidade.find();
    res.json(comunidades);
  } catch (error) {
    res.status(500).json({ erro: "Erro ao listar comunidades" });
  }
});

/* =====================================================
   2. LISTAR USUÁRIOS DA COMUNIDADE
   GET /comunidades/:id/usuarios
===================================================== */
router.get('/:id/usuarios', async (req, res) => {
  const comunidadeId = req.params.id;
  if (!validarObjectId(comunidadeId, res)) return;

  try {
    const usuarios = await User.find(
      { "progresso.comunidade": comunidadeId },
      "nome progresso"
    );

    const resultado = usuarios.map(user => {
      const prog = user.progresso.find(
        p => p.comunidade.toString() === comunidadeId
      );

      return {
        id: user._id,
        nome: user.nome,
        pontos: prog ? prog.pontos : 0
      };
    });

    res.json(resultado);
  } catch (error) {
    res.status(500).json({ erro: "Erro ao listar usuários da comunidade" });
  }
});

/* =====================================================
   3. RANKING DA COMUNIDADE
   GET /comunidades/:id/ranking
===================================================== */
router.get('/:id/ranking', async (req, res) => {
  const comunidadeId = req.params.id;
  if (!validarObjectId(comunidadeId, res)) return;

  try {
    const usuarios = await User.find(
      { "progresso.comunidade": comunidadeId },
      "nome progresso"
    );

    const ranking = usuarios
      .map(user => {
        const prog = user.progresso.find(
          p => p.comunidade.toString() === comunidadeId
        );

        return {
          nome: user.nome,
          pontos: prog ? prog.pontos : 0
        };
      })
      .sort((a, b) => b.pontos - a.pontos)
      .slice(0, 10); // TOP 10

    res.json(ranking);
  } catch (error) {
    res.status(500).json({
      erro: "Erro ao gerar ranking",
      detalhe: error.message
    });
  }
});

/* =====================================================
   4. QUIZ ALEATÓRIO DA COMUNIDADE
   GET /comunidades/:id/quiz
===================================================== */
router.get('/:id/quiz', async (req, res) => {
  const comunidadeId = req.params.id;
  if (!validarObjectId(comunidadeId, res)) return;

  try {
    const resultado = await Comunidade.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(comunidadeId) } },
      { $unwind: "$quizzes" },
      { $sample: { size: 10 } },
      {
        $project: {
          _id: 0,
          pergunta: "$quizzes.pergunta",
          alternativas: "$quizzes.alternativas"
        }
      }
    ]);

    res.json(resultado);
  } catch (error) {
    res.status(500).json({ erro: "Erro ao gerar quiz aleatório" });
  }
});

/* =====================================================
   5. CRIAR COMUNIDADE
   POST /comunidades
===================================================== */
router.post('/', auth, async (req, res) => {
  try {
    const { nome, quizzes } = req.body;

    const novaComunidade = new Comunidade({
      nome,
      quizzes,
      membros: []
    });

    await novaComunidade.save();

    res.status(201).json({
      mensagem: "🏰 Comunidade criada!",
      comunidade: novaComunidade
    });
  } catch (error) {
    res.status(500).json({
      erro: "Erro ao criar comunidade",
      detalhe: error.message
    });
  }
});

/* =====================================================
   6. ENTRAR NA COMUNIDADE
   POST /comunidades/:id/entrar
===================================================== */
router.post('/:id/entrar', auth, async (req, res) => {
  const comunidadeId = req.params.id;
  const usuarioId = req.usuarioId;

  if (!validarObjectId(comunidadeId, res)) return;

  try {
    const comunidade = await Comunidade.findById(comunidadeId);
    if (!comunidade) {
      return res.status(404).json({ erro: "Comunidade não encontrada" });
    }

    // Evita duplicação de membros
    const jaMembro = comunidade.membros.some(
      id => id.toString() === usuarioId
    );

    if (jaMembro) {
      return res.status(400).json({
        mensagem: "Você já faz parte desta comunidade!"
      });
    }

    comunidade.membros.push(usuarioId);
    await comunidade.save();

    // Evita duplicar progresso
    const jaExisteProgresso = await User.findOne({
      _id: usuarioId,
      "progresso.comunidade": comunidadeId
    });

    if (!jaExisteProgresso) {
      await User.findByIdAndUpdate(usuarioId, {
        $push: { progresso: { comunidade: comunidadeId, pontos: 0 } }
      });
    }

    res.json({ mensagem: "🚀 Você entrou na comunidade!" });
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

/* =====================================================
   7. RESPONDER QUIZ E GANHAR PONTOS
   POST /comunidades/:id/responder
===================================================== */
router.post('/:id/responder', auth, async (req, res) => {
  const { perguntaIndex, resposta } = req.body;
  const comunidadeId = req.params.id;

  if (!validarObjectId(comunidadeId, res)) return;

  try {
    const comunidade = await Comunidade.findById(comunidadeId);
    if (!comunidade) {
      return res.status(404).json({ erro: "Comunidade não encontrada" });
    }

    const usuario = await User.findById(req.usuarioId);

    const temVinculo = usuario.progresso.some(
      p => p.comunidade.toString() === comunidadeId
    );

    if (!temVinculo) {
      return res.status(403).json({
        erro: "Você precisa entrar na comunidade antes de responder!"
      });
    }

    const pergunta = comunidade.quizzes[perguntaIndex];
    if (!pergunta) {
      return res.status(404).json({ erro: "Pergunta não encontrada" });
    }

    const correta = pergunta.correta === resposta;

    if (correta) {
      await User.findOneAndUpdate(
        { _id: req.usuarioId, "progresso.comunidade": comunidadeId },
        {
          $inc: {
            pontos: 10,
            "progresso.$.pontos": 10
          }
        }
      );

      return res.json({
        correto: true,
        mensagem: "🔥 Resposta correta! +10 pontos."
      });
    }

    res.json({
      correto: false,
      mensagem: "❌ Errado! Tente novamente."
    });
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

/* =====================================================
   8. ADICIONAR PERGUNTAS
   PUT /comunidades/:id/adicionar-perguntas
===================================================== */
router.put('/:id/adicionar-perguntas', auth, async (req, res) => {
  const comunidadeId = req.params.id;
  if (!validarObjectId(comunidadeId, res)) return;

  try {
    const { novasQuizzes } = req.body;

    const comunidade = await Comunidade.findById(comunidadeId);
    if (!comunidade) {
      return res.status(404).json({ erro: "Comunidade não encontrada" });
    }

    comunidade.quizzes.push(...novasQuizzes);
    await comunidade.save();

    res.json({
      mensagem: "Perguntas adicionadas!",
      total: comunidade.quizzes.length
    });
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

module.exports = router;
