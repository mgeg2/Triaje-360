const express = require('express');
const imagenesService = require('../services/ImagenesServices'); // Importar el servicio de imágenes
var jwt = require('../middlewares/validar-jwt');
// Obtener todas las imágenes
const getAllImagenes = async (req, res) => {
    jwt.comprobartoken(req, res, async function () {
        console.log(req.role);  
        if (req.role !== 'admin' && req.role !== 'profesor') {
            return res.status(403).json({ message: 'Acceso denegado' });
        }
        try {
            const imagenes = await imagenesService.getAllImagenes();
            res.status(200).json(imagenes);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }   
    });
};

const getOneImagen = async (req, res) => {
    jwt.comprobartoken(req, res, async function () {
        if (req.role !== 'admin' && req.role !== 'profesor') {
            return res.status(403).json({ message: 'Acceso denegado' });
        }
        try {
            const imagen = await imagenesService.getOneImagen(req.params.idImagen);
            res.status(200).json(imagen);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    });
};  
const postImagen = async (req, res) => {
    console.log(req.body);
    jwt.comprobartoken(req, res, async function () {
        console.log("hola");
        if (req.role !== 'admin' ) {
            return res.status(403).json({ message: 'Acceso denegado' });
        }
        try {
            // Pasar también los archivos subidos (req.files / req.file) al servicio
            const files = req.body.file || req.file || undefined;
            const imagen = await imagenesService.postImagen(req.body, files);
            res.status(201).json(imagen);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    });
};
const deleteImagen = async (req, res) => {
    jwt.comprobartoken(req, res, async function () {
        if (req.role !== 'admin' ) {
            return res.status(403).json({ message: 'Acceso denegado' });
        }   
        try {
            await imagenesService.deleteImagen(req.params.idImagen);
            res.status(200).json({ message: 'Imagen eliminada correctamente' });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    });
};
module.exports = {
    getAllImagenes,
    getOneImagen,
    postImagen,
    deleteImagen
};