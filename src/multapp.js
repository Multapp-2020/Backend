const { Router } = require('express');
const router = Router();
const admin = require('firebase-admin');
require('dotenv/config');
const firebase = require("firebase");
const multer = require('multer');

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
const bucket = admin.storage().bucket();
const imageService = require('./services/imageService.js')(bucket)

// referencia a cloud firestore
const db = admin.firestore();

const imageMiddleware = multer({
  storage: multer.memoryStorage(),
  limits: {
      fileSize: 5 * 1024 * 1024, // keep images size < 5 MB
  },
});



const autenticacionService = require('./services/autenticacionService.js')(db, auth, firebase)
const autenticacionController = require('./controllers/autenticacionController.js')(autenticacionService)

const multasService = require('./services/multasService.js')(db, auth, imageService)
const multasController = require('./controllers/multasController.js')(multasService)

const usuariosService = require('./services/usuariosService.js')(db, auth, imageService, firebase)
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



/*** Endpoints de multas ***/

// obtener multas resumidas
router.get("/getMultas", multasController.getAllMultas);

// obtener todos los datos de una sola multa
router.get("/getMulta", multasController.getMultaById);

// cambiar de estado una multa
router.post("/actualizarEstado", multasController.actualizarEstado);

// guardar una multa
router.post('/multa', (req, res) => {
    console.log(req.body);
    db.collection('multas').add(req.body);
    res.send('Multa guardada');
});



/*** Endpoints de usuarios ***/

// obtener usuarios resumidos
router.get("/getUsuarios", usuariosController.getUsuarios);

// obtener todos los datos de un solo usuario
router.get("/getUsuario", usuariosController.getUsuarioById);

// crear un usuario
// imageMiddleware agrega a req.file el archivo que se manda en el parametro 'image'
router.post("/addUsuario", imageMiddleware.single('file'), usuariosController.addUsuario);

// editar un usuario
router.post("/editUsuario", imageMiddleware.single('file'), usuariosController.editUsuario);

// eliminar un usuario
router.delete("/deleteUsuario", usuariosController.deleteUsuario);



/*** Endpoints de perfil ***/

// obtener el perfil del usuario actual
router.get("/getPerfil", perfilController.getPerfil);



module.exports = router;