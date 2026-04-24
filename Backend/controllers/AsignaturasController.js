const express = require('express');
const asignaturasService = require('../services/AsignaturasServices'); // Importar el servicio de asignaturas
var jwt = require('../middlewares/validar-jwt');
// Obtener todas las asignaturas
const getAllAsignaturas = async (req, res) => {
    jwt.comprobartoken(req, res, async function () {
        console.log(req.role);
        if (req.role !== 'admin' && req.role !== 'profesor') {
            return res.status(403).json({ message: 'Acceso denegado' });
        }
        try {
            const asignaturas = await asignaturasService.getAllAsignaturas();
            res.status(200).json(asignaturas);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    });
};
const getOneAsignaturas = async (req, res) => {
    jwt.comprobartoken(req, res, async function () {
        if (req.role !== 'admin' && req.role !== 'profesor') {
            return res.status(403).json({ message: 'Acceso denegado' });
        }
        try {
            const asignatura = await asignaturasService.getOneAsignaturas(req.params.idAsignatura);
            res.status(200).json(asignatura);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    });
};
const postAsignatura = async (req, res) => {
    jwt.comprobartoken(req, res, async function () {
        if (req.role !== 'admin') {
            return res.status(403).json({ message: 'Acceso denegado' });
        }
        try {
            const asignatura = await asignaturasService.postAsignatura(req.body);
            res.status(201).json(asignatura);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    });
};

const deleteAsignatura = async (req, res) => {
    jwt.comprobartoken(req, res, async function () {
        if (req.role !== 'admin') {
            return res.status(403).json({ message: 'Acceso denegado' });
        }
        try {
            await asignaturasService.deleteAsignatura(req.params.idAsignatura);
            res.status(200).json({ message: 'Asignatura eliminada correctamente' });
        } catch (error) {
            const statusCode = error.status || 500;
            res.status(statusCode).json({ message: error.message });
        }
    });
};
const updateAsignatura = async (req, res) => {
    jwt.comprobartoken(req, res, async function () {
        if (req.role !== 'admin') {
            return res.status(403).json({ message: 'Acceso denegado' });
        }
        try {
            const asignatura = await asignaturasService.updateAsignatura(req.params.idAsignatura, req.body);
            res.status(200).json(asignatura);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    });
};
const postUsertoAsignature = async (req, res) => {
    jwt.comprobartoken(req, res, async function () {
        if (req.role !== 'admin') {
            return res.status(403).json({ message: 'Acceso denegado' });
        }
        try {
            const asignatura = await asignaturasService.postUsertoAsignature(req.params.idAsignatura, req.params.idUser);
            res.status(201).json(asignatura);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    });
};

const deleteUserfromAsignature = async (req, res) => {
    jwt.comprobartoken(req, res, async function () {
        if (req.role !== 'admin') {
            return res.status(403).json({ message: 'Acceso denegado' });
        }
        try {
            const asignatura = await asignaturasService.deleteUserfromAsignature(req.params.idAsignatura, req.params.idUser);
            res.status(200).json(asignatura);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    });
};

const getAsignaturesFromProf = async (req, res) => {
    jwt.comprobartoken(req, res, async function () {
        if (req.role !== 'admin' && req.role !== 'prof' && req.role!=='alu') {
            return res.status(403).json({ message: 'Acceso denegado' });
        }
        try {
            const asignaturas = await asignaturasService.getAsignaturesFromProf(req.params.idprof);
            console.log(asignaturas);
            res.status(200).json(asignaturas);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    });
};
module.exports = {
    getAllAsignaturas,
    getOneAsignaturas,
    postAsignatura,
    updateAsignatura,
    deleteAsignatura,
    postUsertoAsignature,
    deleteUserfromAsignature,
    getAsignaturesFromProf
};
