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

//HEALTH
router.get('/health', (req, res) => {
    res.send("It's alive")
})

module.exports = router;