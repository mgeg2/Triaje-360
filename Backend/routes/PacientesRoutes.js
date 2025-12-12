const express = require('express');
const PacientesController = require('../controllers/PacientesController');
const router = express.Router();

router.get('/', PacientesController.getPacientes);
router.post('/', PacientesController.createPaciente);
router.put('/:id', PacientesController.updatePaciente);
router.delete('/:id', PacientesController.deletePaciente);
router.get('/accionesPaciente', PacientesController.getAccionesPaciente);

module.exports = router;
