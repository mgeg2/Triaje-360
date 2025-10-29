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
      
      const token = jwt.sign({ id: user.id,email:user.email, nickname:user.nickname,role:user.role }, config.JWT_SECRET, { expiresIn: '1h' });
      resolve({ 
        message: 'Inicio de sesión exitoso',
        user: {
          email: user.email,
          nickname: user.nickname,  
          role: user.role,
          token,
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

const getAllUsers = () => {
  return new Promise((resolve, reject) => {
    db.query('SELECT id, email, nickname, role FROM users', (err, results) => {
      if (err) return reject(err);
      resolve({ 
        message: 'usuarios obtenidos',
        user:results
       });
    }
    );
  });
}

const getUsersfromAsignature = (idAsignatura, role) => {
  return new Promise((resolve, reject) => {
    // Construir la consulta de forma dinámica: si se proporciona `role`, filtrar por él.
    let sql = 'SELECT u.id, u.email, u.nickname FROM users u JOIN user_asignatura ua ON u.id = ua.usuario WHERE asignatura = ?';
    const params = [idAsignatura];
    if (role) {
      sql += ' AND u.role = ?';
      params.push(role);
    }

    db.query(sql, params, (err, results) => {
      if (err) return reject(err);
      resolve({
        message: 'usuarios obtenidos',
        user: results
      });
    });
  });
}

const postUser = (body) => {
  return new Promise((resolve, reject) => {
    const { email, nickname, password, role } = body;
    if (!email || !nickname || !password || !role) {
      return reject({ status: 400, message: 'Email, nickname, contraseña y rol son requeridos' });
    }
    const id = Date.now().toString(30) + Math.random().toString(30).substring(2);
    bcrypt.hash(password, config.SALT_ROUNDS, function (err, hash) {
      if (err) return reject({ status: 500, message: "Error al encriptar la contraseña" });
      db.query(
        'INSERT INTO users (id, email, nickname, password, role) VALUES (?, ?, ?, ?, ?)',
        [id, email, nickname, hash, role],
        (err) => {
          if (err) return reject(err);
          resolve({ message: 'Usuario creado',
            user: { id, email, nickname, role }
          });
        }
      );
    });
  });
}

const getAllAlus = () => {
  return new Promise((resolve, reject) => {
    db.query('SELECT id, email, nickname FROM users WHERE role = "alu"', (err, results) => {
      if (err) return reject(err);
      resolve({
        message: 'usuarios obtenidos',
        user: results
      });
    }
    );
  });
}

const getAllProfs = () => {
  return new Promise((resolve, reject) => {
    db.query('SELECT id, email, nickname FROM users WHERE role = "prof"', (err, results) => {
      if (err) return reject(err);
      resolve({
        message: 'usuarios obtenidos',
        user: results
      });
    }
    );
  });
}
module.exports = {
  iniUser0, login, getAllUsers, getUsersfromAsignature, postUser, getAllAlus,getAllProfs
};