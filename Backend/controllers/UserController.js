const express = require('express');
const userService = require('../services/UserServices'); // Importar el servicio de usuarios
var jwt= require('../middleware/validar-jwt')
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
    return( result );
  } catch (error) {
    return({ message: error.message });
  }
};

const getAllUsers = async (req, res) => {
  jwt.comprobartoken(req,res,next);
  if (req.rol !== 'admin') {
    return res.status(403).json({ message: 'Acceso denegado' });
  }else{
    try {
      const users = await userService.getAllUsers();
      res.status(200).json(users);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
};


module.exports = {
  login, iniUser0};