/**
 * Send Quote Email
 * @author Shuja Naqvi dev...!
 */
var nodemailer = require("nodemailer");

const sender_name = process.env.MAILER_DOMAIN;
const sender_email = process.env.MAILER_EMAIL;
const sender_password = process.env.MAILER_PASSWORD;

/**
 * sendEmail
 * @param {string} subject
 * @param {object} data
 * @return {void}
 */
exports.sendQuoteEmail = (email, attachment) => {
  return new Promise((resolve, reject) => {
    // Sender mail server config
    console.log(email, attachment);
    var transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: sender_email,
        pass: sender_password,
      },
    });

    // Send email options
    var mailOptions = {
      from: `${sender_name} <${sender_email}>`,
      to: email,
      subject: "Quote Created",
      text: "Quote has been created.Please check the file below!", // plain text body
      attachments: [
        {
          filename: "QuotesReport.pdf",
          path: `${attachment}`, // stream this file
        },
      ],
    };

    // Sending email
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        // Error
        reject(error);
      } else {
        // Success
        resolve({ success: true, message: "Email sent successfully" });
      }
    });
  });
};
