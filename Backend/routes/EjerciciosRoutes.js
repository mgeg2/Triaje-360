const express = require('express');
const EjerciciosController = require('../controllers/EjerciciosController');
const router = express.Router();

// Rutas específicas (van primero)
router.get('/', EjerciciosController.getAllEjercicios);
router.post('/phase/:phaseId', EjerciciosController.postEjercicio);
router.post('/paciente', EjerciciosController.postPacienteToEjercicio);
router.get('/asignaturas/:idAsignatura', EjerciciosController.getEjerciciosFromAsignatura);
router.get('/imagenes/:tipo', EjerciciosController.getImagenes);

// Rutas dinámicas con parámetros (van después)
router.get('/:idEjercicio', EjerciciosController.getOneEjercicios);
router.put('/:idEjercicio', EjerciciosController.updateEjercicio);
router.delete('/:idEjercicio', EjerciciosController.deleteEjercicio);
router.get('/:ejercicioId/imagenes', EjerciciosController.getImagenesFromEjercicio);
router.get('/:idEjercicio/pacientes', EjerciciosController.getPacientesEjercicio);
router.get('/:idEjercicio/pacientesLocations', EjerciciosController.getPacientesLocationInEjercicio);
router.post('/:idEjercicio/locatePaciente', EjerciciosController.locatePacienteInEjercicio);
router.delete('/:idEjercicio/paciente/:idPaciente', EjerciciosController.removePacienteFromEjercicio);

module.exports = router;