/**
 * Find distance api
 * @codeby Shuja Naqvi
 */
var distance = require("google-distance-matrix");
const API_KEY = process.env.GOOGLE_API_KEY;
exports.findDistance1 = async (start_address, step_address, end_address) => {
  try {
    let result = {};
    let Distance = 0;
    let time = 0;
    distance.key(API_KEY);
    distance.mode("driving");
    distance.units("imperial");
    var origins = [`${step_address.lat},${step_address.lng}`];
    var destinations = [
      `${start_address.lat},${start_address.lng}`,
      `${end_address.lat},${end_address.lng}`,
    ];
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
                Distance =
                  Distance +
                  parseInt(distances.rows[i].elements[j].distance.text) *
                    1.60934;
                time =
                  time + parseInt(distances.rows[i].elements[j].duration.value);
              } else {
                console.log(
                  destination + " is not reachable by land from " + origin
                );
              }
            }
          }
          result = { distance: Distance, time: time };
        }
        resolve(result);
      })
    );
  } catch (err) {
    console.log(err.message);
  }
};
//function for calculating distance without step
exports.findDistance = async (start_address, end_address) => {
  try {
    distance.key(API_KEY);
    console.log("not step");
    distance.mode("driving");
    distance.units("metric");
    var origins = [`${start_address.lat},${start_address.lng}`];
    var destinations = [`${end_address.lat},${end_address.lng}`];
    var result = {};
    let Distance = 0;
    let time = 0;
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
                Distance = parseInt(
                  distances.rows[i].elements[j].distance.text
                );
                time = parseInt(distances.rows[i].elements[j].duration.value);
              } else {
                console.log(
                  destination + " is not reachable by land from " + origin
                );
              }
            }
          }
          result = {
            distance: Distance,
            time: time,
          };
        }
        resolve(result);
      })
    );
  } catch (err) {
    console.log(err.message);
  }
};
