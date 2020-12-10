module.exports = (db, auth) => {
    return {
        getPerfil: (req, res, next) => {
            auth.getUser(req.query.uid)
                .then(userRecord => {
                    let response = {
                        id: userRecord.uid,
                        datos: null,
                        foto: userRecord.photoURL,
                    };
                    db.collection("usuarios").doc(userRecord.uid).get()
                        .then(snapshot => {
                            const datos = {
                                nombre: userRecord.displayName,
                                rol: userRecord.customClaims.rol,
                                email: userRecord.email,
                                dni: snapshot.data().dni,
                                fechaNacimiento: snapshot.data().fechaNacimiento,
                                sexo: snapshot.data().sexo,
                                telefono: userRecord.phoneNumber,
                                direccion: snapshot.data().calle + " " + snapshot.data().numero,
                                localidad: snapshot.data().localidad,
                                provincia: snapshot.data().provincia,
                                patentes: snapshot.data().patentes,
                            }
                            response.datos = datos;
                            res.send(response);
                        }).catch(error => {
                            console.log(error);
                            res.send(error);
                        });
                }).catch(error => {
                    console.log(error);
                    res.status(500).send({
                        message: error.code,
                    });
                });
        },
    }
}