// /**
//  * Services schema
//  * @author Yousuf Kalim
//  * @codeby Shuja Naqvi
//  */
// exports.findDistance = async (start_address, end_address) => {
//   try {
//     const R = 6371;
//     let start_lat = parseFloat(start_address.lat);
//     let start_lng = parseFloat(start_address.lng);
//     let end_lat = parseFloat(end_address.lat);
//     let end_lng = parseFloat(end_address.lng);
//     let dLat = parseFloat(((end_lat - start_lat) * Math.PI) / 180); // deg2rad below
//     let dLon = parseFloat(((end_lng - start_lng) * Math.PI) / 180);
//     var a = parseFloat(
//       0.5 -
//         Math.cos(dLat) / 2 +
//         (Math.cos((start_lat * Math.PI) / 180) *
//           Math.cos((end_lat * Math.PI) / 180) *
//           (1 - Math.cos(dLon))) /
//           2
//     );
//     var distance = parseFloat(R * 2 * Math.asin(Math.sqrt(a)));
//     console.log(distance);
//     return distance;
//   } catch (err) {
//     console.log(err.message);
//   }
// };

/**
 * Find distance api
 * @codeby Shuja Naqvi
 */
var distance = require("google-distance-matrix");
const API_KEY = process.env.GOOGLE_API_KEY;
exports.findDistance = async (start_address, end_address) => {
  try {
    distance.key(API_KEY);
    distance.mode("driving");
    distance.units("imperial");
    var origins = [`${start_address.lat},${start_address.lng}`];
    var destinations = [`${end_address.lat},${end_address.lng}`];
    return new Promise((resolve, reject) =>
      distance.matrix(origins, destinations, function (err, distances) {
        if (err) {
          reject(err.message);
        }
        if (!distances) {
          return console.log("no distances");
        }
        if (distances.status == "OK") {
          for (var i = 0; i < origins.length; i++) {
            for (var j = 0; j < destinations.length; j++) {
              var origin = distances.origin_addresses[i];
              var destination = distances.destination_addresses[j];
              if (distances.rows[0].elements[j].status == "OK") {
                var result =
                  parseInt(distances.rows[i].elements[j].distance.text) * 1.609;
              } else {
                console.log(
                  destination + " is not reachable by land from " + origin
                );
              }
            }
          }
        }
        resolve(result);
      })
    );
  } catch (err) {
    console.log(err.message);
  }
};
