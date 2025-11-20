const db = require('../db');


const config = require('../config').config;
const uploads = require('../controllers/uploads');

const getAllImagenes = () => {
    return new Promise((resolve, reject) => {
        db.query('SELECT * FROM imagenes', (err, results) => {
            if (err) return reject(err);
            resolve(results);
        });
    });
};

const getOneImagen = (idImagen) => {
    return new Promise((resolve, reject) => {
        db.query('SELECT * FROM imagenes WHERE id = ?', [idImagen], (err, results) => {
            if (err) return reject(err);
            if (!results || results.length === 0) return reject({ status: 404, message: 'Imagen no encontrada' });
            resolve(results[0]);
        });
    });
};
const postImagen = (body) => {
    return new Promise(async (resolve, reject) => {
        console.log(body);
        try {
            const { nombre, descripcion, tipo, archivo } = body;
            
            if (!nombre) return reject({ status: 400, message: 'Nombre son requeridos' });
            if (!archivo) return reject({ status: 400, message: 'El archivo es requerido' });

            // Crear id único para el archivo
            const id = Date.now().toString(30) + Math.random().toString(30).substring(2);

            // Intentar subir el archivo usando la función helper
            // Usamos el tipo 'imagenes' por defecto si no se proporciona uno
            const tipoCarpeta = tipo || 'imagenes';
            console.log(archivo);
            const uploadResult = await uploads.subirArchivo(archivo, id, tipoCarpeta);
            console.log(uploadResult);
            if (!uploadResult || !uploadResult.ok) {
                return reject({ status: 500, message: 'Error al subir archivo', detail: uploadResult });
            }

            const nombrearchivo = uploadResult.nombreArchivo;

            db.query(
                'INSERT INTO imagenes (id, nombre,descripcion,tipo) VALUES (?, ?, ?, ?)',
                [id, nombrearchivo, descripcion, tipoCarpeta], (err) => {
                    if (err) return reject(err);
                    resolve({ message: 'Imagen creada', imagen: { id, nombre: nombrearchivo, descripcion, tipo: tipoCarpeta } });
                });
        } catch (err) {
            console.error(err.message);
            return reject(err.message || err);
        }
    });
};
const deleteImagen = (idImagen) => {
    return new Promise((resolve, reject) => {
        db.query('DELETE FROM imagenes WHERE id = ?', [idImagen], (err, results) => {
            if (err) return reject(err);
            if (results.affectedRows === 0) {
                return reject({ status: 404, message: 'Imagen no encontrada' });
            }
            resolve( {message: 'Imagen eliminada correctamente' });
        });
    });
};
module.exports = {
    getAllImagenes,
    getOneImagen,
    postImagen,
    deleteImagen
};