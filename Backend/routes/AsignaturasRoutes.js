const express = require('express');
const asignaturasController = require('../controllers/AsignaturasController'); // Importar el controlador de asignaturas
const userController = require('../controllers/UserController'); // Importar el controlador de usuarios
const router = express.Router();
// Definir las rutas específicas de asignaturas
router.get('/', asignaturasController.getAllAsignaturas);  // Ruta para obtener todas las asignaturas
router.post('/', asignaturasController.postAsignatura);  // Ruta para crear una nueva asignatura

router.get('/alu/:idAsignatura', userController.getAlusfromAsignature);  // Ruta para obtener usuarios de una asignatura
router.get('/:idAsignatura/prof', asignaturasController.getAsignaturesFromProf);  // Ruta para obtener las asigaturas de un profesor
router.post('admin/:idAsignatura/:idUser', asignaturasController.postUsertoAsignature);  // Ruta para asignar un usuario a una asignatura


module.exports = router;