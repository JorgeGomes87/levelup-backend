const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    // 1. Pega o token enviado pelo Thunder Client/Insomnia
    const token = req.header('Authorization');

    // 2. Se não enviar nada, bloqueia
    if (!token) {
        return res.status(401).json({ mensagem: "Acesso negado! Token não fornecido." });
    }

    try {
        // 3. Remove a palavra 'Bearer ' caso ela exista e valida o token
        const tokenLimpo = token.replace('Bearer ', '');
        const verificado = jwt.verify(tokenLimpo, process.env.JWT_SECRET);
        
        // 4. Salva os dados do usuário dentro da requisição (útil para o futuro)
        req.usuarioId = verificado;
        
        // 5. Libera para a próxima função (o Delete)
        next();
    } catch (err) {
        res.status(400).json({ mensagem: "Token inválido ou expirado!" });
    }
};