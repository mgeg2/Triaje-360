// routes/userRoutes.js
const express = require('express');
const userController = require('../controllers/UserController'); // Importar el controlador de usuarios

const router = express.Router();

// Definir las rutas específicas de usuarios
router.get('', userController.getAllUsers);  // Ruta para obtener todos los usuarios
router.post('', userController.postUser);  // Ruta para crear un nuevo usuario
router.delete('/:id', userController.deleteUser);  // Ruta para eliminar un usuario por ID
router.put('/:id', userController.updateUser);  // Ruta para actualizar un usuario por ID
router.get('/alus', userController.getAllAlus);  // Ruta para obtener todos los usuarios
router.get('/profs', userController.getAllProfs);  // Ruta para obtener todos los usuarios
router.post('/login', userController.login);  // Ruta para obtener todos los usuarios
module.exports = router;