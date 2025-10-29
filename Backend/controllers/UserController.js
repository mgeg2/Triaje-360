const express = require('express');
const userService = require('../services/UserServices'); // Importar el servicio de usuarios
var jwt = require('../middlewares/validar-jwt');
// Obtener todos los usuarios
const login = async (req, res) => {
  try {
    const users = await userService.login(req.body);
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const iniUser0 = async () => {
  try {
    const result = await userService.iniUser0();
    return (result);
  } catch (error) {
    return ({ message: error.message });
  }
};

const getAllUsers = async (req, res) => {
  jwt.comprobartoken(req, res, async function(){
    console.log(req.role);
  if (req.role !== 'admin') {
    return res.status(403).json({ message: 'Acceso denegado' });
  }
  try {
    const users = await userService.getAllUsers();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
  });
};
const getUsersfromAsignature = async (req, res) => {
  jwt.comprobartoken(req, res,function(){
    if (req.role !== 'profesor' && req.role !== 'admin') {
      return res.status(403).json({ message: 'Acceso denegado' });
    } 
  });
    try {
      // Pasar el parámetro de consulta `role` si se proporciona: ?role=prof
      const role = req.query && req.query.role ? req.query.role : undefined;
      const users = await userService.getUsersfromAsignature(req.params.idAsignatura, role);
      res.status(200).json(users);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

const postUser = async (req, res) => {
   jwt.comprobartoken(req, res, async function(){
     if (req.role !== 'admin') {
    return res.status(403).json({ message: 'Acceso denegado' });
  }
  try {
   const user = await userService.postUser(req.body);
   res.status(201).json(user);
 } catch (error) {
   res.status(500).json({ message: error.message });
 }
  });
  };

const getAllAlus = async (req, res) => {
  jwt.comprobartoken(req, res, async function(){
    if (req.role !== 'admin' && req.role !== 'profesor') { 
    return res.status(403).json({ message: 'Acceso denegado' });
  }
  try {
    const users = await userService.getAllAlus();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  } 
  });
};
const getAllProfs = async (req, res) => {
  jwt.comprobartoken(req, res, async function(){
    if (req.role !== 'admin' && req.role !== 'profesor') {
    return res.status(403).json({ message: 'Acceso denegado' });
  }
  try {
    const users = await userService.getAllProfs();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
  });
};


module.exports = {
  login, iniUser0, getAllUsers, getUsersfromAsignature, postUser, getAllAlus, getAllProfs
};