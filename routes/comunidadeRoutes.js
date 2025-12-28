const express = require('express');
const router = express.Router();
const Comunidade = require('../models/Comunidade');
const auth = require('../auth'); // Protegemos para que apenas usuários logados criem comunidades

// Rota POST /comunidades (Conforme Passo 2)
router.post('/', auth, async (req, res) => {
  try {
    const { nome, quizzes } = req.body;

    const novaComunidade = new Comunidade({
      nome,
      quizzes
    });

    await novaComunidade.save();
    res.status(201).json({
      mensagem: "🏰 Comunidade criada com sucesso!",
      comunidade: novaComunidade
    });
  } catch (error) {
    res.status(500).json({ erro: "Erro ao criar comunidade", detalhe: error.message });
  }
});

// Rota GET /comunidades (Para você ver o que criou)
router.get('/', async (req, res) => {
    const comunidades = await Comunidade.find();
    res.json(comunidades);
});

module.exports = router;