const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const auth = require('../auth');

const router = express.Router();

/* ==============================
   CADASTRO
============================== */
router.post('/cadastro', async (req, res) => {
  try {
    const { nome, email, senha } = req.body;

    if (await User.findOne({ email })) {
      return res.status(400).json({ erro: "E-mail já cadastrado." });
    }

    const usuario = await User.create({ nome, email, senha });

    const token = jwt.sign(
      { id: usuario._id, role: usuario.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(201).json({
      mensagem: "Usuário criado com sucesso!",
      token
    });
  } catch (error) {
    res.status(500).json({ erro: "Erro no cadastro" });
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
      return res.status(400).json({ erro: "Credenciais inválidas." });
    }

    const senhaOk = await bcrypt.compare(senha, usuario.senha);
    if (!senhaOk) {
      return res.status(400).json({ erro: "Credenciais inválidas." });
    }

    const token = jwt.sign(
      { id: usuario._id, role: usuario.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({ token });
  } catch (error) {
    res.status(500).json({ erro: "Erro no login" });
  }
});

module.exports = router;
