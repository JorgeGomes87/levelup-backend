const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

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

    const existe = await User.findOne({ email });
    if (existe) {
      return res.status(400).json({ erro: 'E-mail já cadastrado' });
    }

    const senhaHash = await bcrypt.hash(senha, 10);

    const usuario = await User.create({
      nome,
      email,
      senha: senhaHash,
      pontos: 0
    });

    res.status(201).json({
      mensagem: 'Usuário cadastrado com sucesso'
    });
  } catch (err) {
    res.status(500).json({ erro: 'Erro no cadastro' });
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

    const senhaOk = await bcrypt.compare(senha, usuario.senha);
    if (!senhaOk) {
      return res.status(400).json({ erro: 'E-mail ou senha inválidos' });
    }

    const token = jwt.sign(
      { id: usuario._id },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({ token });
  } catch (err) {
    res.status(500).json({ erro: 'Erro no login' });
  }
});

module.exports = router;
