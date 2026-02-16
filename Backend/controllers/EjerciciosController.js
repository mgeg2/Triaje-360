const express = require('express');
const EjerciciosService = require('../services/EjerciciosServices'); // Importar el servicio de usuarios
var jwt = require('../middlewares/validar-jwt');

const getAllEjercicios = async (req, res) => {
    jwt.comprobartoken(req, res, async function () {
        if (req.role !== 'admin' && req.role !== 'prof') {
            return res.status(403).json({ message: 'Acceso denegado' });
        }
        try {
            const ejercicios = await EjerciciosService.getAllEjercicios();
            res.status(200).json(ejercicios);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    });
};

const postEjercicio = async (req, res) => {
    jwt.comprobartoken(req, res, async function () {
        if (req.role !== 'admin' && req.role !== 'prof') {
            return res.status(403).json({ message: 'Acceso denegado' });
        }
        try {
            const ejercicio = await EjerciciosService.postEjercicio(req.body, req.params.phaseId);
            res.status(200).json(ejercicio);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    });
};

const deleteEjercicio = async (req, res) => {
    jwt.comprobartoken(req, res, async function () {
        if (req.role !== 'admin' && req.role !== 'prof') {
            return res.status(403).json({ message: 'Acceso denegado' });
        }
        try {
            const ejercicio = await EjerciciosService.deleteEjercicio(req.params.idEjercicio);
            res.status(200).json(ejercicio);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    });
};

const getOneEjercicios = async (req, res) => {
    jwt.comprobartoken(req, res, async function () {
        if (req.role !== 'admin' && req.role !== 'prof') {
            return res.status(403).json({ message: 'Acceso denegado' });
        }
        try {
            const ejercicio = await EjerciciosService.getOneEjercicios(req.params.id);
            res.status(200).json(ejercicio);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    });
};

const updateEjercicio = async (req, res) => {
    jwt.comprobartoken(req, res, async function () {
        if (req.role !== 'admin' && req.role !== 'prof') {
            return res.status(403).json({ message: 'Acceso denegado' });
        }
        try {
            const ejercicio = await EjerciciosService.updateEjercicio(req.params.idEjercicio, req.body);
            res.status(200).json(ejercicio);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    });
};

const getEjerciciosFromAsignatura = async (req, res) => {
    jwt.comprobartoken(req, res, async function () {
        if (req.role !== 'admin' && req.role !== 'prof' && req.role!=='alu') {
            return res.status(403).json({ message: 'Acceso denegado' });
        }
        try {
            console.log(req.params);
            console.log("ID Asignatura:", req.params.id);
            const ejercicios = await EjerciciosService.getEjerciciosFromAsignatura(req.params.idAsignatura);
            res.status(200).json(ejercicios);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    });
};

const getImagenes = async (req, res) => {
    jwt.comprobartoken(req, res, async function () {
        if (req.role !== 'admin' && req.role !== 'prof') {
            return res.status(403).json({ message: 'Acceso denegado' });
        }
        try {
            const imagenes = await EjerciciosService.getImagenes(req.params.tipo);
            res.status(200).json(imagenes);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    });
};
const postPacienteToEjercicio = async (req, res) => {
    jwt.comprobartoken(req, res, async function () {
        if ( req.role !== 'prof') {
            return res.status(403).json({ message: 'Acceso denegado' });
        }
        try {
            const result = await EjerciciosService.postPacienteToEjercicio(req.body);
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    });
};
const getPacientesEjercicio = async (req, res) => {
    jwt.comprobartoken(req, res, async function () {
        if ( req.role !== 'prof'&& req.role !== 'alu') {
            return res.status(403).json({ message: 'Acceso denegado' });
        }   
        try {
            const pacientes = await EjerciciosService.getPacientesEjercicio(req.params.idEjercicio);
            res.status(200).json(pacientes);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    });
};

const getImagenesFromEjercicio = async (req, res) => {
    jwt.comprobartoken(req, res, async function () {
        if (req.role !== 'prof' && req.role !== 'alu') {
            return res.status(403).json({ message: 'Acceso denegado' });
        }
        try {
            const imagenes = await EjerciciosService.getImagenesFromEjercicio(req.params.ejercicioId);
            res.status(200).json(imagenes);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    });
};

const locatePacienteInEjercicio = async (req, res) => {
    jwt.comprobartoken(req, res, async function () {
        if ( req.role !== 'prof') {
            return res.status(403).json({ message: 'Acceso denegado' });
        }
        try {
            const result = await EjerciciosService.locatePacienteInEjercicio(req.params.idEjercicio, req.body);
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    });
};

const removePacienteFromEjercicio = async (req, res) => {
    jwt.comprobartoken(req, res, async function () {
        if ( req.role !== 'prof') {
            return res.status(403).json({ message: 'Acceso denegado' });
        }
        try {
            const result = await EjerciciosService.removePacienteFromEjercicio(req.params.idEjercicio, req.params.idPaciente);
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    });
};

const getPacientesLocationInEjercicio = async (req, res) => {
    jwt.comprobartoken(req, res, async function () {
        if (req.role !== 'prof' && req.role !== 'alu') {
            return res.status(403).json({ message: 'Acceso denegado' });
        }
        try {
            const locations = await EjerciciosService.getPacientesLocationInEjercicio(req.params.idEjercicio);
            res.status(200).json(locations);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    });
};

const guardarTiempoEjercicio = async (req, res) => {
    jwt.comprobartoken(req, res, async function () {
        if (req.role !== 'alu') {
            return res.status(403).json({ message: 'Acceso denegado' });
        }
        try {
            const { tiempoTranscurrido } = req.body;
            const ejercicioId = req.params.ejercicioId;
            const usuarioId = req.id;
            
            const result = await EjerciciosService.guardarTiempoEjercicio(ejercicioId, usuarioId, tiempoTranscurrido);
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({ message: error.message || error });
        }
    });
};

const obtenerResultadosUsuario = async (req, res) => {
    jwt.comprobartoken(req, res, async function () {
        if (req.role !== 'alu') {
            return res.status(403).json({ message: 'Acceso denegado' });
        }
        try {
            const usuarioId = req.id;
            const resultados = await EjerciciosService.obtenerResultadosUsuario(usuarioId);
            res.status(200).json(resultados);
        } catch (error) {
            res.status(500).json({ message: error.message || error });
        }
    });
};

const obtenerDetallesResultado = async (req, res) => {
    jwt.comprobartoken(req, res, async function () {
        if (req.role !== 'alu') {
            return res.status(403).json({ message: 'Acceso denegado' });
        }
        try {
            const intentoId = req.params.intentoId;
            const detalles = await EjerciciosService.obtenerDetallesResultado(intentoId);
            res.status(200).json(detalles);
        } catch (error) {
            res.status(500).json({ message: error.message || error });
        }
    });
};

const guardarAccionesIntento = async (req, res) => {
    jwt.comprobartoken(req, res, async function () {
        if (req.role !== 'alu') {
            return res.status(403).json({ message: 'Acceso denegado' });
        }
        try {
            const intentoId = req.params.intentoId;
            const { pacientesAcciones } = req.body;
            
            const result = await EjerciciosService.guardarAccionesIntento(intentoId, pacientesAcciones);
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({ message: error.message || error });
        }
    });
};

module.exports = {
    getAllEjercicios,
    postEjercicio,
    deleteEjercicio,
    getOneEjercicios,
    updateEjercicio,
    getEjerciciosFromAsignatura,
    getImagenes,
    postPacienteToEjercicio,
    getPacientesEjercicio,
    getImagenesFromEjercicio,
    locatePacienteInEjercicio,
    removePacienteFromEjercicio,
    getPacientesLocationInEjercicio,
    guardarTiempoEjercicio,
    obtenerResultadosUsuario,
    obtenerDetallesResultado,
    guardarAccionesIntento
};
