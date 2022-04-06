/**
 * Send email service for forgot password
 * @author Arooj
 */
var nodemailer = require("nodemailer");
const handlebars = require("handlebars");
const fs = require("fs");
const path = require("path");
const moment = require("moment");

const sender_name = process.env.MAILER_DOMAIN;
const sender_email = process.env.MAILER_EMAIL;
const sender_password = process.env.MAILER_PASSWORD;

/**
 * sendEmail
 * @param {string} subject
 * @param {object} data
 * @return {void}
 */
// exports.sendEmail = (user, quote) => {
//   return new Promise((resolve, reject) => {
//     const filePath = path.join(
//       __dirname,
//       "../template/quoteEmailTemplate.html"
//     );
//     const source = fs.readFileSync(filePath, "utf-8").toString();
//     const template = handlebars.compile(source);

//     const data = {
//       name: user.first_name + " " + user.last_name,
//       total_trips: quote.trip_info.total_trips,
//       quote_title: quote.quote_title,
//       total_price: quote.total_price,
//       issue_date: moment(quote.issue_date).format("DD MMMM YYYY"),
//     };
//     const htmlToSend = template(data);

//     // Sender mail server config
//     var transporter = nodemailer.createTransport({
//       service: "gmail",
//       auth: {
//         user: sender_email,
//         pass: sender_password,
//       },
//     });

//     // Send email options
//     var mailOptions = {
//       from: `${sender_name} <${sender_email}>`,
//       to: user.email,
//       subject: "Quote Created",
//       html: htmlToSend,
//     };

//     // Sending email
//     transporter.sendMail(mailOptions, function (error, info) {
//       if (error) {
//         // Error
//         reject(error);
//       } else {
//         // Success
//         resolve({ success: true, message: "Email sent successfully" });
//       }
//     });
//   });
// };
exports.sendQuoteEmail = (email, attachment) => {
  return new Promise((resolve, reject) => {
    // Sender mail server config
    console.log(email,attachment)
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
      attachments: [{
       filename: 'QuotesReport.pdf',
       path: `${attachment}` // stream this file
      }]
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
