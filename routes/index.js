const express = require('express');
const router = express.Router();
const loteriaMedellin = require('../providers/loteriaMedellin');

router.post('/loteria/results', async (req, res) => {
  try {
    const provider = new loteriaMedellin();
    const results = await provider.getResults();
    res.json(results);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener resultados' });
  }
});

module.exports = router;