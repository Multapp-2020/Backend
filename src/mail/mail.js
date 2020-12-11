const templateTicket = (nombre, apellido) => {
    return `
    <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Multapp Mail</title>
            <style>
                img {
                    float: right;
                    width: 60px;
                }
                hr {
                    color: rgb(0, 132, 255);
                }
            </style>
        </head>
        <body>
            <p>
                <img src="https://i.imgur.com/SUw60cR.png" alt="Multapp-Logo">
                Estimado ${apellido}, ${nombre}:
            </p>
            <hr>
            <p>Este correo electrónico tiene el objetivo de notificarle que tiene nuevas multas supervisadas y aceptadas, las cuales puede consultar iniciando sesión en el <a href="https://multapp-citizen.herokuapp.com/" target="_blank">portal de Multapp</a>.</p>
            <p>Atte. El equipo de Multapp.</p>
        </body>
    </html>
    `;
}

module.exports = templateTicket;