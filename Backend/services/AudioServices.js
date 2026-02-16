const fs = require('fs');
const path = require('path');
const db = require('../db');

const uploadAudio = async (file) => {
    return new Promise((resolve, reject) => {
        try {
            if (!file) {
                return reject({ status: 400, message: 'No se seleccionó ningún archivo' });
            }

            // Crear carpeta en Frontend/src/assets si no existe
            const baseDir = path.join(__dirname, '../../Frontend/src/assets');
            const audioDir = path.join(baseDir, 'sonidos');

            if (!fs.existsSync(baseDir)) {
                fs.mkdirSync(baseDir, { recursive: true });
            }
            if (!fs.existsSync(audioDir)) {
                fs.mkdirSync(audioDir, { recursive: true });
            }

            // Generar nombre único
            const timestamp = Date.now().toString(30);
            const random = Math.random().toString(30).substring(2);
            const ext = path.extname(file.originalname);
            const uniqueName = `${timestamp}${random}${ext}`;
            const uniqueNameWithoutExt = `${timestamp}${random}`;
            const filePath = path.join(audioDir, uniqueName);
            const fileContent = file.buffer;

            // Guardar archivo
            fs.writeFileSync(filePath, fileContent);

            // Guardar en BBDD
            const audioId = timestamp + Math.random().toString(30).substring(2);
            const fechaSubida = new Date();

            db.query(
                'INSERT INTO sonidos (id, nombre_original, nombre_archivo, fecha_subida) VALUES (?, ?, ?, ?)',
                [audioId, file.originalname, uniqueNameWithoutExt, fechaSubida],
                (err, results) => {
                    if (err) {
                        return reject({ status: 500, message: 'Error al guardar en la base de datos: ' + err.message });
                    }

                    resolve({
                        status: 200,
                        message: `Archivo '${file.originalname}' guardado correctamente`,
                        fileName: uniqueName,
                        originalName: file.originalname,
                        path: `/assets/sonidos/${uniqueName}`,
                        fullPath: filePath,
                        id: audioId
                    });
                }
            );
        } catch (error) {
            reject({ status: 500, message: error.message || 'Error al guardar el archivo' });
        }
    });
};

const listAudios = async () => {
    return new Promise((resolve, reject) => {
        try {
            const audioDir = path.join(__dirname, '../../Frontend/src/assets', 'sonidos');

            if (!fs.existsSync(audioDir)) {
                return resolve({
                    status: 200,
                    audios: [],
                    count: 0
                });
            }

            const files = fs.readdirSync(audioDir);

            resolve({
                status: 200,
                audios: files,
                count: files.length
            });
        } catch (error) {
            reject({ status: 500, message: error.message || 'Error al listar audios' });
        }
    });
};

const getAudio = async (fileName) => {
    return new Promise((resolve, reject) => {
        try {
            const filePath = path.join(__dirname, '../../Frontend/src/assets', 'sonidos', fileName);

            if (!fs.existsSync(filePath)) {
                return reject({ status: 404, message: 'Archivo no encontrado' });
            }

            resolve({
                status: 200,
                filePath: filePath
            });
        } catch (error) {
            reject({ status: 500, message: error.message || 'Error al obtener el audio' });
        }
    });
};

const getAllAudios = async () => {
    return new Promise((resolve, reject) => {
        try {
            db.query(
                'SELECT id, nombre_original, nombre_archivo, fecha_subida FROM sonidos ORDER BY fecha_subida DESC',
                [],
                (err, results) => {
                    if (err) {
                        return reject({ status: 500, message: 'Error al obtener audios' });
                    }

                    resolve({
                        status: 200,
                        audios: results,
                        count: results.length
                    });
                }
            );
        } catch (error) {
            reject({ status: 500, message: error.message || 'Error al obtener audios' });
        }
    });
};

const deleteAudio = async (audioId) => {
    return new Promise((resolve, reject) => {
        try {
            // Obtener información del audio para borrar el archivo
            db.query(
                'SELECT nombre_archivo FROM sonidos WHERE id = ?',
                [audioId],
                (err, results) => {
                    if (err) {
                        return reject({ status: 500, message: 'Error al obtener audio' });
                    }

                    if (!results || results.length === 0) {
                        return reject({ status: 404, message: 'Audio no encontrado' });
                    }

                    const audioFile = results[0].nombre_archivo;
                    const audioDir = path.join(__dirname, '../../Frontend/src/assets', 'sonidos');
                    const filePath = path.join(audioDir, audioFile);

                    // Eliminar del sistema de archivos
                    if (fs.existsSync(filePath)) {
                        fs.unlinkSync(filePath);
                    }

                    // Eliminar de la base de datos
                    db.query(
                        'DELETE FROM sonidos WHERE id = ?',
                        [audioId],
                        (err) => {
                            if (err) {
                                return reject({ status: 500, message: 'Error al eliminar el audio' });
                            }

                            resolve({
                                status: 200,
                                message: 'Audio eliminado correctamente'
                            });
                        }
                    );
                }
            );
        } catch (error) {
            reject({ status: 500, message: error.message || 'Error al eliminar audio' });
        }
    });
};

module.exports = {
    uploadAudio,
    listAudios,
    getAudio,
    getAllAudios,
    deleteAudio
};
