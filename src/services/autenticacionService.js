module.exports = (db, auth, firebase) => {
    // Creating session cookie
    function iniciarSesion(email, password, res) {
        if (firebase.auth().currentUser) {
            firebase.auth().signOut();
        }
        firebase.auth().signInWithEmailAndPassword(email, password)
            .then(({ user }) => {
                return user.getIdToken().then(idToken => {
                    auth.getUserByEmail(email)
                        .then(userRecord => {
                            res.send({
                                idToken: idToken,
                                uid: userRecord.uid,
                                email: userRecord.email,
                                rol: userRecord.customClaims.rol,
                                displayName: userRecord.displayName,
                                photoURL: userRecord.photoURL,
                            });
                        }).catch(error => {
                            console.log(error);
                            res.send(error);
                        });
                    return;
                });
            })
            .catch(error => {
                console.log(error);
                res.status(401).json({
                    message: error.code,
                });
            })
                .then(() => {
                    return firebase.auth().signOut();
                }).catch(error => {
                    var errorCode = error.code;
                    var errorMessage = error.message;
                    if (errorCode === 'auth/wrong-password') {
                        res.jsonp({
                            fail : true, 
                            mensaje : "CONTRASEÑA INCORRECTA"
                        });
                    } else {
                        console.log(error);
                        res.jsonp({
                            fail : true, 
                            mensaje : errorMessage
                        });
                    }
                });
    }

    return {
        sessionLogin: (req, res, next) => {
            let email = req.body.email.toString();
            let password = req.body.password.toString();
            iniciarSesion(email, password, res);
        },
        sessionLogout: (req, res, next) => {
            res.clearCookie("session");
        },
        cambiarContrasena: (req, res, next) => {
            auth.getUser(req.body.uid) // obtener el email del usuario
                .then(userRecord => {
                    firebase.auth().signInWithEmailAndPassword(userRecord.email, req.body.contrasenaActual) // iniciar sesion para ver si la contraseña actual es correcta
                        .then(() => {
                            auth.updateUser(req.body.uid, { // actualizar la contraseña
                                password: req.body.contrasenaNueva,
                            })
                                .then(() => {
                                    res.status(200).send("Contraseña actualizada exitosamente");
                                }).catch(error => {
                                    console.log(error);
                                    res.status(401).send({
                                        message: error.code,
                                    });
                                });
                        }).catch(error => {
                            console.log(error);
                            res.status(401).send({
                                message: error.code,
                            });
                        });
                }).catch(error => {
                    console.log(error);
                    res.status(401).send({
                        message: error.code,
                    });
                });
        },
        recuperarContrasena: (req, res, next) => {
            // mandar mail con la nueva contraseña
            const password = (Math.floor(Math.random() * (1000000 - 100000) ) + 100000).toString();
            console.log("password", password);
            auth.getUserByEmail(req.body.email)
                .then(userRecord => {
                    auth.updateUser(userRecord.uid, {
                        password: password,
                    })
                        .then(() => {
                            // mandar el correo
                            res.send("Contraseña recuperada");
                        }).catch(error => {
                            console.log(error);
                            res.status(401).send({
                                message: error.code,
                            });
                        });
                }).catch(error => {
                    console.log(error);
                    res.status(401).send({
                        message: error.code,
                    });
                });
        }
    }
}