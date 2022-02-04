/**
 * Node-JS Boilerplate
 * @author Yousuf Kalim
 */
require("dotenv").config();
const app = require("express")();
const server = require("http").createServer(app);
const Rides = require("./models/Rides");
const Trips = require("./controllers/trips");
const io = require("socket.io")(server, {
  cors: {
    origin: "*",
  },
});
const port = process.env.PORT || 5000;

require("./database");

// Middleware
require("./middleware/common")(app);

// API Routes
app.use("/api", require("./routes"));

// Server
server.listen(port, () => {
  console.log(`Server is running at port ${port} :)`);
});

io.on("connection", (socket) => {
  try {
    console.log("Connected");
    exports.io = io;
    exports.socket = socket;
    socket.on("send_coordinates", async (data) => {
      let findRide = await Rides.findById(data.RideId);
      if (findRide) {
        socket.broadcast.emit(`receive_coordinates${data.RideId}`, {
          coordinates: data.coordinates,
        });
        console.log("coordinates", data.coordinates);
        findRide = await Rides.findByIdAndUpdate(data.RideId, {
          $push: { route_info: data.coordinates },
        });
        console.log("Saved");
      }
    });
  } catch (error) {
    console.log(error.message);
  }
});
