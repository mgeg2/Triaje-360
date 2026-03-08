const db = require('../db');
const config = require('../config').config;

const getPacientes = async () => {
    return new Promise((resolve, reject) => {
        db.query('SELECT p.*, GROUP_CONCAT(a.nombre_accion SEPARATOR ", ") AS acciones, GROUP_CONCAT(ap.acciones_id) as acciones_ids, i.nombre_archivo FROM pacientes p LEFT JOIN acciones_paciente ap ON p.id = ap.paciente_id LEFT JOIN acciones a ON ap.acciones_id = a.id LEFT JOIN imagenes i ON p.imagen = i.id GROUP BY p.id', (err, results) => {
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
};

const createPaciente = async (body) => {
    const accionesPacientes = body.accionesPaciente;
    console.log(accionesPacientes);
    const idPaciente = Date.now().toString(30) + Math.random().toString(30).substring(2);
    console.log(body.tiempoEmpeoramiento);
    return new Promise(async (resolve, reject) => {
        db.query('INSERT INTO pacientes(id,nombre,descripcion,color,Tempeora, imagen) VALUES (?, ?, ?, ?, ?, ?)', [idPaciente, body.nombre, body.descripcion, body.color, body.tiempoEmpeoramiento, body.imagenSeleccionada], async (err, results) => {
            if (err) return reject(err);

            // Si el insert de paciente ha ido bien, verificar si accionesPacientes es un array
            if (Array.isArray(accionesPacientes)) {
                console.log("es un array");
                // Iterar sobre cada acción y añadirla a la tabla acciones_paciente
                for (let i = 0; i < accionesPacientes.length; i++) {
                    const accionId = accionesPacientes[i];

                    try {
                        // Insertar cada acción de manera secuencial
                        await new Promise((resolveAccion, rejectAccion) => {
                            db.query('INSERT INTO acciones_paciente (paciente_id, acciones_id) VALUES (?, ?)', [idPaciente, accionId], (errAccion, resultsAccion) => {
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

            resolve(results);
        });
    });
};

const updatePaciente = async (id, body) => {
    return new Promise((resolve, reject) => {
        db.query('UPDATE pacientes SET nombre = ?, descripcion = ?, color = ?, Tempeora = ?, imagen = ? WHERE id = ?', [body.nombre, body.descripcion, body.color, body.tiempoEmpeoramiento, body.imagenSeleccionada, id], (err, results) => {
            if (err) return reject(err);
            updatePacienteAcciones(id, body);
            resolve(results);
        });
    });
};

const updatePacienteAcciones = async (id, body) => {
    return new Promise((resolve, reject) => {
        // Paso 1: Obtener las acciones actuales del paciente
        db.query('SELECT acciones_id FROM acciones_paciente WHERE paciente_id = ?', [id], (err, results) => {
            if (err) return reject(err);

            const currentActions = results.map(row => row.acciones_id);
            const newActions = body.accionesPaciente; // Se asume que body.acciones es un array con los IDs de las nuevas acciones

            // Paso 2: Eliminar las acciones que ya no están en el body
            const actionsToDelete = currentActions.filter(action => !newActions.includes(action));
            if (actionsToDelete.length > 0) {
                const placeholders = actionsToDelete.map(() => '?').join(', ');
                db.query(`DELETE FROM acciones_paciente WHERE paciente_id = ? AND acciones_id IN (${placeholders})`, [id, ...actionsToDelete], (err, results) => {
                    if (err) return reject(err);
                });
            }

            // Paso 3: Insertar las nuevas acciones que no están en la base de datos
            const actionsToAdd = newActions.filter(action => !currentActions.includes(action));
            if (actionsToAdd.length > 0) {
                const values = actionsToAdd.map(action => [id, action]);
                db.query('INSERT INTO acciones_paciente (paciente_id, acciones_id) VALUES ?', [values], (err, results) => {
                    if (err) return reject(err);
                });
            }

            // Paso 4: Resolver la promesa
            resolve('Acciones actualizadas correctamente');
        });
    });
};
const deletePaciente = async (id) => {
    return new Promise((resolve, reject) => {
        db.query('DELETE FROM acciones_paciente WHERE paciente_id = ?', [id], (err, results) => {
            if (err) return reject(err);
            db.query('DELETE FROM pacientes WHERE id = ?', [id], (err, results) => {
                if (err) return reject(err);
                resolve(results);
            });
        });
    });
};
const getAccionesPaciente = async () => {
    return new Promise((resolve, reject) => {
        db.query('SELECT * FROM acciones', (err, results) => {
            if (err) return reject(err);
            resolve(results);
        });
    });
};

module.exports = {
    getPacientes,
    createPaciente,
    updatePaciente,
    deletePaciente,
    getAccionesPaciente
};