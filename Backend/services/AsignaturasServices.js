const db = require('../db');

const config = require('../config').config;

const getAllAsignaturas = () => {
  return new Promise((resolve, reject) => {
    db.query('SELECT * FROM asignatura', (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};
const postAsignatura = (body) => {
  return new Promise((resolve, reject) => {
    const { nombre, codigo,curso } = body;
    if (!nombre || !codigo || !curso) {
      return reject({ status: 400, message: 'Nombre codigo y curso son requeridos' });
    }
    const id = Date.now().toString(30) + Math.random().toString(30).substring(2);
    db.query(
      'INSERT INTO asignatura (id, nombre, codigo, curso) VALUES (?, ?, ?,?)',
      [id, nombre, codigo,curso], (err) => {
        if (err) return reject(err);
        resolve({ message: 'Asignatura creada', asignatura: { id, nombre, codigo,curso } });
      });
  });
};
const postUsertoAsignature = (idAsignatura, idUser) => {
  return new Promise((resolve, reject) => {
    db.query('SELECT * FROM asignatura WHERE id = ?', [idAsignatura], (err, results) => {
      if (err) return reject(err);
      if (results.length === 0) {
        return reject({ status: 404, message: 'Asignatura no encontrada' });
      }
      db.query('SELECT * FROM users WHERE id = ?', [idUser], (err, results) => {
        if (err) return reject(err);
        if (results.length === 0) {
          return reject({ status: 404, message: 'Usuario no encontrado' });
        }
        db.query('INSERT INTO users_asignatura (alumno, asignatura) VALUES (?, ?)', [idUser, idAsignatura], (err) => {
          if (err) return reject(err);
          resolve({ message: 'Usuario asignado a la asignatura' });
        });
      }
      );
    });
  });
};

module.exports = {
  getAllAsignaturas,
  postAsignatura,
  postUsertoAsignature
};