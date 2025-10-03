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
const postAlutoAsignature = async (req, res) => {
    jwt.comprobartoken(req, res, async function () {
        if (req.role !== 'admin') {
            return res.status(403).json({ message: 'Acceso denegado' });
        }
        try {
            const asignatura = await asignaturasService.postAlutoAsignature(req.params.idAsignatura, req.params.idUser);
            res.status(201).json(asignatura);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    });
};
const postProftoAsignature = async (req, res) => {
    jwt.comprobartoken(req, res, async function () {
        if (req.role !== 'admin') {
            return res.status(403).json({ message: 'Acceso denegado' });
        }
        try {
            const asignatura = await asignaturasService.postProftoAsignature(req.params.idAsignatura, req.params.idUser);
            res.status(201).json(asignatura);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    });
};
const getAsignaturesFromProf = async (req, res) => {
    jwt.comprobartoken(req, res, async function () {
        if (req.role !== 'admin' && req.role !== 'prof') {
            return res.status(403).json({ message: 'Acceso denegado' });
        }
        try {
            const asignaturas = await asignaturasService.getAsignaturesFromProf(req.params.idAsignatura);
            console.log(asignaturas);
            res.status(200).json(asignaturas);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    });
};
module.exports = {
    getAllAsignaturas,
    postAsignatura,
    postAlutoAsignature,
    postProftoAsignature,
    getAsignaturesFromProf
};
