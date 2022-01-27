/**
 * Node-JS Boilerplate
 * @author Yousuf Kalim
 */
require("dotenv").config();
const app = require("express")();
const server = require("http").createServer(app);
const Rides = require("./models/Rides");
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
    socket.on("send_coordinates", async (data) => {
      console.log(data.RideId, "RideId");
      let findRide = await Rides.findById(data.RideId);
      if (findRide) {
        console.log("Inside If");
        socket.emit(`receive_coordinates${data.RideId}`, {
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
//cron-job that will run after every 10days to delete all expired notifications from DB

cron.schedule('0 5 */10 * *', () => {
});
