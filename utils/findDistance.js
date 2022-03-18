/**
 * Find distance api
 * @codeby Shuja Naqvi
 */
var distance = require("google-distance-matrix");
const API_KEY = process.env.GOOGLE_API_KEY;
exports.findDistance1 = async (start_address, step_address, end_address) => {
  try {
    console.log("inside");
    distance.key(API_KEY);
    distance.mode("driving");
    distance.units("metric");
    var result = {};
    let Distance = 0;
    let time = 0;
    var origins = [`${start_address.lat},${start_address.lng}`];
    var addresses = [];
    let step_addresses = [
      {
        label: "Pencréac’H 29600 Morlaix",
        label2: "Pencréac’H 29600 Morlaix,29, Finistère, Bretagne",
        postal_code: "29600",
        lat: "48.596819",
        lng: "-3.837081",
        city: "Morlaix",
      },
      {
        label: "N 1 97410 Saint-Pierre",
        label2: "N 1 97410 Saint-Pierre,974, La Réunion",
        postal_code: "97410",
        lat: "-21.311913",
        lng: "55.437155",
        city: "Saint-Pierre",
      },
      {
        label: "Pairs 16420 Saint-Christophe",
        label2: "Pairs 16420 Saint-Christophe,16, Charente, Nouvelle-Aquitaine",
        postal_code: "16420",
        lat: "45.977226",
        lng: "0.836006",
        city: "Saint-Christophe",
      },
    ];
    var destinations = [`${step_addresses[0].lat},${step_addresses[0].lng}`];
    step_addresses = step_addresses.splice(1);
    step_addresses[step_addresses.length] = end_address;
    step_addresses.map((i) => {
      addresses.push(`${i.lat},${i.lng}`);
    });
    return new Promise((resolve, reject) =>
      distance.matrix(origins, destinations, function (err, distances) {
        if (err) {
          reject(err.message);
        }
        if (!distances) {
          return console.log("no distances");
        }
        if (distances.status == "OK") {
          for (var l = 0; l < addresses.length; l++) {
            var origin = distances.origin_addresses[0];
            var destination = distances.destination_addresses[0];
            if (distances.rows[0].elements[0].status == "OK") {
              Distance =
                Distance +
                parseInt(distances.rows[0].elements[0].distance.text);
              time =
                time + parseInt(distances.rows[0].elements[0].duration.value);
            } else {
              console.log(
                destination + " is not reachable by land from " + origin
              );
            }
            origins = addresses[l];
            destinations = addresses[l + 1];
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
// exports.findDistance1 = async (start_address, step_address, end_address) => {
//   try {
//     let result = {};
//     let Distance = 0;
//     let time = 0;
//     distance.key(API_KEY);
//     distance.mode("driving");
//     distance.units("imperial");
//     var origins = [`${step_address.lat},${step_address.lng}`];
//     var destinations = [
//       `${start_address.lat},${start_address.lng}`,
//       `${end_address.lat},${end_address.lng}`,
//     ];
//     return new Promise((resolve, reject) =>
//       distance.matrix(origins, destinations, function (err, distances) {
//         if (err) {
//           reject(err.message);
//         }
//         if (!distances) {
//           return console.log("no distances");
//         }
//         if (distances.status == "OK") {
//           for (var i = 0; i < origins.length; i++) {
//             for (var j = 0; j < destinations.length; j++) {
//               var origin = distances.origin_addresses[i];
//               var destination = distances.destination_addresses[j];
//               if (distances.rows[0].elements[j].status == "OK") {
//                 Distance =
//                   Distance +
//                   parseInt(distances.rows[i].elements[j].distance.text) *
//                     1.60934;
//                 time =
//                   time + parseInt(distances.rows[i].elements[j].duration.value);
//               } else {
//                 console.log(
//                   destination + " is not reachable by land from " + origin
//                 );
//               }
//             }
//           }
//           result = { distance: Distance, time: time };
//         }
//         resolve(result);
//       })
//     );
//   } catch (err) {
//     console.log(err.message);
//   }
// };
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
