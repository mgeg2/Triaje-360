const express = require('express');
const app = express();
const cors = require('cors');

const indexRoutes = require('./routes/IndexRoutes');  // Importar las rutas generales
var {config,routes} = require('./config.js')
app.use(express.json());
app.use(cors());
app.use(routes.API, indexRoutes);  // Aquí usamos el archivo de rutas general

const userController = require('./controllers/UserController'); // Importar el controlador de usuarios
userController.iniUser0();

app.listen(config.PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${config.PORT}`);
});




