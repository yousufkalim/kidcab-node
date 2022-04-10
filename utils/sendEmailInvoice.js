/**
 * Send Invoice Email
 * @author Shuja Naqvi
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

exports.sendInvoiceEmail = (user, invoice, attachment) => {
  return new Promise((resolve, reject) => {
    // Sender mail server config
    const filePath = path.join(
      __dirname,
      "../template/invoiceEmailTemplate.html"
    );
    const source = fs.readFileSync(filePath, "utf-8").toString();
    const template = handlebars.compile(source);
    const data = {
      name: user.first_name + " " + user.last_name,
      invoice_title: invoice.invoice_title,
      total_price: invoice.total_price,
      issue_date: moment(invoice.issue_date).format("DD MMMM YYYY"),
    };
    const htmlToSend = template(data);

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
      to: user.email,
      subject: "Invoice Created",
      html: htmlToSend,
      attachments: [
        {
          filename: "InvoiceReport.pdf",
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
