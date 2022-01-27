/**
 * Services schema
 * @author Yousuf Kalim
 * @codeby Shuja Naqvi
 */
exports.findDistance = async (start_address, end_address) => {
  try {
    const R = 6371;
    let start_lat = parseFloat(start_address.lat);
    let start_lng = parseFloat(start_address.lng);
    let end_lat = parseFloat(end_address.lat);
    let end_lng = parseFloat(end_address.lng);
    let dLat = parseFloat(((end_lat - start_lat) * Math.PI) / 180); // deg2rad below
    let dLon = parseFloat(((end_lng - end_lng) * Math.PI) / 180);
    var a = parseFloat(
      0.5 -
        Math.cos(dLat) / 2 +
        (Math.cos((start_lat * Math.PI) / 180) *
          Math.cos((end_lat * Math.PI) / 180) *
          (1 - Math.cos(dLon))) /
          2
    );
    var distance = parseFloat(R * 2 * Math.asin(Math.sqrt(a)));
    console.log(distance);
    return distance;
  } catch (err) {
    console.log(err.message);
  }
};
