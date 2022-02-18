/**
 * Services schema
 * @author Yousuf Kalim
 * @codeby Shuja Naqvi
 */
var FCM = require("fcm-node");
//var serverKey = require("../firebase.json"); //put the generated private key path here
var serverKey = process.env.FCM_SERVER_KEY;
var fcm = new FCM(serverKey);
exports.sendPushMessage = async (tokens, title, body, data) => {
  return new Promise((resolve, reject) => {
    var message = {
      registration_ids: [tokens],
      notification: {
        title: title,
        body: body,
      },
      data: data,
    };
    fcm.send(message, (error, response) => {
      if (error) {
        console.log(" Notification: has gone wrong!", error);
        reject(error);
      } else if (response.results[0].error) {
        console.log(" Notification error  ", response.results[0].error);
        reject(response.results[0].error);
      } else {
        resolve({ success: true, message: "Notification  sent successfully" });
      }
    });
  });
};
