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

                // Eliminar escenarios existentes si es edición
                try {
                    await new Promise((resolve, reject) => {
                        db.query('DELETE FROM imagenes_ejercicio WHERE ejercicio = ?', [body.ejercicio], (err, results) => {
                            if (err) return reject(err);
                            resolve(results);
                        });
                    });
                } catch (err) {
                    console.error("Error al eliminar escenarios antiguos:", err);
                }

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
        let idPaciente = (Date.now().toString(30) + Math.random().toString(30).substring(2));
        if (!body || !body.ejercicio  || !body.color || !body.accionesPaciente) {
            return reject({ status: 400, message: 'Body, ejercicio, paciente, color y accionesPaciente son requeridos' });
        }
        
        if(body.id){
            console.log(body.id)
            // Si existe ID, verificar si el paciente-ejercicio existe
            db.query('SELECT * FROM pacientes_ejercicio WHERE id = ? AND ejercicio = ?', [body.id, body.ejercicio], async (errCheck, resultsCheck) => {
                console.log(resultsCheck);
                if (errCheck) return reject(errCheck);
                
                if (resultsCheck.length > 0) {
                    console.log("tiene id");
                    // Si existe, actualizar
                    db.query('UPDATE pacientes_ejercicio SET nombre = ?, descripcion = ?, color = ?, Tempeora = ?, imagen = ? WHERE id = ? AND ejercicio = ?', 
                        [body.nombre, body.descripcion, body.color, body.tiempoEmpeoramiento, body.imagenSeleccionada, body.id, body.ejercicio], 
                        async (errUpdate, resultsUpdate) => {
                            if (errUpdate) return reject(errUpdate);
                            
                            // Actualizar acciones
                            if (Array.isArray(accionesPacientes)) {
                                // Primero eliminar acciones anteriores
                                db.query('DELETE FROM acciones_paciente_ejercicio WHERE paciente_id = ? AND ejercicio_id = ?', [body.id, body.ejercicio], async (errDelete, resultsDelete) => {
                                    if (errDelete) return reject(errDelete);
                                    
                                    // Insertar nuevas acciones
                                    for (let i = 0; i < accionesPacientes.length; i++) {
                                        const accionId = accionesPacientes[i];
                                        try {
                                            await new Promise((resolveAccion, rejectAccion) => {
                                                db.query('INSERT INTO acciones_paciente_ejercicio (paciente_id, acciones_id, ejercicio_id) VALUES (?, ?, ?)', 
                                                    [body.id, accionId, body.ejercicio], (errAccion, resultsAccion) => {
                                                        if (errAccion) return rejectAccion(errAccion);
                                                        resolveAccion(resultsAccion);
                                                    });
                                            });
                                        } catch (errAccion) {
                                            console.error("Error al insertar acción:", errAccion);
                                            return reject({ status: 500, message: "Error al insertar acciones del paciente", error: err.message });
                                        }
                                    }
                                    resolve({ status: 200, message: "Paciente actualizado correctamente", results: resultsUpdate });
                                });
                            } else {
                                resolve({ status: 200, message: "Paciente actualizado correctamente", results: resultsUpdate });
                            }
                        }
                    );
                } else {
                    // Si no existe, insertar
                    db.query('INSERT INTO pacientes_ejercicio(id,nombre,descripcion,color,Tempeora, imagen,ejercicio) VALUES (?, ?, ?, ?, ?, ?,?)', 
                        [idPaciente, body.nombre, body.descripcion, body.color, body.tiempoEmpeoramiento, body.imagenSeleccionada, body.ejercicio], 
                        async (err, results) => {
                            if (err) return reject(err);
                            if (Array.isArray(accionesPacientes)) {
                                for (let i = 0; i < accionesPacientes.length; i++) {
                                    const accionId = accionesPacientes[i];
                                    try {
                                        await new Promise((resolveAccion, rejectAccion) => {
                                            db.query('INSERT INTO acciones_paciente_ejercicio (paciente_id, acciones_id, ejercicio_id) VALUES (?, ?, ?)', 
                                                [idPaciente, accionId, body.ejercicio], (errAccion, resultsAccion) => {
                                                    if (errAccion) return rejectAccion(errAccion);
                                                    resolveAccion(resultsAccion);
                                                });
                                        });
                                    } catch (errAccion) {
                                        console.error("Error al insertar acción:", errAccion);
                                        return reject({ status: 500, message: "Error al insertar acciones del paciente", error: errAccion });
                                    }
                                }
                            }
                            resolve({ status: 200, message: "Paciente añadido al ejercicio correctamente", results });
                        }
                    );
                }
            });
        } else {
            // Si no existe ID, crear nuevo
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
        }
    });
}
const getPacientesEjercicio = async (idEjercicio) => {
    return new Promise((resolve, reject) => {
         db.query('SELECT p.*, GROUP_CONCAT(a.nombre_accion SEPARATOR ", ") AS acciones, GROUP_CONCAT(ap.acciones_id) as acciones_ids, i.nombre_archivo, upe.fila, upe.columna, upe.imagen as ubicacion_imagen FROM Pacientes_ejercicio p LEFT JOIN Acciones_paciente_ejercicio ap ON p.id = ap.paciente_id LEFT JOIN Acciones a ON ap.acciones_id = a.id LEFT JOIN Imagenes i ON p.imagen = i.id LEFT JOIN ubicacion_pacientes_ejercicio upe ON p.id = upe.paciente AND p.ejercicio = upe.ejercicio WHERE p.ejercicio=? GROUP BY p.id',[idEjercicio], (err, results) => {
            if (err) return reject(err);

            // Process results to convert acciones_ids string to array
            const processedResults = results.map(paciente => {
                const accionesIds = paciente.acciones_ids ? paciente.acciones_ids.split(',').map(Number) : [];
                return {
                    ...paciente,
                    accionesPaciente: accionesIds,
                    posicion: paciente.fila !== null ? { fila: paciente.fila, columna: paciente.columna, imagen: paciente.ubicacion_imagen } : null
                };
            });

            resolve(processedResults);
        });
    });
}
const getImagenesFromEjercicio = async (ejercicioId) => {
    return new Promise((resolve, reject) => {
        db.query('SELECT ie.*, i.nombre_archivo FROM imagenes_ejercicio ie JOIN imagenes i ON ie.imagen = i.id WHERE ie.ejercicio = ? ORDER BY ie.orden ASC', [ejercicioId], (err, results) => {
            if (err) return reject({ status: 500, message: "Error al obtener las imagenes del ejercicio", error: err });
            resolve(results);
        });
    });
}


const locatePacienteInEjercicio = async (idEjercicio, body) => {
    console.log(body);
    return new Promise((resolve, reject) => {
        if (!body || !body.pacienteId || body.fila === undefined || body.columna === undefined) {
            return reject({ status: 400, message: 'Body, pacienteId, nuevaPosicionX y nuevaPosicionY son requeridos' });
        }
        db.query('INSERT INTO ubicacion_pacientes_ejercicio (paciente, ejercicio,imagen, fila, columna) VALUES (?, ?,?, ?, ?) ON DUPLICATE KEY UPDATE fila = ?, columna = ?',
            [body.pacienteId, idEjercicio,body.imagenId, body.fila, body.columna, body.fila, body.columna], (err, results) => {
                if (err) return reject(err);
                resolve({ status: 200, message: "Ubicación del paciente actualizada correctamente", results });
            });
    });
};

    const getEjerciciosFromAsignatura = async (idAsignatura) => {
        console.log(idAsignatura);
        return new Promise((resolve, reject) => {
            db.query('SELECT * FROM ejercicios WHERE asignatura = ?', [idAsignatura], (err, results) => {
                console.log(results);
                if (err) return reject(err);
                resolve(results);
            });
        });
}

const updateEjercicio = async (ejercicioId, body) => {
    return new Promise((resolve, reject) => {
        if (!ejercicioId || !body) {
            return reject({ status: 400, message: 'ID del ejercicio y datos son requeridos' });
        }
        
        db.query('UPDATE ejercicios SET nombre = ?, descripcion = ?, fechaInicio = ?, fechaFin = ?, numerointentos = ? WHERE id = ?', 
            [body.nombre, body.descripcion, body.fechaInicio, body.fechaFin, body.numeroIntentos || 0, ejercicioId], 
            (err, results) => {
                if (err) return reject(err);
                resolve({ status: 200, message: "Ejercicio actualizado correctamente", results });
            });
    });
};

const removePacienteFromEjercicio = async (idEjercicio, idPaciente) => {
    return new Promise(async (resolve, reject) => {
        if (!idEjercicio || !idPaciente) {
            return reject({ status: 400, message: 'El ID del ejercicio y del paciente son requeridos' });
        }

        try {
            // Deshabilitar restricciones de clave foránea temporalmente
            await new Promise((resolveDisable, rejectDisable) => {
                db.query('SET FOREIGN_KEY_CHECKS=0', (errDisable) => {
                    if (errDisable) return rejectDisable(errDisable);
                    resolveDisable();
                });
            });

            try {
                // 1. Eliminar las acciones del paciente en el ejercicio
                await new Promise((resolveAcciones, rejectAcciones) => {
                    db.query('DELETE FROM acciones_paciente_ejercicio WHERE paciente_id = ? AND ejercicio_id = ?', [idPaciente, idEjercicio], (errAcciones) => {
                        if (errAcciones) return rejectAcciones(errAcciones);
                        resolveAcciones();
                    });
                });

                // 2. Eliminar la ubicación del paciente en el ejercicio
                await new Promise((resolveUbicacion, rejectUbicacion) => {
                    db.query('DELETE FROM ubicacion_pacientes_ejercicio WHERE paciente = ? AND ejercicio = ?', [idPaciente, idEjercicio], (errUbicacion) => {
                        if (errUbicacion) return rejectUbicacion(errUbicacion);
                        resolveUbicacion();
                    });
                });

                // 3. Eliminar el paciente del ejercicio
                await new Promise((resolvePaciente, rejectPaciente) => {
                    db.query('DELETE FROM pacientes_ejercicio WHERE id = ? AND ejercicio = ?', [idPaciente, idEjercicio], (errPaciente) => {
                        if (errPaciente) return rejectPaciente(errPaciente);
                        resolvePaciente();
                    });
                });

                // Habilitar restricciones de clave foránea nuevamente
                await new Promise((resolveEnable, rejectEnable) => {
                    db.query('SET FOREIGN_KEY_CHECKS=1', (errEnable) => {
                        if (errEnable) return rejectEnable(errEnable);
                        resolveEnable();
                    });
                });

                resolve({ status: 200, message: "Paciente eliminado del ejercicio correctamente" });
            } catch (errorTransaction) {
                // Volver a habilitar restricciones en caso de error
                await new Promise((resolveEnable, rejectEnable) => {
                    db.query('SET FOREIGN_KEY_CHECKS=1', (errEnable) => {
                        if (errEnable) rejectEnable(errEnable);
                        else resolveEnable();
                    });
                });
                return reject(errorTransaction);
            }
        } catch (err) {
            console.error("Error al eliminar paciente del ejercicio:", err);
            return reject({ status: 500, message: "Error al eliminar paciente del ejercicio", error: err.message });
        }
    });
};

const deleteEjercicio = async (ejercicioId) => {
    return new Promise(async (resolve, reject) => {
        if (!ejercicioId) {
            return reject({ status: 400, message: 'El ID del ejercicio es requerido' });
        }

        try {
            // Deshabilitar restricciones de clave foránea temporalmente
            await new Promise((resolveDisable, rejectDisable) => {
                db.query('SET FOREIGN_KEY_CHECKS=0', (errDisable) => {
                    if (errDisable) return rejectDisable(errDisable);
                    resolveDisable();
                });
            });

            try {
                // 1. Eliminar las acciones de los pacientes del ejercicio
                await new Promise((resolveAcciones, rejectAcciones) => {
                    db.query('DELETE FROM acciones_paciente_ejercicio WHERE ejercicio_id = ?', [ejercicioId], (errAcciones) => {
                        if (errAcciones) return rejectAcciones(errAcciones);
                        resolveAcciones();
                    });
                });

                // 2. Eliminar las ubicaciones de los pacientes en el ejercicio
                await new Promise((resolveUbicacion, rejectUbicacion) => {
                    db.query('DELETE FROM ubicacion_pacientes_ejercicio WHERE ejercicio = ?', [ejercicioId], (errUbicacion) => {
                        if (errUbicacion) return rejectUbicacion(errUbicacion);
                        resolveUbicacion();
                    });
                });

                // 3. Eliminar los pacientes del ejercicio
                await new Promise((resolvePacientes, rejectPacientes) => {
                    db.query('DELETE FROM pacientes_ejercicio WHERE ejercicio = ?', [ejercicioId], (errPacientes) => {
                        if (errPacientes) return rejectPacientes(errPacientes);
                        resolvePacientes();
                    });
                });

                // 4. Eliminar las imágenes del ejercicio
                await new Promise((resolveImagenes, rejectImagenes) => {
                    db.query('DELETE FROM imagenes_ejercicio WHERE ejercicio = ?', [ejercicioId], (errImagenes) => {
                        if (errImagenes) return rejectImagenes(errImagenes);
                        resolveImagenes();
                    });
                });

                // 5. Finalmente, eliminar el ejercicio
                await new Promise((resolveEjercicio, rejectEjercicio) => {
                    db.query('DELETE FROM ejercicios WHERE id = ?', [ejercicioId], (errEjercicio) => {
                        if (errEjercicio) return rejectEjercicio(errEjercicio);
                        resolveEjercicio();
                    });
                });

                // Habilitar restricciones de clave foránea
                await new Promise((resolveEnable, rejectEnable) => {
                    db.query('SET FOREIGN_KEY_CHECKS=1', (errEnable) => {
                        if (errEnable) return rejectEnable(errEnable);
                        resolveEnable();
                    });
                });

                resolve({ status: 200, message: 'Ejercicio eliminado correctamente junto con todos sus datos relacionados' });
            } catch (error) {
                // Habilitar restricciones incluso si hay error
                await new Promise((resolveEnable) => {
                    db.query('SET FOREIGN_KEY_CHECKS=1', () => {
                        resolveEnable();
                    });
                });
                throw error;
            }
        } catch (error) {
            console.log(error);
            reject({ status: 500, message: 'Error al eliminar el ejercicio', error: error });
        }
    });
};

const getPacientesLocationInEjercicio = async (idEjercicio) => {
    return new Promise((resolve, reject) => {
        if (!idEjercicio) {
            return reject({ status: 400, message: 'El ID del ejercicio es requerido' });
        }

        try {
            const query = `
                SELECT upe.paciente, upe.ejercicio, upe.imagen, upe.fila, upe.columna
                FROM ubicacion_pacientes_ejercicio upe
                WHERE upe.ejercicio = ?
            `;
            console.log('SQL Query:', query, 'Params:', [idEjercicio]);
            
            db.query(query, [idEjercicio], (err, result) => {
                if (err) {
                    console.error('Error en getPacientesLocationInEjercicio:', err);
                    return reject({ status: 500,error: err });
                }
                console.log('Resultado de getPacientesLocationInEjercicio:', JSON.stringify(result, null, 2));
                resolve(result);
            });
        } catch (error) {
            console.log(error);
            reject({ status: 500,error: error });
        }
    });
};

const guardarTiempoEjercicio = async (ejercicioId, usuarioId, tiempoTranscurrido) => {
    return new Promise((resolve, reject) => {
        if (!ejercicioId || !usuarioId || tiempoTranscurrido === undefined) {
            return reject({ status: 400, message: 'ejercicioId, usuarioId y tiempoTranscurrido son requeridos' });
        }

        try {
            const id = Date.now().toString(30) + Math.random().toString(30).substring(2);
            const ahora = new Date();
            const fechaInicio = new Date(ahora.getTime() - tiempoTranscurrido * 1000);

            // Primero, contar los intentos existentes
            db.query(
                'SELECT COUNT(*) as numero_intento FROM intentos_ejercicio WHERE usuario_id = ? AND ejercicio_id = ?',
                [usuarioId, ejercicioId],
                (errCount, resultsCount) => {
                    if (errCount) {
                        console.error('Error al contar intentos:', errCount);
                        return reject({ status: 500, error: errCount });
                    }

                    const numeroIntento = (resultsCount[0]?.numero_intento || 0) + 1;

                    // Ahora insertar con el número de intento calculado
                    db.query(
                        'INSERT INTO intentos_ejercicio (id, usuario_id, ejercicio_id, tiempo_realizado, fecha_inicio, fecha_finalizacion, numero_intento) VALUES (?, ?, ?, ?, ?, ?, ?)',
                        [id, usuarioId, ejercicioId, tiempoTranscurrido, fechaInicio, ahora, numeroIntento],
                        (err, results) => {
                            if (err) {
                                console.error('Error en guardarTiempoEjercicio:', err);
                                return reject({ status: 500, error: err });
                            }
                            resolve({ status: 200, message: 'Tiempo del ejercicio guardado correctamente', intento_id: id });
                        }
                    );
                }
            );
        } catch (error) {
            console.error('Error en guardarTiempoEjercicio:', error);
            reject({ status: 500, error: error });
        }
    });
};

const obtenerResultadosUsuario = async (usuarioId) => {
    return new Promise((resolve, reject) => {
        if (!usuarioId) {
            return reject({ status: 400, message: 'usuarioId es requerido' });
        }

        try {
            const query = `
                SELECT 
                    ie.id,
                    ie.usuario_id,
                    ie.ejercicio_id,
                    ie.tiempo_realizado,
                    ie.fecha_inicio,
                    ie.fecha_finalizacion,
                    ie.numero_intento,
                    ie.created_at,
                    e.nombre as ejercicio_nombre,
                    e.descripcion as ejercicio_descripcion,
                    a.nombre as asignatura_nombre,
                    COUNT(ai.id) as total_acciones
                FROM intentos_ejercicio ie
                LEFT JOIN ejercicios e ON ie.ejercicio_id = e.id
                LEFT JOIN asignatura a ON e.asignatura = a.id
                LEFT JOIN acciones_intento ai ON ie.id = ai.intento_id
                WHERE ie.usuario_id = ?
                GROUP BY ie.id
                ORDER BY ie.created_at DESC
            `;

            db.query(query, [usuarioId], (err, results) => {
                if (err) return reject({ status: 500, message: 'Error al obtener los resultados', error: err });
                resolve(results);
            });
        } catch (error) {
            console.error('Error en obtenerResultadosUsuario:', error);
            reject({ status: 500, message: 'Error al obtener los resultados', error: error });
        }
    });
};

const obtenerDetallesResultado = async (intentoId) => {
    return new Promise((resolve, reject) => {
        if (!intentoId) {
            return reject({ status: 400, message: 'intentoId es requerido' });
        }

        try {
            const query = `
                SELECT 
                    ai.id,
                    ai.intento_id,
                    ai.paciente_id,
                    ai.accion_id,
                    ai.color_asignado,
                    ai.created_at,
                    pe.nombre as paciente_nombre,
                    ac.nombre_accion as nombre_accion
                FROM acciones_intento ai
                LEFT JOIN pacientes_ejercicio pe ON ai.paciente_id = pe.id
                LEFT JOIN acciones ac ON ai.accion_id = ac.id
                WHERE ai.intento_id = ?
                ORDER BY ai.created_at ASC
            `;

            db.query(query, [intentoId], (err, results) => {
                if (err) return reject({ status: 500, message: 'Error al obtener detalles del resultado', error: err });
                resolve(results);
            });
        } catch (error) {
            console.error('Error en obtenerDetallesResultado:', error);
            reject({ status: 500, message: 'Error al obtener detalles del resultado', error: error });
        }
    });
};

const guardarAccionesIntento = async (intentoId, pacientesAcciones) => {
    return new Promise(async (resolve, reject) => {
        if (!intentoId || !Array.isArray(pacientesAcciones)) {
            return reject({ status: 400, message: 'intentoId y pacientesAcciones son requeridos' });
        }

        try {
            // Procesar cada paciente con sus acciones
            for (let pacienteData of pacientesAcciones) {
                const { pacienteId, acciones, color } = pacienteData;

                // Insertar entrada de color para el paciente
                await new Promise((resolveAccion, rejectAccion) => {
                    db.query(
                        'INSERT INTO acciones_intento (intento_id, paciente_id, color_asignado) VALUES (?, ?, ?)',
                        [intentoId, pacienteId, color],
                        (err, results) => {
                            if (err) return rejectAccion(err);
                            resolveAccion(results);
                        }
                    );
                });

                // Insertar cada acción del paciente
                if (Array.isArray(acciones) && acciones.length > 0) {
                    for (let accion of acciones) {
                        await new Promise((resolveAccionItem, rejectAccionItem) => {
                            db.query(
                                'INSERT INTO acciones_intento (intento_id, paciente_id, accion_id) VALUES (?, ?, ?)',
                                [intentoId, pacienteId, accion.id],
                                (err, results) => {
                                    if (err) return rejectAccionItem(err);
                                    resolveAccionItem(results);
                                }
                            );
                        });
                    }
                }
            }

            resolve({ status: 200, message: 'Acciones del intento guardadas correctamente' });
        } catch (error) {
            console.error('Error en guardarAccionesIntento:', error);
            reject({ status: 500, message: 'Error al guardar acciones del intento', error: error });
        }
    });
};

            module.exports = {
    getAllEjercicios,
    postEjercicio,
    getImagenes,
    postPacienteToEjercicio,
    getPacientesEjercicio,
    getImagenesFromEjercicio,
    locatePacienteInEjercicio,
    getEjerciciosFromAsignatura,
    deleteEjercicio,
    removePacienteFromEjercicio,
    updateEjercicio,
    getPacientesLocationInEjercicio,
    guardarTiempoEjercicio,
    obtenerResultadosUsuario,
    obtenerDetallesResultado,
    guardarAccionesIntento

}