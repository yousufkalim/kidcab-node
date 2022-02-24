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
