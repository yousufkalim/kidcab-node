/**
 * Fcm Service
 * @author Shuja Naqvi
 */
var FCM = require("fcm-node");
var serverKey = process.env.FCM_SERVER_KEY;
var fcm = new FCM(serverKey);
exports.sendPushMessage = async (tokens, title, body, data) => {
  try {
    var message = {
      registration_ids: [tokens],
      notification: {
        title: title,
        body: body,
      },
      data: data,
    };
    fcm.send(message, (error, response) => {
      if (!error) console.log("Notification sent successfully",response);
    });
  } catch (err) {
    console.log("Somthing gone worng", err.message);
  }
};
