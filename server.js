
//////////Model de Usuário//////////
const mongoose = require('mongoose');
const userschema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true, unique: true
    },
    senha: {
        type: String,
        required: true
    },
    comunidades : [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comunidade'
    }]
});

module.exports = mongoose.model('User', userschema);

//////////Configuração servidor e rota de cadastro//////////

const express = require  (`express`) ;
const userRouter = require(`./src/routes/userRoutes`);
const router = express.Router()
require(`dotenv`).config();
const bcrypt = require('bcrypt');

// Configuração do Express

const app = express();
app.use(express.json()); // Para interpretar JSON no corpo das requisições 

// Conexão com o banco de dados MongoDB (substitua pela sua URL no .env)

mongoose.connect(process.env.MONGODB_URI ) .then(() => console.log("Conectado ao MongoDB com sucesso!"))
.catch((error) => console.error("Erro ao conectar ao MongoDB:", error));

// Usar as rotas de usuário
app.use('/api/usuarios', userRouter);
// Iniciar o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});

// Model de Usuário 
const Usuario = require('../models/Usuario'); 

router.post('/cadastro', async (req, res) => {
    try {
        const { nome, email, senha } = req.body;

        // 1. Verificar se o usuário já existe (boa prática)
        const usuarioExiste = await Usuario.findOne({ email });
        if (usuarioExiste) {
            return res.status(400).json({ mensagem: "Opa LEVEL-UP informa E-mail já cadastrado" });
        }

        // 2. Criar e salvar o novo usuário
        const novoUsuario = new Usuario({ nome, email, senha });
        await novoUsuario.save();


        // 3. Responder com sucesso
        res.status(201).json({ mensagem: "Seja Bem Vindo a LEVEL-UP Usuário criado com sucesso!", usuario: novoUsuario });

    } catch (error) {
        // Tratar erros do servidor ou de validação
        res.status(500).json({ mensagem: "Erro no servidor", erro: error.message });
    }
});

module.exports = router;