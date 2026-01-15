require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// ===== Middlewares =====
app.use(cors());
app.use(express.json());

// ===== Rotas =====
const usuarioRoutes = require("./routes/usuarioRoutes");
app.use("/usuarios", usuarioRoutes);
const userRoutes = require('./routes/userRoutes');

app.use('/usuarios', userRoutes);

// ===== Teste de API =====
app.get("/", (req, res) => {
  res.json({
    status: "API Online",
    name: "LevelUp Backend",
    version: "1.0.0"
  });
});

// ===== Conexão MongoDB =====
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB conectado com sucesso"))
  .catch((err) => console.error("❌ Erro ao conectar no MongoDB:", err));

// ===== Start Server =====
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});
