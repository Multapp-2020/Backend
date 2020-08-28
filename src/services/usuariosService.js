module.exports = (db, auth, storage) => {
    return {
        getUsuarioById: (req, res, next) => {
            auth.getUser(req.query.id)
            .then(userRecord => {
                db.collection("usuarios").doc(userRecord.uid).get()
                    .then(snapshot => {
                        const datos = {
                            id: userRecord.uid,
                            foto: userRecord.photoURL,
                            displayName: userRecord.displayName,
                            rol: userRecord.customClaims.rol,
                            email: userRecord.email,
                            dni: snapshot.data().dni,
                            apellido: snapshot.data().apellido,
                            nombre: snapshot.data().nombre,
                            fechaNacimiento: snapshot.data().fechaNacimiento,
                            sexo: snapshot.data().sexo,
                            telefono: userRecord.phoneNumber,
                            direccion: snapshot.data().calle + " " + snapshot.data().numero,
                            calle: snapshot.data().calle,
                            numero: snapshot.data().numero,
                            piso: snapshot.data().piso,
                            departamento: snapshot.data().departamento,
                            localidad: snapshot.data().localidad,
                            provincia: snapshot.data().provincia,
                        }
                        res.send(datos);
                    }).catch(error => {
                        console.log(error);
                        res.send(error);
                    });
            }).catch(error => {
                console.log(error);
                res.status(500).send("Error al obtener datos de usuario");
            });
        },
        getUsuarios: (req, res, next) => {
            auth.listUsers()
                .then(listUsersResult => {
                    let usuarios = [];
                    listUsersResult.users.forEach(userRecord => {
                        usuarios.push({
                            id: userRecord.uid,
                            rol: userRecord.customClaims.rol,
                            nombre: userRecord.displayName,
                            email: userRecord.email,
                            foto: userRecord.photoURL,
                        });
                    });     
                    res.status(200).send(usuarios);
                }).catch(error => {
                    console.log(error);
                    res.status(500).send(error);
                });
        },
        addUsuario: (req, res, next) => {
            // aca tambien habria que:
            // guardar la foto del tipo en storage
            // mandarle correo al tipo con su contraseña
            let password = (Math.floor(Math.random() * (1000000 - 100000) ) + 100000).toString();
            console.log(password);
            auth.createUser({ // crea el usuario
                email: req.body.email,
                password: password,
                displayName: req.body.datos.nombre + " " + req.body.datos.apellido,
                phoneNumber: req.body.telefono,
            })
                .then(userRecord => {
                    let uid = userRecord.uid;
                    auth.setCustomUserClaims(uid, {rol: req.body.rol}) // setea el rol del usuario
                        .then(() => { // guarda los datos personales en la base de datos
                            db.collection("usuarios").doc(uid).set({
                                ...req.body.datos,
                            })
                                .then(() => {
                                    // storage.ref().child("avatar/" + uid).put(req.body.foto) // guarda la foto de perfil
                                    //     .then(snapshot => {
                                    //         console.log(snapshot);
                                            // userRecord.updateUser({ // guarda la referencia a la foto en authentication
                                            //     // photoURL
                                            // })
                                            //     .then(() => {
                                                    res.status(201).send("Usuario " + uid + " creado correctamente");
                                                // }).catch(error => {
                                                //     res.status(500).send(error);
                                                // });
                                        // }).catch(error => {
                                        //     console.log(error);
                                        //     res.status(500).send(error);
                                        // })
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
                        });
                }).catch(error => {
                    console.log(error);
                    res.status(500).send({
                        message: error.code,
                    });
                });
        },
        editUsuario: (req, res, next) => {
            // aca tambien habria que:
            // guardar la foto nueva en storage
            // mandarle correo al tipo con el cambio de correo
            auth.updateUser(req.body.id, {
                email: req.body.email,
                phoneNumber: req.body.telefono,
                displayName: req.body.datos.nombre + " " + req.body.datos.apellido,
            })
                .then(() => {
                    db.collection("usuarios").doc(req.body.id).update(req.body.datos)
                        .then(() => {
                            res.status(200).send("Usuario " + req.body.id + " actualizado correctamente");
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
                });
            
        },
        deleteUsuario: (req, res, next) => {
            // FALTA
            // eliminar la foto de perfil del usuario (cuando sepa como cargar una)
            auth.deleteUser(req.query.id) // elimina la cuenta de authentication
                .then(() => {
                    db.collection("usuarios").doc(req.query.id).delete() // elimina los datos del usuario en firestore
                        .then(() => {
                            res.status(200).send("Usuario " + req.query.id + " eliminado correctamente");
                        }).catch(error => {
                            console.log(error);
                            res.status(500).send(error);
                        });
                }).catch(error => {
                    console.log(error);
                    res.status(500).send(error);
                });
        }
    }
}