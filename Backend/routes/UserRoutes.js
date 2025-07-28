// routes/userRoutes.js
const express = require('express');
const userController = require('../controllers/UserController'); // Importar el controlador de usuarios

const router = express.Router();

// Definir las rutas específicas de usuarios
router.get('/login', userController.login);  // Ruta para obtener todos los usuarios

module.exports = router;