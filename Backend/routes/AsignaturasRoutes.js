const express = require('express');
const asignaturasController = require('../controllers/AsignaturasController'); // Importar el controlador de asignaturas
const userController = require('../controllers/UserController'); // Importar el controlador de usuarios
const router = express.Router();
// Definir las rutas específicas de asignaturas
router.get('/', asignaturasController.getAllAsignaturas);  // Ruta para obtener todas las asignaturas
router.get('/:idAsignatura/users', userController.getUsersfromAsignature);  // Ruta para obtener usuarios de una asignatura
router.post('/:idAsignatura/users/:idUser', asignaturasController.postUsertoAsignature);  // Ruta para asignar un usuario a una asignatura
router.post('/', asignaturasController.postAsignatura);  // Ruta para crear una nueva asignatura

module.exports = router;