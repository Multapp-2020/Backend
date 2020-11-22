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
            }).then(snapshot => {
                res.send("Estado de multa " + req.id + " actualizado con éxito");
            }).catch(error => {
                console.log(error);
                res.status(500).send({
                    message: error.code,
                });
            });
        }
    }
}