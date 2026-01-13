🛡️ LevelUp – API de Gamificação

O LevelUp é uma API de gamificação desenvolvida em Node.js que permite o gerenciamento de usuários, comunidades temáticas, quizzes, eventos e rankings.
O projeto aplica conceitos de autenticação, segurança, regras de negócio e pontuação, servindo como base para integração com um frontend de demonstração.

🚀 Funcionalidades

Cadastro e login de usuários com autenticação segura

Criptografia de senhas

Sistema de comunidades temáticas

Quizzes com validação de respostas

Sistema de pontuação global e por comunidade

Rankings gerais e rankings por comunidade

Criação e gerenciamento de eventos

Controle de acesso por autenticação (JWT)

Estrutura preparada para usuários administradores

🛠️ Tecnologias Utilizadas

Node.js – Ambiente de execução

Express – Criação e organização das rotas

MongoDB Atlas – Banco de dados em nuvem

Mongoose – Modelagem e manipulação dos dados

JWT (JSON Web Token) – Autenticação e segurança

Bcrypt – Criptografia de senhas

Dotenv – Gerenciamento de variáveis de ambiente

Cors – Liberação de acesso para o frontend

Thunder Client – Testes das rotas da API

🧱 Estrutura do Projeto
api/
│── models/
│   ├── User.js
│   ├── Comunidade.js
│   └── Event.js
│
│── routes/
│   ├── comunidadeRoutes.js
│   └── eventoRoutes.js
│
│── auth.js
│── server.js
│── package.json
│── .env (não versionado)

🔐 Autenticação

A autenticação é feita utilizando JWT

Após o login, o usuário recebe um token

O token deve ser enviado no header das requisições protegidas

Authorization: Bearer SEU_TOKEN_AQUI


As senhas são criptografadas com Bcrypt antes de serem armazenadas no banco de dados

👤 Usuários e Permissões

Todo usuário é criado como user por padrão

O sistema já possui estrutura preparada para usuários administradores

Permissões específicas para administrador podem ser adicionadas facilmente

O controle de acesso é feito via payload do JWT

📡 Endpoints Principais
Usuários

POST /usuarios/cadastro – Cadastro de usuário

POST /usuarios/login – Login

GET /usuarios – Listar usuários (dashboard)

GET /usuarios/ranking – Ranking global

DELETE /usuarios/deletar/:id – Deletar conta (somente o próprio usuário)

Comunidades

GET /comunidades – Listar comunidades

POST /comunidades – Criar comunidade (autenticado)

POST /comunidades/:id/entrar – Entrar na comunidade

POST /comunidades/:id/responder – Responder quiz

GET /comunidades/:id/ranking – Ranking da comunidade

PUT /comunidades/:id/adicionar-perguntas – Adicionar quizzes

Eventos

POST /eventos/criar – Criar evento

GET /eventos/todos – Listar eventos

DELETE /eventos/deletar/:id – Deletar evento (somente criador)

🧪 Testes

Todas as rotas da API foram testadas utilizando o Thunder Client

Foram validados:

Cadastro e login

Autenticação via token

Resposta de quizzes

Atualização de pontuação

Rankings

Regras de acesso

🌐 Banco de Dados

Utiliza MongoDB Atlas

Estrutura baseada em documentos

Relacionamentos feitos via ObjectId

Pontuação global e por comunidade armazenadas no usuário

🖥️ Front-end

O frontend ainda não foi desenvolvido

A próxima etapa do projeto é criar uma interface simples apenas para demonstração

Funcionalidades previstas:

Cadastro e login

Visualização de comunidades

Resposta de quizzes

Exibição de rankings

▶️ Como Executar o Projeto
Clonar o repositório
git clone https://github.com/Joao-Roberto-Soares/LevelUpEventos.git

Instalar dependências
npm install

Criar o arquivo .env
PORT=3000
MONGO_URI=SEU_MONGO_ATLAS_URI
JWT_SECRET=SUA_CHAVE_SECRETA

Iniciar o servidor
npm start

📌 Status do Projeto

🟢 Backend finalizado e funcional

🟡 Frontend pendente (demonstração)

🟡 Sistema de permissões admin preparado para expansão

📄 Licença

Este projeto foi desenvolvido para fins educacionais
