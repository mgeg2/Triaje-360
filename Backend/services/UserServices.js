const db = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../config').config;
const admin  = require('../config').admin;

const login = () => {
  return new Promise((resolve, reject) => {
    db.query('SELECT * FROM users', (err, results) => {
      if (err) return reject(err);

      if (results.length == 0) {
        const id = Date.now().toString(30) + Math.random().toString(30).substring(2);
       

        bcrypt.hash(admin.password, config.SALT_ROUNDS, function (err, hash) {
          if (err) return reject({ status: 500, message: "Error al encriptar la contraseña" });

          db.query(
            'INSERT INTO users (id, email, nickname, password, role) VALUES (?, ?, ?, ?, ?)',
            [id, admin.email, admin.nickname, hash, admin.role],
            (err) => {
              if (err) return reject(err);
              console.log('Usuario admin creado');
              resolve({ message: 'Superusuario ha sido creado' }); // Devuelve un array vacío porque no hay usuarios previos
            }
          );
        });
      } else {
        resolve(results);
      }
    });
  });
};

module.exports = {
  login
};