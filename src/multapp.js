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


/*** Endpoints de autenticación ***/

// iniciar sesion
router.post('/sessionLogin', autenticacionController.sessionLogin);

//cerrar sesion
router.get('/sessionLogout', autenticacionController.sessionLogout)

// cambiar contraseña
router.post("/cambiarContrasena", autenticacionController.cambiarContrasena);


// cambiar contraseña
router.post("/recuperarContrasena", autenticacionController.recuperarContrasena);


module.exports = router;