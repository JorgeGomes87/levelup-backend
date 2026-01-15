const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

/* ==============================
   CADASTRO
============================== */
router.post('/cadastro', async (req, res) => {
  try {
    const { nome, email, senha } = req.body;

    if (!nome || !email || !senha) {
      return res.status(400).json({ erro: 'Preencha todos os campos' });
    }

    const usuarioExiste = await User.findOne({ email });
    if (usuarioExiste) {
      return res.status(400).json({ erro: 'E-mail já cadastrado' });
    }

    const senhaHash = await bcrypt.hash(senha, 10);

    const novoUsuario = await User.create({
      nome,
      email,
      senha: senhaHash,
      pontos: 0,
      role: 'user'
    });

    return res.status(201).json({
      mensagem: 'Usuário cadastrado com sucesso'
    });

  } catch (error) {
    console.error('Erro no cadastro:', error);
    return res.status(500).json({ erro: 'Erro no servidor' });
  }
});

/* ==============================
   LOGIN
============================== */
router.post('/login', async (req, res) => {
  try {
    const { email, senha } = req.body;

    const usuario = await User.findOne({ email });
    if (!usuario) {
      return res.status(400).json({ erro: 'E-mail ou senha inválidos' });
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    if (!senhaValida) {
      return res.status(400).json({ erro: 'E-mail ou senha inválidos' });
    }

    const token = jwt.sign(
      { id: usuario._id, role: usuario.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    return res.json({
      mensagem: 'Login realizado com sucesso',
      token
    });

  } catch (error) {
    console.error('Erro no login:', error);
    return res.status(500).json({ erro: 'Erro no servidor' });
  }
});

/* ==============================
   RANKING (PROTEGIDO)
============================== */
router.get('/ranking', authMiddleware, async (req, res) => {
  try {
    const ranking = await User.find()
      .select('nome pontos')
      .sort({ pontos: -1 })
      .limit(10);

    return res.json(ranking);

  } catch (error) {
    console.error('Erro no ranking:', error);
    return res.status(500).json({ erro: 'Erro ao carregar ranking' });
  }
});

module.exports = router;
