const express = require('express');
const asignaturasController = require('../controllers/AsignaturasController'); // Importar el controlador de asignaturas
const userController = require('../controllers/UserController'); // Importar el controlador de usuarios
const router = express.Router();
// Definir las rutas específicas de asignaturas
router.get('/', asignaturasController.getAllAsignaturas);  // Ruta para obtener todas las asignaturas
router.post('/', asignaturasController.postAsignatura);  // Ruta para crear una nueva asignatura
router.delete('/:idAsignatura', asignaturasController.deleteAsignatura);  // Ruta para eliminar una asignatura por ID
router.get('/:idAsignatura', asignaturasController.getOneAsignaturas);  // Ruta para obtener una asignatura por ID
router.put('/:idAsignatura', asignaturasController.updateAsignatura);  // Ruta para actualizar una asignatura por ID
router.get('/users/:idAsignatura', userController.getUsersfromAsignature);  // Ruta para obtener usuarios de una asignatura
router.get('/:idAsignatura/:idprof', asignaturasController.getAsignaturesFromProf);  // Ruta para obtener las asigaturas de un profesor
router.post('/:idAsignatura/:idUser', asignaturasController.postUsertoAsignature);  // Ruta para asignar un usuario a una asignatura
router.delete('/:idAsignatura/:idUser', asignaturasController.deleteUserfromAsignature);  // Ruta para eliminar un usuario de una asignatura

module.exports = router;