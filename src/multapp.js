const { Router } = require('express');
const router = Router();
const admin = require('firebase-admin');
require('dotenv/config');
const firebase = require("firebase");

// Request $CREDS environment variable
const keysEnvVar = process.env['CREDS'];
if (!keysEnvVar) {
  throw new Error('The $CREDS environment variable was not found!');
}
const keys = JSON.parse(keysEnvVar);

// Request $CLIENTE environment variable
var cliente = process.env['CLIENTE'];
if (!cliente) {
  throw new Error('The $CLIENTE environment variable was not found!');
}
cliente = JSON.parse(cliente);

firebase.initializeApp(cliente);

// Creating Cloud Firestore instance
admin.initializeApp({
  credential: admin.credential.cert(keys),
  storageBucket: process.env.STORAGE_BUCKET,
});
const auth = admin.auth();

// referencia a cloud firestore
const db = admin.firestore();

const autenticacionService = require('./services/autenticacionService.js')(db, auth, firebase)
const autenticacionController = require('./controllers/autenticacionController.js')(autenticacionService)

const usuariosService = require('./services/usuariosService.js')(db, auth)
const usuariosController = require('./controllers/usuariosController.js')(usuariosService)

const perfilService = require('./services/perfilService.js')(db, auth)
const perfilController = require('./controllers/perfilController.js')(perfilService)


/*** Endpoints de autenticación ***/

// iniciar sesion
router.post('/sessionLogin', autenticacionController.sessionLogin);

//cerrar sesion
router.get('/sessionLogout', autenticacionController.sessionLogout)

// cambiar contraseña
router.post("/cambiarContrasena", autenticacionController.cambiarContrasena);


// cambiar contraseña
router.post("/recuperarContrasena", autenticacionController.recuperarContrasena);



/*** Endpoints de usuarios ***/

// obtener usuarios resumidos
router.get("/getUsuarios", usuariosController.getUsuarios);

// obtener todos los datos de un solo usuario
router.get("/getUsuario", usuariosController.getUsuarioById);

// crear un usuario
router.post("/addUsuario", usuariosController.addUsuario);

// editar un usuario
router.post("/editUsuario", usuariosController.editUsuario);

// eliminar un usuario
router.delete("/deleteUsuario", usuariosController.deleteUsuario);

/*** Endpoints de perfil ***/

// obtener el perfil del usuario actual
router.get("/getPerfil", perfilController.getPerfil);




module.exports = router;