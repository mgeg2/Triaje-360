const db = require('../db');
const config = require('../config').config;

const getAllEjercicios = async () => {
    return new Promise((resolve, reject) => {
        db.query('SELECT * FROM ejercicios', (err, results) => {
            if (err) return reject(err);
            resolve(results);
        });
    });
};
const getMaxOrden = (ejercicioId) => {
    return new Promise((resolve, reject) => {
        // Obtener el valor máximo de 'orden' para el ejercicio
        db.query('SELECT MAX(orden) as maxOrden FROM imagenes_ejercicio WHERE ejercicio = ?', [ejercicioId], (err, results) => {
            if (err) return reject(err);
            resolve(results[0].maxOrden || 0);  // Si no hay registros, devuelve 0
        });
    });
};
const postEjercicio = async (body, phaseId) => {
    return new Promise(async (resolve, reject) => {
        if (!body || !phaseId) {
            return reject({ status: 400, message: 'Body y phaseId son requeridos' });
        }
        console.log(phaseId);
        switch (phaseId) {
            case "1":
                const id = Date.now().toString(30) + Math.random().toString(30).substring(2);
                if (body.numerointentos) {
                    db.query('INSERT INTO ejercicios (id,nombre, descripcion, fechaInicio, fechaFin, numerointentos,asignatura) VALUES (?, ?, ?, ?, ?, ?,?) ', [id, body.nombre, body.descripcion, body.fechaInicio, body.fechaFin, body.numerointentos, body.asignatura], (err, results) => {
                        if (err) return reject(err);
                        resolve({ status: 200, message: "Ejercicio creado correctamente", results });
                    });
                }
                else {
                    db.query('INSERT INTO ejercicios (id, nombre, descripcion, fechaInicio, fechaFin, numerointentos,asignatura) VALUES (?, ?, ?, ?, ?, ?,?) ', [id, body.nombre, body.descripcion, body.fechaInicio, body.fechaFin, 0, body.asignatura], (err, results) => {
                        if (err) return reject(err);
                        resolve({
                            status: 200, message: "Ejercicio creado correctamente", ejercicio: {
                                id: id,
                                nombre: body.nombre,
                                descripcion: body.descripcion,
                                fechaInicio: body.fechaInicio,
                                fechaFin: body.fechaFin,
                                numerointentos: body.numerointentos,
                                asignatura: body.asignatura
                            }
                        });
                    });
                }

                break;
            case "2":
                console.log("es el caso 2");
                console.log(body.escenarios);

                var orden = 1;
                // Verificamos si body.escenarios es un array
                if (Array.isArray(body.escenarios)) {
                    console.log("es un array");
                    // Si es un array, recorremos cada imagen secuencialmente
                    for (let i = 0; i < body.escenarios.length; i++) {
                        const escenario = body.escenarios[i];
                        console.log("Insertando escenario:", escenario);

                        try {
                            // Realizamos la inserción de manera secuencial
                            await new Promise((resolve, reject) => {
                                db.query('INSERT INTO imagenes_ejercicio (imagen, ejercicio, orden) VALUES (?, ?, ?)', [escenario, body.ejercicio, orden], (err, results) => {
                                    if (err) {
                                        console.error("Error en la inserción:", err);
                                        return reject({ status: 500, error: err.message });
                                    }
                                    console.log("Orden:", orden);
                                    orden++;  // Incrementamos el orden para el siguiente escenario
                                    resolve(results);
                                });
                            });
                        } catch (err) {
                            // Si ocurre un error en alguna inserción, detenemos el proceso y lo informamos
                            console.error("Error al insertar escenario:", err);
                            return reject({ status: 500, message: err.message, error: err });
                        }
                    }

                    // Si todas las inserciones fueron exitosas
                    resolve({ status: 200, message: "Ejercicios creados correctamente" });
                } else {
                    console.log("no es un array");
                    // Si body.imagen no es un array, puedes hacer una sola inserción
                    console.log(body.imagen, body.ejercicio);  // Verifica los valores antes de la inserción
                    db.query('INSERT INTO imagenes_ejercicio (imagen, ejercicio) VALUES (?, ?)', [body.imagen, body.ejercicio], (err, results) => {
                        if (err) {
                            console.error("Error al crear el ejercicio:", err);
                            return reject({ status: 500, message: "Error al crear los ejercicios", error: err });
                        }
                        resolve({ status: 200, message: "Ejercicio creado correctamente", results });
                    });
                }

                break;
            default:
                return reject({ status: 400, message: 'PhaseId no valido' });
        }
    });
};




const getImagenes = async (tipo) => {
    return new Promise((resolve, reject) => {
        db.query('SELECT * FROM imagenes WHERE tipo = ?', [tipo], (err, results) => {
            if (err) return reject({ status: 500, message: "Error al obtener las imagenes", error: err });
            resolve(results);
        });
    });
}

const postPacienteToEjercicio = async (body) => {
    return new Promise((resolve, reject) => {
        console.log(body.imagenSeleccionada);
         const accionesPacientes = body.accionesPaciente;
        idPaciente = Date.now().toString(30) + Math.random().toString(30).substring(2);
        if (!body || !body.ejercicio  || !body.color || !body.accionesPaciente) {
            return reject({ status: 400, message: 'Body, ejercicio, paciente, color y accionesPaciente son requeridos' });
        }
         db.query('INSERT INTO pacientes_ejercicio(id,nombre,descripcion,color,Tempeora, imagen,ejercicio) VALUES (?, ?, ?, ?, ?, ?,?)', [idPaciente, body.nombre, body.descripcion, body.color, body.tiempoEmpeoramiento, body.imagenSeleccionada,body.ejercicio], async (err, results) => {
            if (err) return reject(err);
             if (Array.isArray(accionesPacientes)) {
                console.log("es un array");
                // Iterar sobre cada acción y añadirla a la tabla acciones_paciente
                for (let i = 0; i < accionesPacientes.length; i++) {
                    const accionId = accionesPacientes[i];

                    try {
                        // Insertar cada acción de manera secuencial
                        await new Promise((resolveAccion, rejectAccion) => {
                            db.query('INSERT INTO acciones_paciente_ejercicio (paciente_id, acciones_id,ejercicio_id) VALUES (?, ?,?)', [idPaciente, accionId,body.ejercicio], (errAccion, resultsAccion) => {
                                if (errAccion) {
                                    console.error("Error al insertar acción:", errAccion);
                                    return rejectAccion(errAccion);
                                }
                                resolveAccion(resultsAccion);
                            });
                        });
                    } catch (errAccion) {
                        // Si ocurre un error al insertar una acción, lo informamos
                        console.error("Error al insertar acción del paciente:", errAccion);
                        return reject({ status: 500, message: "Error al insertar acciones del paciente", error: errAccion });
                    }
                }
            }
            resolve({ status: 200, message: "Paciente añadido al ejercicio correctamente", results });

        }
        );
    });
}
const getPacientesEjercicio = async (idEjercicio) => {
    return new Promise((resolve, reject) => {
         db.query('SELECT p.*, GROUP_CONCAT(a.nombre_accion SEPARATOR ", ") AS acciones, GROUP_CONCAT(ap.acciones_id) as acciones_ids, i.nombre_imagen FROM Pacientes_ejercicio p LEFT JOIN Acciones_paciente_ejercicio ap ON p.id = ap.paciente_id LEFT JOIN Acciones a ON ap.acciones_id = a.id LEFT JOIN Imagenes i ON p.imagen = i.id WHERE p.ejercicio=? GROUP BY p.id',[idEjercicio], (err, results) => {
            if (err) return reject(err);

            // Process results to convert acciones_ids string to array
            const processedResults = results.map(paciente => {
                const accionesIds = paciente.acciones_ids ? paciente.acciones_ids.split(',').map(Number) : [];
                return {
                    ...paciente,
                    accionesPaciente: accionesIds
                };
            });

            resolve(processedResults);
        });
    });
}
module.exports = {
    getAllEjercicios,
    postEjercicio,
    getImagenes,
    postPacienteToEjercicio,
    getPacientesEjercicio
}