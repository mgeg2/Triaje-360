const fs = require('fs');
const path = require('path');
const db = require('../db');
const { routes } = require('../config');

const generateUniqueName = (originalName) => {
    const timestamp = Date.now().toString(30);
    const random = Math.random().toString(30).substring(2);
    const ext = path.extname(originalName);
    return `${timestamp}${random}${ext}`;
};

const uploadImage = async (file, imageType) => {
    return new Promise((resolve, reject) => {
        try {
            if (!file) {
                return reject({ status: 400, message: 'No se seleccionó ningún archivo' });
            }

            // Validar tipo de imagen
            if (!['paciente', 'escenario'].includes(imageType)) {
                return reject({ status: 400, message: 'Tipo de imagen inválido' });
            }

            // Crear carpetas en Frontend/src/assets si no existen
            const baseDir = path.join(routes.ASSETS);
            const typeDir = path.join(baseDir, `${imageType}s`);

            if (!fs.existsSync(baseDir)) {
                fs.mkdirSync(baseDir, { recursive: true });
            }
            if (!fs.existsSync(typeDir)) {
                fs.mkdirSync(typeDir, { recursive: true });
            }

            // Generar nombre único
            const timestamp = Date.now().toString(30);
            const random = Math.random().toString(30).substring(2);
            const ext = path.extname(file.originalname);
            const uniqueName = `${timestamp}${random}${ext}`;
            const uniqueNameWithoutExt = `${timestamp}${random}`;
            const filePath = path.join(typeDir, uniqueName);
            const fileContent = file.buffer;

            // Guardar archivo
            fs.writeFileSync(filePath, fileContent);

            // Guardar en BBDD
            const imagenId = Date.now().toString(30) + Math.random().toString(30).substring(2);
            const fechaSubida = new Date();

            db.query(
                'INSERT INTO imagenes (id, nombre_original, nombre_archivo, tipo, fecha_subida) VALUES (?, ?, ?, ?, ?)',
                [imagenId, file.originalname, uniqueName, imageType, fechaSubida],
                (err, results) => {
                    if (err) {
                        return reject({ status: 500, message: 'Error al guardar en la base de datos: ' + err.message });
                    }

                    resolve({
                        status: 200,
                        message: `Archivo '${file.originalname}' guardado correctamente`,
                        fileName: uniqueName,
                        originalName: file.originalname,
                        imageType: imageType,
                        path: routes.ASSETS + `/${imageType}s/${uniqueName}`,
                        fullPath: filePath,
                        id: imagenId
                    });
                }
            );
        } catch (error) {
            console.error('Error en uploadImage:', error);
            reject({ status: 500, message: error.message || 'Error al guardar el archivo' });
        }
    });
};

const listImages = async (imageType) => {
    return new Promise((resolve, reject) => {
        try {
            if (!['paciente', 'escenario'].includes(imageType)) {
                return reject({ status: 400, message: 'Tipo de imagen inválido' });
            }

            const typeDir = path.join(__dirname, '../../Frontend/src/assets', `${imageType}s`);

            if (!fs.existsSync(typeDir)) {
                return resolve({
                    status: 200,
                    type: imageType,
                    images: [],
                    count: 0
                });
            }

            const files = fs.readdirSync(typeDir);

            resolve({
                status: 200,
                type: imageType,
                images: files,
                count: files.length
            });
        } catch (error) {
            reject({ status: 500, message: error.message || 'Error al listar imágenes' });
        }
    });
};

const getImage = async (imageType, fileName) => {
    return new Promise((resolve, reject) => {
        try {
            if (!['paciente', 'escenario'].includes(imageType)) {
                return reject({ status: 400, message: 'Tipo de imagen inválido' });
            }

            const filePath = path.join(__dirname, '../../Frontend/src/assets', `${imageType}s`, fileName);

            if (!fs.existsSync(filePath)) {
                return reject({ status: 404, message: 'Archivo no encontrado' });
            }

            resolve({
                status: 200,
                filePath: filePath
            });
        } catch (error) {
            reject({ status: 500, message: error.message || 'Error al obtener la imagen' });
        }
    });
};

const getImagesByType = async (imageType) => {
    return new Promise((resolve, reject) => {
        try {
            if (!['paciente', 'escenario'].includes(imageType)) {
                return reject({ status: 400, message: 'Tipo de imagen inválido' });
            }

            db.query(
                'SELECT id, nombre_original, nombre_archivo, tipo, fecha_subida FROM imagenes WHERE tipo = ? ORDER BY fecha_subida DESC',
                [imageType],
                (err, results) => {
                    if (err) {
                        return reject({ status: 500, message: error.message || 'Error al obtener imágenes' });
                    }

                    resolve({
                        status: 200,
                        type: imageType,
                        images: results,
                        count: results.length
                    });
                }
            );
        } catch (error) {
            reject({ status: 500, message: error.message || 'Error al listar imágenes' });
        }
    });
};

const deleteImage = async (imageId) => {
    return new Promise((resolve, reject) => {
        try {
            // Obtener información de la imagen para borrar el archivo
            db.query(
                'SELECT nombre_archivo, tipo FROM imagenes WHERE id = ?',
                [imageId],
                (err, results) => {
                    if (err) {
                        return reject({ status: 500, message: 'Error al obtener imagen' });
                    }

                    if (!results || results.length === 0) {
                        return reject({ status: 404, message: 'Imagen no encontrada' });
                    }

                    const imageFile = results[0].nombre_archivo;
                    const imageType = results[0].tipo;
                    const imageDir = path.join(__dirname, '../../Frontend/src/assets', `${imageType}s`);

                    try {
                        if (imageType === 'paciente') {
                            // Para pacientes: eliminar archivo .png
                            const filePath = path.join(imageDir, `${imageFile}.png`);
                            if (fs.existsSync(filePath)) {
                                fs.unlinkSync(filePath);
                            }
                        } else if (imageType === 'escenario') {
                            // Para escenarios: eliminar imagen original y carpeta de tiles
                            
                            // Eliminar imagen original (puede ser .JPG o .jpg)
                            let originalFound = false;
                            const possibleExtensions = ['.JPG', '.jpg', '.jpeg', '.JPEG', '.png', '.PNG'];
                            
                            for (const ext of possibleExtensions) {
                                const filePath = path.join(imageDir, `${imageFile}${ext}`);
                                if (fs.existsSync(filePath)) {
                                    fs.unlinkSync(filePath);
                                    originalFound = true;
                                    break;
                                }
                            }

                            // Eliminar carpeta de tiles si existe
                            const tilesFolderPath = path.join(imageDir, 'Tiles', imageFile);
                            if (fs.existsSync(tilesFolderPath)) {
                                fs.rmSync(tilesFolderPath, { recursive: true, force: true });
                            }
                        }

                        // Eliminar de la base de datos
                        db.query(
                            'DELETE FROM imagenes WHERE id = ?',
                            [imageId],
                            (err) => {
                                if (err) {
                                    return reject({ status: 500, message: 'Error al eliminar la imagen' });
                                }

                                resolve({
                                    status: 200,
                                    message: 'Imagen y tiles eliminados correctamente'
                                });
                            }
                        );
                    } catch (fileError) {
                        reject({ status: 500, message: 'Error al eliminar archivos: ' + fileError.message });
                    }
                }
            );
        } catch (error) {
            reject({ status: 500, message: error.message || 'Error al eliminar imagen' });
        }
    });
};

const uploadCubemapTiles = async (originalFile, tileFiles) => {
    return new Promise((resolve, reject) => {
        try {
            if (!originalFile || !tileFiles || tileFiles.length !== 6) {
                return reject({ status: 400, message: 'Se requiere la imagen original y 6 tiles' });
            }

            // Crear carpetas en Frontend/src/assets si no existen
            const baseDir = path.join(routes.ASSETS);
            const escenariosDir = path.join(baseDir, 'escenarios');
            const tilesDir = path.join(escenariosDir, 'Tiles');

            if (!fs.existsSync(baseDir)) {
                fs.mkdirSync(baseDir, { recursive: true });
            }
            if (!fs.existsSync(escenariosDir)) {
                fs.mkdirSync(escenariosDir, { recursive: true });
            }
            if (!fs.existsSync(tilesDir)) {
                fs.mkdirSync(tilesDir, { recursive: true });
            }

            // Generar nombre único para la imagen original
            const timestamp = Date.now().toString(30);
            const random = Math.random().toString(30).substring(2);
            const ext = path.extname(originalFile.originalname);
            const uniqueName = `${timestamp}${random}${ext}`;
            const uniqueNameWithoutExt = `${timestamp}${random}`;
            
            // Guardar imagen original en escenarios/
            const originalPath = path.join(escenariosDir, uniqueName);
            fs.writeFileSync(originalPath, originalFile.buffer);

            // Crear carpeta para los tiles dentro de Tiles/
            const folderPath = path.join(tilesDir, uniqueNameWithoutExt);
            if (!fs.existsSync(folderPath)) {
                fs.mkdirSync(folderPath, { recursive: true });
            }

            // Guardar los 6 tiles usando el nombre que viene del cliente (l, r, u, d, b, f)
            let savedCount = 0;

            tileFiles.forEach((file) => {
                const tileFilePath = path.join(folderPath, file.originalname);
                fs.writeFileSync(tileFilePath, file.buffer);
                savedCount++;
            });

            if (savedCount !== 6) {
                return reject({ status: 500, message: 'Error al guardar los tiles' });
            }

            // Guardar en BBDD
            const imagenId = timestamp + Math.random().toString(30).substring(2);
            const fechaSubida = new Date();

            db.query(
                'INSERT INTO imagenes (id, nombre_original, nombre_archivo, tipo, fecha_subida) VALUES (?, ?, ?, ?, ?)',
                [imagenId, originalFile.originalname, uniqueName, 'escenario', fechaSubida],
                (err, results) => {
                    if (err) {
                        return reject({ status: 500, message: 'Error al guardar en la base de datos: ' + err.message });
                    }

                    resolve({
                        status: 200,
                        message: `Cubemap '${originalFile.originalname}' guardado correctamente`,
                        fileName: uniqueNameWithoutExt,
                        originalName: originalFile.originalname,
                        imageType: 'escenario',
                        path: routes.ASSETS + `/escenarios/${uniqueName}`,
                        id: imagenId
                    });
                }
            );
        } catch (error) {
            reject({ status: 500, message: error.message || 'Error al guardar el cubemap' });
        }
    });
};

module.exports = {
    uploadImage,
    listImages,
    getImage,
    getImagesByType,
    deleteImage,
    uploadCubemapTiles
};
