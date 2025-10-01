const express = require('express');
const userRoutes = require('./UserRoutes');
const asignatureRoutes = require('./AsignaturasRoutes');
const router = express.Router();

// Enlazar las rutas específicas bajo la ruta base '/api'
router.use('/users', userRoutes);    // Rutas para usuarios
router.use('/asignatures', asignatureRoutes); // Rutas para asignaturas
module.exports = router;