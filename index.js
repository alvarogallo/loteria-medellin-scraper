const express = require('express');
const cors = require('cors');
const routes = require('./routes');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Rutas
app.use('/', routes);

// Iniciar servidor
app.listen(port, () => {
  console.log(`Servidor ejecutándose en el puerto ${port}`);
});