module.exports = function(autenticacionService) {
    return{
        sessionLogin: function (req, res, next) {
            autenticacionService.sessionLogin(req, res, next)
        },
        sessionLogout: function (req, res, next) {
            autenticacionService.sessionLogout(req, res, next)
        },
        cambiarContrasena: function (req, res, next) {
            autenticacionService.cambiarContrasena(req, res, next)
        },
        recuperarContrasena: function (req, res, next) {
            autenticacionService.recuperarContrasena(req, res, next)
        },
    }
}