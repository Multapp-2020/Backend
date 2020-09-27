module.exports = (db, auth, firebase) => {
    // Creating session cookie
    function iniciarSesion(email, password, res) {
        if (firebase.auth().currentUser) {
            firebase.auth().signOut();
        }
        firebase.auth().signInWithEmailAndPassword(email, password)
            .then(({ user }) => {
                return user.getIdToken().then(idToken => {
                    //const expiresIn = 60 * 60 * 8 * 1000;
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
                        fail: true,
                        mensaje: "CONTRASEÑA INCORRECTA"
                    });
                } else {
                    console.log(error);
                    res.jsonp({
                        fail: true,
                        mensaje: errorMessage
                    });
                }
            });
    }

    return {
        sessionLogin: (req, res, next) => {
            /* 
            const idToken = req.body.idToken.toString();
            const expiresIn = 60 * 60 * 8 * 1000;
            admin
                .auth().createSessionCookie(idToken, { expiresIn })
                .then(
                (sessionCookie) => {
                    const options = { maxAge: expiresIn, httpOnly: true };
                    res.cookie("session", sessionCookie, options);
                    res.end(JSON.stringify({ status: "Success" }));
                },
                (error) => {
                    res.status(401).send("UNAUTHORIZED REQUEST!");
                }
            ); 
            */
            let email = req.body.email.toString();
            let password = req.body.password.toString();
            iniciarSesion(email, password, res);
        },
        sessionLogout: (req, res, next) => {
            res.clearCookie("session");
            //res.redirect("/");
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
            const actionCodeSettings = {
                url: 'https://multapp-front.herokuapp.com/'
            };
            firebase.auth().sendPasswordResetEmail(req.body.email, actionCodeSettings)
                .then(() => {
                    console.log('E-mail enviado');
                    res.send('E-mail enviado');
                }).catch(error => {
                    console.log(error);
                    res.json(error);
                });
        }
    }
}