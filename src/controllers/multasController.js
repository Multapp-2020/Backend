module.exports = function(multasService) {
    return{
        getAllMultas: function (req, res, next) {
            multasService.getMultas(req, res, next)
        },
        getMultaById: function (req, res, next) {
            multasService.getMultaById(req, res, next)
        },
        actualizarEstado: function (req, res, next) {
            multasService.actualizarEstado(req, res, next)
        }
    }
}