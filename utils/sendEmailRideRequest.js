/**
 * Send email service for forgot password
 * @author Azeem
 */
const moment = require('moment');
var nodemailer = require('nodemailer');
const sender_name = process.env.MAILER_DOMAIN;
const sender_email = process.env.MAILER_EMAIL;
const sender_password = process.env.MAILER_PASSWORD;

/**
 * sendEmail
 * @param {string} email
 * @param {string} password
 * @return {void}
 */
exports.sendEmailRideRequest = req => {
  return new Promise((resolve, reject) => {
    const {
      total_children,
      total_adults,
      price,
      baby,
      destination_address,
      pickUp_address,
      pickUp_date,
      first_name,
      last_name
    } = req;
    const passengers = total_children + total_adults + baby;
    const rate = price ? `${price}€` : 'ON ESTIMATE';
    // Sender mail server config
    var transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: sender_email,
        pass: sender_password
      }
    });

    // Send email options
    var mailOptions = {
      from: `${sender_name} <${sender_email}>`,
      to: [req.email, 'maximechevallier@kidcab.fr'],
      subject: 'Résumé de votre course Kidcab',
      text: `Bonjour, \n \n Votre demande de course Kidcab a été créée avec succès. Vous en trouverez ci-dessous les détails : \n \n Client: ${first_name} ${last_name} \n Nombre de passagers: ${passengers} \n Lieu de départ: ${
        pickUp_address.label2
      } \n Lieu d’arrivée: ${destination_address.label2} \n Date: ${moment(pickUp_date).format(
        'DD/MM/yyyy'
      )} \n Tarif: ${rate} \n \n Merci, \n \n Cordialement, \n L’équipe Kidcab  `
    };

    // Sending email
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        // Error
        reject(error);
      } else {
        // Success
        resolve({ success: true, message: 'Email sent successfully' });
      }
    });
  });
};
