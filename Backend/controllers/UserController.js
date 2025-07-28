const express = require('express');
const userService = require('../services/UserServices'); // Importar el servicio de usuarios

// Obtener todos los usuarios
const login = async (req, res) => {
  try {
    const users = await userService.login();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
module.exports = {
  login};