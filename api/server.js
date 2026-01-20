require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// Models e Auth
const User = require('./models/User');
const auth = require('./auth');

// Rotas modulares
const eventoRoutes = require('./routes/eventoRoutes');
const comunidadeRoutes = require('./routes/comunidadeRoutes');
const usuarioRoutes = require("./routes/usuarioRoutes");
const userRoutes = require('./routes/userRoutes');

const app = express();

/* ==============================
    CONFIGURAÇÕES ESSENCIAIS
============================== */
app.use(cors());
app.use(express.json());

/* ==============================
    CONEXÃO COM O BANCO
============================== */
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Conectado ao MongoDB Atlas!"))
  .catch(err => console.error("❌ Erro de conexão:", err.message));

/* ==============================
    TESTE DE API
============================== */
app.get("/", (req, res) => {
  res.json({
    status: "API Online",
    name: "LevelUp Backend",
    version: "1.0.0"
  });
});

/* ==============================
    ROTAS MODULARES
============================== */
app.use('/eventos', eventoRoutes);
app.use('/comunidades', comunidadeRoutes);
// Se preferir usar as rotas separadas de arquivos:
app.use('/usuarios', usuarioRoutes); 

/* ==============================
    USUÁRIOS (DASHBOARD & RANKING)
============================== */
app.get('/usuarios/ranking', async (req, res) => {
  try {
    const ranking = await User.find()
      .select('nome pontos')
      .sort({ pontos: -1 })
      .limit(10);
    res.json(ranking);
  } catch (error) {
    res.status(500).json({ erro: "Erro ao carregar ranking." });
  }
});

/* ==============================
    CADASTRO & LOGIN
============================== */
app.post('/usuarios/cadastro', async (req, res) => {
  console.log("📝 Recebendo novo cadastro...");
  try {
    const { nome, email, senha } = req.body;

    if (await User.findOne({ email })) {
      return res.status(400).json({ erro: "E-mail já cadastrado." });
    }

    const novoUsuario = await User.create({ nome, email, senha });

    const token = jwt.sign(
      { id: novoUsuario._id, role: novoUsuario.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    console.log("✅ Usuário criado:", novoUsuario._id);
    return res.status(201).json({ mensagem: "Usuário criado com sucesso!", token });
  } catch (error) {
    console.error("❌ Erro no cadastro:", error.message);
    return res.status(500).json({ erro: "Erro no cadastro" });
  }
});

app.post('/usuarios/login', async (req, res) => {
  try {
    const { email, senha } = req.body;
    const usuario = await User.findOne({ email });
    if (!usuario) return res.status(400).json({ erro: "E-mail ou senha incorretos." });

    const senhaCorreta = await bcrypt.compare(senha, usuario.senha);
    if (!senhaCorreta) return res.status(400).json({ erro: "E-mail ou senha incorretos." });

    const token = jwt.sign(
      { id: usuario._id, role: usuario.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    return res.json({ mensagem: "Login realizado com sucesso!", token });
  } catch (error) {
    res.status(500).json({ erro: "Erro no servidor" });
  }
});

/* ==============================
    ROTAS PROTEGIDAS (AUTH)
============================== */
app.get('/usuarios/me', auth, async (req, res) => {
  try {
    const usuario = await User.findById(req.usuarioId)
      .select('-senha')
      .populate('progresso.comunidade', 'nome');

    if (!usuario) return res.status(404).json({ erro: 'Usuário não encontrado.' });
    res.json(usuario);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao buscar dados do usuário.' });
  }
});

app.delete('/usuarios/deletar/:id', auth, async (req, res) => {
  const idDaUrl = req.params.id;
  const idDoToken = req.usuarioId;

  try {
    if (idDaUrl !== idDoToken) {
      return res.status(403).json({ erro: "Acesso negado!", mensagem: "Você só pode deletar sua própria conta." });
    }
    await User.findByIdAndDelete(idDaUrl);
    res.json({ mensagem: "Sua conta foi removida com sucesso!" });
  } catch (error) {
    res.status(500).json({ erro: "Erro ao deletar usuário" });
  }
});

/* ==============================
    INICIALIZAÇÃO DO SERVIDOR
============================== */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Servidor rodando na porta ${PORT}`));