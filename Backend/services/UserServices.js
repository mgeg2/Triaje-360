const db = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../config').config;
const admin  = require('../config').admin;

const login = (body) => {
return new Promise((resolve, reject) => {
  const { email, password } = body;
  if (!email || !password) {
    return reject({ status: 400, message: 'Email y contraseña son requeridos' });
  }
  db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
    if (err) return reject(err);
    
    if (results.length == 0) {
      return reject({ status: 404, message: 'Usuario no encontrado' });
    }
    const user = results[0];
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) return reject(err);
      if (!isMatch) {
        return reject({ status: 401, message: 'Contraseña incorrecta' });
      }
      const token = jwt.sign({ id: user.id }, config.JWT_SECRET, { expiresIn: '1h' });
      resolve({ 
        message: 'Inicio de sesión exitoso',
        user: {
          email: user.email,
          nickname: user.nickname,  
          role: user.role
        }, 
        token });
    });
  });
})
}

const iniUser0 = () => {
  return new Promise((resolve, reject) => {
    db.query('SELECT COUNT (*) as numusuarios FROM users', (err, results) => {
      if (err) return reject(err);
      var numusuarios = results[0].numusuarios;
      if (numusuarios === undefined) {
        return reject({ status: 500, message: "Error al obtener el número de usuarios" });
      }
      console.log(numusuarios);

      if (numusuarios == 0) {
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
  iniUser0, login
};