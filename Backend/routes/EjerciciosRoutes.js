const express = require('express');
const EjerciciosController = require('../controllers/EjerciciosController');
const router = express.Router();

// Rutas específicas (van primero)
router.get('/', EjerciciosController.getAllEjercicios);
router.post('/phase/:phaseId', EjerciciosController.postEjercicio);
router.post('/paciente', EjerciciosController.postPacienteToEjercicio);
router.get('/asignaturas/:idAsignatura', EjerciciosController.getEjerciciosFromAsignatura);
router.get('/imagenes/:tipo', EjerciciosController.getImagenes);

// Rutas de resultados (antes de las dinámicas)
router.get('/resultados/usuario', EjerciciosController.obtenerResultadosUsuario);
router.get('/resultados/:intentoId', EjerciciosController.obtenerDetallesResultado);
router.post('/resultados/:intentoId/acciones', EjerciciosController.guardarAccionesIntento);

// Rutas de sonidos (antes de las dinámicas)
router.post('/sonidos', EjerciciosController.postSonidosToEjercicio);
router.get('/:ejercicioId/sonidos', EjerciciosController.getSonidosFromEjercicio);
router.delete('/:ejercicioId/sonido/:sonidoId', EjerciciosController.removeSonidoFromEjercicio);

// Rutas dinámicas con parámetros (van después)
router.get('/:idEjercicio', EjerciciosController.getOneEjercicios);
router.put('/:idEjercicio', EjerciciosController.updateEjercicio);
router.delete('/:idEjercicio', EjerciciosController.deleteEjercicio);
router.get('/:ejercicioId/imagenes', EjerciciosController.getImagenesFromEjercicio);
router.get('/:idEjercicio/pacientes', EjerciciosController.getPacientesEjercicio);
router.get('/:idEjercicio/pacientesLocations', EjerciciosController.getPacientesLocationInEjercicio);
router.post('/:ejercicioId/tiempo', EjerciciosController.guardarTiempoEjercicio);
router.post('/:idEjercicio/locatePaciente', EjerciciosController.locatePacienteInEjercicio);
router.delete('/:idEjercicio/paciente/:idPaciente', EjerciciosController.removePacienteFromEjercicio);

module.exports = router;