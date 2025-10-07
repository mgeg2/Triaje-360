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
    const { nombre, codigo, curso } = body;
    if (!nombre || !codigo || !curso) {
      return reject({ status: 400, message: 'Nombre codigo y curso son requeridos' });
    }
    const id = Date.now().toString(30) + Math.random().toString(30).substring(2);
    db.query(
      'INSERT INTO asignatura (id, nombre, codigo, curso) VALUES (?, ?, ?,?)',
      [id, nombre, codigo, curso], (err) => {
        if (err) return reject(err);
        resolve({ message: 'Asignatura creada', asignatura: { id, nombre, codigo, curso } });
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
        if (results.length != 1) {
          return reject({ status: 404, message: 'Usuario no encontrado' });
        }

        switch (results[0].role) {
          case 'alumno':
            db.query('INSERT INTO alus_asignatura (alumno, asignatura) VALUES (?, ?)', [idUser, idAsignatura], (err) => {
              if (err) return reject(err);
              resolve({ message: 'alumno asignado a la asignatura' });
            });
            break;
          case 'profesor':
            db.query('INSERT INTO prof_asignatura (profesor, asignatura) VALUES (?, ?)', [idUser, idAsignatura], (err) => {
              if (err) return reject(err);
              resolve({ message: 'profesor asignado a la asignatura' });
            });
          default:
            return reject(" rol no válido");
            break;
        }
      });
    });
  })
};


/*const postAlutoAsignature = (idAsignatura, idUser) => {
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



        db.query('INSERT INTO alus_asignatura (alumno, asignatura) VALUES (?, ?)', [idUser, idAsignatura], (err) => {
          if (err) return reject(err);
          resolve({ message: 'alumno asignado a la asignatura' });
        });
      }
      );
    });
  });
};

const postProftoAsignature = (idAsignatura, idUser) => {
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
        db.query('INSERT INTO prof_asignatura (profesor, asignatura) VALUES (?, ?)', [idUser, idAsignatura], (err) => {
          if (err) return reject(err);
          resolve({ message: 'profesor asignado a la asignatura' });
        });
      }
      );
    });
  });
};*/

const getAsignaturesFromProf = (idAsignatura) => {
  return new Promise((resolve, reject) => {

    db.query('SELECT * FROM asignatura a JOIN prof_asignatura pa ON a.id = pa.asignatura WHERE pa.profesor = ?', [idAsignatura], (err, results) => {
      console.log(results)
      if (err) return reject(err);
      resolve(results);
    });
  })
};

module.exports = {
  getAllAsignaturas,
  postAsignatura,

  getAsignaturesFromProf,
  postUsertoAsignature
};