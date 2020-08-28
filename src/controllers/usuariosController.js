module.exports = function(usuariosService) {
    return{
        getUsuarios: function (req, res, next) {
            usuariosService.getUsuarios(req, res, next)
        },
        getUsuarioById: function (req, res, next) {
            usuariosService.getUsuarioById(req, res, next)
        },
        addUsuario: function (req, res, next) {
            usuariosService.addUsuario(req, res, next)
        },
        editUsuario: function (req, res, next) {
            usuariosService.editUsuario(req, res, next)
        },
        deleteUsuario: function (req, res, next) {
            usuariosService.deleteUsuario(req, res, next)
        }
    }
}