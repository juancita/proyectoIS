require('dotenv').config();
const twilio = require('twilio');

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

async function enviarNotificacion(mensaje) {
    try {
        const message = await client.messages.create({
            from: process.env.TWILIO_WHATSAPP_NUMBER,
            to: process.env.DESTINO_WHATSAPP,
            body: mensaje
        });
        console.log('Mensaje enviado:', message.sid);
    } catch (error) {
        console.error('Error enviando mensaje:', error);
    }
}

module.exports = enviarNotificacion;
