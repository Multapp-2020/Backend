const nodemailer = require('nodemailer');
require('dotenv/config');

const mail = process.env['MAIL'];
const pass = process.env['PASS'];

const transport = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: mail,
        pass: pass
    },
});
module.exports = function sendEmail(to, subject, message) {
    const mailOptions = {
        from: 'notifier@multapp.com',
        to,
        subject,
        html: message,
    };
    transport.sendMail(mailOptions, (error) => {
        if (error) {
            console.log(error);
        }
    });
};