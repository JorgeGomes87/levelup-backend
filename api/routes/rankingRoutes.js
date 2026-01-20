const express = require('express');
const User = require('../models/User');
const auth = require('../auth');

const router = express.Router();

/* ==============================
   RANKING
============================== */
router.get('/ranking', auth, async (req, res) => {
  try {
    const ranking = await User.find()
      .select('nome pontos')
      .sort({ pontos: -1 })
      .limit(10);

    res.json(ranking);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao carregar ranking' });
  }
});

module.exports = router;
