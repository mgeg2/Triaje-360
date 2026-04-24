const db = require('../db');
const { get } = require('../routes/AsignaturasRoutes');

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

const getOneAsignaturas = (idAsignatura) => {
  return new Promise((resolve, reject) => {
    db.query('SELECT * FROM asignatura WHERE id = ?', [idAsignatura], (err, results) => {
      if (err) return reject(err);
      if (results.length === 0) {
        return reject({ status: 404, message: 'Asignatura no encontrada' });
      }
      resolve(results[0]);
    });
  });
};

const deleteAsignatura = (idAsignatura) => {
  return new Promise((resolve, reject) => {
    // First check if asignatura exists and has no users or exercises associated
    db.query('SELECT COUNT(*) as userCount FROM user_asignatura WHERE asignatura = ?', [idAsignatura], (err, userCountResults) => {
      if (err) return reject(err);
      
      const userCount = userCountResults[0].userCount;
      
      // Check for associated exercises
      db.query('SELECT COUNT(*) as exerciseCount FROM ejercicios WHERE asignatura = ?', [idAsignatura], (err, exerciseCountResults) => {
        if (err) return reject(err);
        
        const exerciseCount = exerciseCountResults[0].exerciseCount;
        
        // Build error message if there are dependencies
        let errorMessage = '';
        if (userCount > 0) {
          errorMessage += `${userCount} usuario(s) asociado(s)`;
        }
        if (exerciseCount > 0) {
          if (errorMessage) errorMessage += ' y ';
          errorMessage += `${exerciseCount} ejercicio(s) asociado(s)`;
        }
        
        if (errorMessage) {
          return reject({ status: 409, message: `No se puede eliminar la asignatura porque tiene ${errorMessage}. Debe remover estos elementos primero.` });
        }

        // If no users or exercises, proceed with deletion
        db.query('DELETE FROM asignatura WHERE id = ?', [idAsignatura], (err, results) => {
          if (err) return reject(err);
          if (results.affectedRows === 0) {
            return reject({ status: 404, message: 'Asignatura no encontrada' });
          }
          resolve({ message: 'Asignatura eliminada correctamente' });
        });
      });
    });
  });
};
const updateAsignatura = (idAsignatura, body) => {
  return new Promise((resolve, reject) => {
    const { nombre, codigo, curso } = body;
    db.query(
      'UPDATE asignatura SET nombre = ?, codigo = ?, curso = ? WHERE id = ?',
      [nombre, codigo, curso, idAsignatura], (err, results) => {
        if (err) return reject(err);
        if (results.affectedRows === 0) {
          return reject({ status: 404, message: 'Asignatura no encontrada' });
        }
        resolve({ message: 'Asignatura actualizada correctamente', asignatura: { id: idAsignatura, nombre, codigo, curso } });
      });
  });
};
// const postUsertoAsignature = (idAsignatura, idUser) => {
//   return new Promise((resolve, reject) => {
//     db.query('SELECT * FROM asignatura WHERE id = ?', [idAsignatura], (err, results) => {

//       if (err) return reject(err);
//       if (results.length === 0) {

//         return reject({ status: 404, message: 'Asignatura no encontrada' });
//       }
//       db.query('SELECT * FROM users WHERE id = ?', [idUser], (err, results) => {

//         if (err) return reject(err);
//         if (results.length != 1) {
//           return reject({ status: 404, message: 'Usuario no encontrado' });
//         }


//             console.log('etoy aqui');
//             db.query('INSERT INTO user_asignatura (usuario, asignatura) VALUES (?, ?)', [idUser, idAsignatura], (err) => {
//               if (err) return reject(err);
//               resolve({ message: `${results[0].role} asignado a la asignatura` });
//             });

//       });
//     });
//   })
// };

const postUsertoAsignature = (idAsignatura, idUser) => {
  return new Promise((resolve, reject) => {
    db.query('SELECT * FROM asignatura WHERE id = ?', [idAsignatura], (err, asignaturaResults) => {
      if (err) return reject(err);
      if (asignaturaResults.length === 0) {
        return reject({ status: 404, message: 'Asignatura no encontrada' });
      }

      db.query('SELECT * FROM users WHERE id = ?', [idUser], (err, userResults) => {
        if (err) return reject(err);
        if (userResults.length !== 1) {
          return reject({ status: 404, message: 'Usuario no encontrado' });
        }

        // Comprobar si la pareja usuario-asignatura ya existe
        db.query('SELECT * FROM user_asignatura WHERE usuario = ? AND asignatura = ?', [idUser, idAsignatura], (err, relationResults) => {
          if (err) return reject(err);
          if (relationResults.length > 0) {
            return reject({ status: 409, message: 'Usuario ya matriculado en la asignatura' });
          }

          // Insertar la relación si no existe
          db.query('INSERT INTO user_asignatura (usuario, asignatura) VALUES (?, ?)', [idUser, idAsignatura], (err) => {
            if (err) return reject(err);

            resolve({ message: `${userResults[0].role} asignado a la asignatura` });
          });
        });

      });
    });
  });
};

const deleteUserfromAsignature = (idAsignatura, idUser) => {
  var user = '';
  return new Promise((resolve, reject) => {
    db.query('SELECT * FROM asignatura WHERE id = ?', [idAsignatura], (err, results) => {

      if (err) return reject(err);
      if (results.length === 0) {

        return reject({ status: 404, message: 'Asignatura no encontrada' });
      }

      db.query('SELECT * FROM users WHERE id = ?', [idUser], (err, userResults) => {
        if (err) return reject(err);
        if (userResults.length != 1) {
          return reject({ status: 404, message: 'Usuario no encontrado' });
        }

        // Delete the user-asignatura relation using a WHERE clause (correct DELETE syntax)
        db.query('DELETE FROM user_asignatura WHERE usuario = ? AND asignatura = ?', [idUser, idAsignatura], (err, deleteResult) => {
          if (err) return reject(err);
          if (deleteResult.affectedRows === 0) {
            return reject({ status: 404, message: 'Usuario no asignado a la asignatura' });
          }
          console.log(userResults);
          resolve({ message: `${userResults[0].role} eliminado de la asignatura` });
        });

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

const getAsignaturesFromProf = (idUser) => {
  return new Promise((resolve, reject) => {

    db.query('SELECT * FROM asignatura a JOIN user_asignatura pa ON a.id = pa.asignatura WHERE pa.usuario = ?', [idUser], (err, results) => {
      console.log(results)
      if (err) return reject(err);
      resolve(results);
    });
  })
};

module.exports = {
  getAllAsignaturas,
  postAsignatura,
  deleteAsignatura,
  updateAsignatura,
  getOneAsignaturas,
  getAsignaturesFromProf,
  postUsertoAsignature,
  deleteUserfromAsignature
};