const PacientesService = require('../services/PacientesServices'); // Importar el servicio de usuarios
var jwt = require('../middlewares/validar-jwt');

const getPacientes = async (req, res) => {
    try {
        const pacientes = await PacientesService.getPacientes();
        res.json(pacientes);
    } catch (error) {
        console.error('Error al obtener los pacientes:', error);
        res.status(500).json({ error: 'Error al obtener los pacientes' });
    }
};

const createPaciente = async (req, res) => {
    try {
        const paciente = await PacientesService.createPaciente(req.body);
        res.json(paciente);
    } catch (error) {
        console.error('Error al crear el paciente:', error);
        res.status(500).json({ error: 'Error al crear el paciente' });
    }
};

const updatePaciente = async (req, res) => {
    try {
        const paciente = await PacientesService.updatePaciente(req.params.id, req.body);
        res.json(paciente);
    } catch (error) {
        console.error('Error al actualizar el paciente:', error);
        res.status(500).json({ error: 'Error al actualizar el paciente' });
    }
};

const deletePaciente = async (req, res) => {
    try {
        const paciente = await PacientesService.deletePaciente(req.params.id);
        res.json(paciente);
    } catch (error) {
        console.error('Error al eliminar el paciente:', error);
        res.status(500).json({ error: 'Error al eliminar el paciente' });
    }
};

const getAccionesPaciente = async (req, res) => {
    try {
        const accionesPaciente = await PacientesService.getAccionesPaciente();
        res.json(accionesPaciente);
    } catch (error) {
        console.error('Error al obtener las acciones del paciente:', error);
        res.status(500).json({ error: 'Error al obtener las acciones del paciente' });
    }
};

module.exports = {
    getPacientes,
    createPaciente,
    updatePaciente,
    deletePaciente,
    getAccionesPaciente
};
