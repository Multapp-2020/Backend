const sendEmail = require('../utils/mailSender.js');
const templateTicket = require('../mail/mail');

module.exports = function (db, auth, storage) {
    return {
        getMultaById: function (req, res, next) {
            db.collection("multas").doc(req.query.id).get()
                .then(snapshot => {
                    auth.getUser(snapshot.data().idInspector)
                        .then(inspectorRecord => {
                            let response = {
                                id: snapshot.id,
                                ...snapshot.data(),
                                nombreInspector: inspectorRecord.displayName,
                                nombreSupervisor: "",
                            };
                            if (snapshot.data().idSupervisor !== "") {
                                auth.getUser(snapshot.data().idSupervisor)
                                    .then(supervisorRecord => {
                                        response.nombreSupervisor = supervisorRecord.displayName;
                                        res.send(response);
                                    }).catch(error => {
                                        console.log(error);
                                        res.status(500).send({
                                            message: error.code,
                                        });
                                    });
                            }
                            else {
                                res.send(response);
                            }
                        }).catch(error => {
                            console.log(error);
                            res.status(500).send({
                                message: error.code,
                            });
                        });
                }).catch(error => {
                    console.log(error);
                    res.status(500).send({
                        message: error.code,
                    });
                })
        },
        getMultas: function (req, res, next) {
            db.collection("multas").get()
                .then(snapshot => {
                    let multasResumidas = [];
                    snapshot.forEach(multa => {
                        let multaResumida = {
                            id: multa.id,
                            nombreConductor: multa.data().conductor.apellido + " " + multa.data().conductor.nombre,
                            dniConductor: multa.data().conductor.nroDocumento,
                            fecha: multa.data().ubicacion.fecha,
                            extracto: multa.data().infraccion.extracto,
                            estado: multa.data().estado,
                        };
                        multasResumidas.push(multaResumida);
                    });
                    res.send(multasResumidas);
                }).catch(error => {
                    console.log("Error al recuperar multas", error);
                });
        },
        actualizarEstado: function (req, res, next) {
            db.collection("multas").doc(req.body.id).update({
                estado: req.body.estado,
                razon: req.body.razon,
                idSupervisor: req.body.idSupervisor,
            }).then(async snapshot => {
                const multaVar = await db.collection("multas").doc(req.body.id).get()
                .then(snapshot => { 
                    return snapshot.data();
                });
                const documento = multaVar.conductor.nroDocumento;
                const user = await db.collection("usuarios").where("dni", "==", documento).get()
                .then(snapshot => { 
                    // console.log(snapshot.docs[0].data());
                    // return snapshot.docs[0].data();
                    const respuesta = {
                        id: snapshot.docs[0].id,
                        data: snapshot.docs[0].data()
                    };
                    return respuesta;
                });
                const authUser = await auth.getUser(user.id);
                const plantilla = templateTicket(user.data.nombre, user.data.apellido);
                sendEmail(authUser.email, "Multas con Actualizaciones Recientes", plantilla);
                res.send("Estado de multa " + req.body.id + " actualizado con éxito");
            }).catch(error => {
                console.log(error);
                res.status(500).send({
                    message: error.code,
                });
            });
            /* try {
                sendEmail("mansilla.alberto.23@gmail.com", "Su multa ha sido actualizado recientemente.", "Nuevo estado:" + req.body.estado)
                res.send("Estado de multa " + " actualizado con éxito");
            } catch (e){
                throw(e);
            } */
        },
        getMultaByUser: function (req, res, next) {
            db.collection("usuarios").doc(req.query.uid).get()
                .then(snapshot => {
                    // POR AHORA HAGO EL CASO DE UNA SOLA PATENTE, TENGO QUE ACTUALIZAR PARA HACERLO EN UN ARRAY DE PATENTES
                    const patente = snapshot.data().patentes;
                    // const patente = "AAA111";
                    const arrPatentes = patente.split(",");
                    const dni = snapshot.data().dni;
                    var multasResumidas = [];
                    var multasId = []
                    // db.collection("multas").where('conductor.nroDocumento', '==', dni).where('estado', '==', 'Aceptada').get()
                    db.collection("multas").where('conductor.nroDocumento', '==', dni).get()
                    .then( async (snapshotMultas) => {
                        snapshotMultas.forEach(multa => {
                            let multaResumida = {
                                id: multa.id,
                                nombreConductor: multa.data().conductor.apellido + " " + multa.data().conductor.nombre,
                                dniConductor: multa.data().conductor.nroDocumento,
                                fecha: multa.data().ubicacion.fecha,
                                extracto: multa.data().infraccion.extracto,
                                estado: multa.data().estado,
                            };
                            multasResumidas.push(multaResumida);
                            multasId.push(multaResumida.id);
                        });
                        var iteraciones = [];
                        for (var i=0; i<arrPatentes.length; i++) {
                            var iteracion = await
                                new Promise( (resolve, reject, next) => {
                                    db.collection("multas").where('vehiculo.dominio', '==', arrPatentes[i]).get()
                                    .then(snapshotMultas => {
                                        if (snapshotMultas.docs.length == 0){
                                            resolve("vacio");
                                        }
                                        const arrMultas = [];
                                        snapshotMultas.forEach(multa => {
                                            let multaResumida = {
                                                id: multa.id,
                                                nombreConductor: multa.data().conductor.apellido + " " + multa.data().conductor.nombre,
                                                dniConductor: multa.data().conductor.nroDocumento,
                                                fecha: multa.data().ubicacion.fecha,
                                                extracto: multa.data().infraccion.extracto,
                                                estado: multa.data().estado,
                                            };
                                            if (!(multasId.includes(multaResumida.id))){
                                                /* multasResumidas.push(multaResumida);
                                                multasId.push(multaResumida.id); */
                                                multasId.push(multaResumida.id);
                                                arrMultas.push(multaResumida);
                                                // resolve(multaResumida);
                                            }
                                            /* if (i == (arrPatentes.length)){
                                                // res.send(multasResumidas);
                                                resolve(multasResumidas);
                                            } */
                                        })
                                        resolve(arrMultas);
                                    }).catch(error => {
                                        /* console.log(error);
                                        res.status(500).send({
                                            message: error.code,
                                        }); */
                                        reject(error);
                                    });
                                    // next();
                                })
                            iteraciones.push(iteracion);
                        }
                        return (iteraciones);
                    }).then(async (iteraciones) => {
                        let result = await Promise.all(iteraciones);
                        /* .then(values => {
                            values.forEach(val => {
                                multasResumidas.push(val);
                            })
                        }).then(() => {
                            res.send(multasResumidas);
                        }); */
                        result.forEach(val => {
                            if (!(val == "vacio")){
                                multasResumidas.push(...val);
                            }
                        });
                        res.send(multasResumidas);
                    })
                    .catch(error => {
                        console.log(error);
                        // throw (error);
                        res.status(500).send({
                            message: error.code,
                        });
                    });               
                }).catch(error => {
                    console.log(error);
                    res.status(500).send({
                        message: error.code,
                    });
                })
        },
    }
}

const algo = async() => {
    
}