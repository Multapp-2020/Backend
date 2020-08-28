module.exports = function(perfilService) {
    return{
        getPerfil: function (req, res, next) {
            perfilService.getPerfil(req, res, next)
        },
        cambiarContrasena: function (req, res, next) {
            perfilService.cambiarContrasena(req, res, next)
        },
    }
}