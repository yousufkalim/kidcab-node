/**
 * Find distance api
 * @codeby Shuja Naqvi
 */
var distance = require("google-distance-matrix");
const API_KEY = process.env.GOOGLE_API_KEY;
exports.findDistance2 = async (start_address, step_addresses, end_address) => {
  try {
    distance.key(API_KEY);

    distance.mode('driving');
    distance.units('imperial');
    let TotalDistance = 0;
    let result;
    var addresses = [...step_addresses];
    let ad1 = [];
    var origins = [`${start_address.lat},${start_address.lng}`];
    var destinations = [`${addresses[0].lat},${addresses[0].lng}`];
    addresses[addresses.length] = end_address;
    addresses.map((i) => {
      ad1.push(`${i.lat},${i.lng}`);
    });
    for (var l = 0; l < ad1.length; l++) {
      let currentDistance = await ChkDistance(origins, destinations);
      TotalDistance = +TotalDistance + +currentDistance;
      origins[0] = ad1[l];
      destinations[0] = ad1[l + 1];
    }
    result = { distance: TotalDistance };
    return result;
  } catch (err) {
    console.log(err.message);
  }
};
//function for calculating distance without step
exports.findDistance = async (start_address, end_address) => {
  try {
    distance.key(API_KEY);
    distance.mode("driving");
    distance.units("imperial");

    var origins = [`${start_address.lat},${start_address.lng}`];
    var destinations = [`${end_address.lat},${end_address.lng}`];
    var result = {};
    let Distance;
    let Duration;
    return new Promise((resolve, reject) =>
      distance.matrix(origins, destinations, function (err, distances) {
        if (err) {
          reject(err.message);
        }
        if (!distances) {
          return console.log("no distances");
        }
        console.log(distances, "distances");
        if (distances.status == "OK") {
          for (var i = 0; i < origins.length; i++) {
            for (var j = 0; j < destinations.length; j++) {
              var origin = distances.origin_addresses[i];
              var destination = distances.destination_addresses[j];
              if (distances.rows[0].elements[j].status == "OK") {
                console.log(
                  distances.rows[i].elements[j],
                  "distances.rows[i].elements[j]"
                );
                Distance = distances.rows[i].elements[j].distance.value;
                console.log(
                  distances.rows[i].elements[j],
                  "distances.rows[i].elements[j]"
                );
                Duration = distances.rows[i].elements[j].duration.value;
              } else {
                console.log(
                  destination + " is not reachable by land from " + origin
                );
              }
            }
          }
          result = {
            distance: parseFloat(Distance) / 1000,
            duration: Duration,
          };
        }
        resolve(result);
      })
    );
  } catch (err) {
    console.log(err.message);
  }
};
//Find Distance
const ChkDistance = async (origins, destinations) => {
  return new Promise((resolve, reject) => {
    distance.key(API_KEY);
    distance.mode('driving');
    distance.units('imperial');
    let distancez = 0;
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
            if (distances.rows[0].elements[j].status == 'OK') {
              distancez = parseInt(distances.rows[i].elements[j].distance.value);
            } else {
              console.log(
                destination + " is not reachable by land from " + origin
              );
            }
          }
        }
      }
      resolve(distancez);
    });
  });
};
