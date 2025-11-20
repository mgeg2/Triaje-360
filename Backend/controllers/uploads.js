const { response } = require('express');

const{routes}=require('../config');

const fs = require('fs');

    const subirArchivo = (file, id, tipo) => {
        return new Promise((resolve, reject) => {
            try {

                console.log(file,"holaa");
                // file can be either the file object itself or an object with property 'archivo' (req.files)
                const nombrePartido = (file.name || '').split('.');
                const extension = nombrePartido.length > 1 ? nombrePartido[nombrePartido.length - 1].toLowerCase() : '';

                const archivosValidos = {
                    imagenes: ['jpeg', 'jpg', 'png', 'gif', 'webp', 'svg'],
                    pacientes: ['jpeg', 'jpg', 'png'],
                    fondo: ['jpeg', 'jpg', 'png'],
                };

                const allowed = archivosValidos[tipo] || archivosValidos['imagenes'];
                if (extension && allowed && !allowed.includes(extension)) {
                    return reject({ status: 400, message: `El tipo de archivo '${extension}' no está permitido` });
                }

                const pathDir = `${routes.IMGS}/${tipo}`;
                if (!fs.existsSync(pathDir)) {
                    fs.mkdirSync(pathDir, { recursive: true });
                }

                const nombreArchivo = `${id}${extension ? '.' + extension : ''}`;
                const patharchivo = `${pathDir}/${nombreArchivo}`;

                // If the file object has mv (express-fileupload), use it. Otherwise write buffer.
                if (typeof file.mv === 'function') {
                    file.mv(patharchivo, (err) => {
                        if (err) return reject({ status: 500, message: 'No se pudo guardar el archivo', error: err });
                        return resolve({ ok: true, nombreArchivo });
                    });
                } else if (file.data) {
                    fs.writeFile(patharchivo, file.data, (err) => {
                        if (err) return reject({ status: 500, message: 'Error al escribir archivo', error: err });
                        return resolve({ ok: true, nombreArchivo });
                    });
                } else {
                    return reject({ status: 400, message: 'Formato de archivo no soportado' });
                }
            } catch (err) {
                console.log(err.message);
                return reject({ status: 500, message: 'Error en subirArchivo', error: err.message });
            }
        });
    };

module.exports = { subirArchivo }