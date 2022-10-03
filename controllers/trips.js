/**
 * trips CRUD controllers
 * @author Arooj Ishfaq
 */
const Trips = require('../models/Trips');
const Drivers = require('../models/Drivers');
const Rides = require('../models/Rides');
const Users = require('../models/Users');
const Notifications = require('../models/Notifications');
const moment = require('moment');
const Admin = require('../models/Admins');
const Company = require('../models/Company');
const { findDistance, findDistance2 } = require('../utils/findDistance');
const fs = require('fs');
const pdf = require('pdf-creator-node');
const path = require('path');
const fcmservice = require('../utils/fcmService');
/**
 * Create Trip
 * @param {object} req
 * @param {object} res
 */
exports.create = async (req, res) => {
  try {
    const { inviteddrivers, start_address, addresses, end_address, dates, client, status } = req.body;
    const daysCount = new Date().getTime() + 1296000000; //To set Expiry date for notification
    const fifteenDays = new Date(daysCount); //Set date after 15days
    const user = await Users.findById(client);
    //if stetp not added by admin
    if (Object.values(addresses).length < 1) {
      const result = await findDistance(start_address, end_address);
      req.body.distance = result.distance ? (result.distance / 1000).toFixed(1) : 0;
     
    } else {
      //if stetp  added by admin
      const result = await findDistance2(start_address, addresses, end_address);
      req.body.distance = result.distance ? (result.distance / 1000).toFixed(1) : 0;
      
    }
    
    let tripsIds = [];
    const drivers = await Drivers.find({
      _id: { $in: inviteddrivers },
    });
    if (status === 'pending') {
      var pubMsg = {
        verb: 'published',
        actions: 'Proposition de course Kidcab',
      }; //Message for fcm
      var pushMessage = 'Proposition de course Kidcab'; //Notification title fcm
      req.body.invited_drivers = inviteddrivers.map((driver) => ({
        driver: driver,
      }));
    } else if (status == 'confirmed') {
      var pubMsg = {
        verb: 'published',
        actions: 'Nouveau trajet confirmé',
      }; //Message for fcm
      var pushMessage = 'Nouveau trajet confirmé'; //Notification title fcm
      req.body.assigned_drivers = drivers[0]._id;
    }
    const createTrips = () => {
      return new Promise((resolve, reject) => {
        dates.map(async (date, index) => {
          try {
            //create trip for each driver with specific date
            const trip = await Trips.create({
              ...req.body,
              rides: [],
              date: date,
            });
            if (status == 'confirmed') {
              const price = trip.driver_price / trip.required_drivers;
              const ride = await Rides.create({
                price: price,
                client: trip.client,
                driver: drivers[0]._id,
                vehicle: drivers[0].vehicles[0],
                trip: trip._id,
                date: trip.date,
              });
              await Trips.findByIdAndUpdate(
                trip._id,
                {
                  $push: { rides: ride._id },
                },
                { new: true }
              );
            }
            //pushing trips
            tripsIds.push(trip?._id);
            //creating trip
            //This map will send notification to all driver then create notification for each driver
            if (req.body.tripType === 'simple') {
              drivers.map(async (driver) => {
                console.log(driver?.fcmToken)
                if (driver?.fcmToken) {
                  fcmservice.sendPushMessage(driver.fcmToken, 'Proposition de course Kidcab', pushMessage, pubMsg);
                  //store notification in db
                  const notification = await Notifications.create({
                    title: 'Proposition de course Kidcab',
                    expiry_date: fifteenDays,
                    receiver: driver.id,
                  });
                  //update driver with new notification
                  await Drivers.findByIdAndUpdate(driver.id, {
                    $push: {
                      notifications: notification.id,
                    },
                  });
                }
              });
            }
            let datesLength = dates.length - 1;
            if (index === datesLength) {
              resolve(trip);
            }
          } catch (err) {
            console.trace('Error ----> ', err.message);
            reject(err);
          }
        });
      });
    };
    if (req.body.trip_type == 'recurring') {
      drivers.map(async (driver) => {
        if (driver?.fcmToken) {
          fcmservice.sendPushMessage(
            driver.fcmToken,
            `Proposition de course Kidcab de ${req.body.startdate} à ${req.body.enddate}`,
            pushMessage,
            pubMsg
          );
          //store notification in db
          const notification = await Notifications.create({
            title: `Proposition de course Kidcabb de ${req.body.startdate} à ${req.body.enddate}`,
            expiry_date: fifteenDays,
            receiver: driver.id,
          });
          //update driver with new notification
          await Drivers.findByIdAndUpdate(driver.id, {
            $push: {
              notifications: notification.id,
            },
          });
        }
      });
    }
    //resolving all promises
    createTrips()
      .then(async (response) => {
        res.json({ success: true, response });
      })
      .catch((err) => {
        console.trace('Error ----> ', err.message);
        res.status(500).json({ success: false, message: 'Internal server error' });
      });
  } catch (err) {
    console.trace('Error ----> ', err.message);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/**
 * Accept trip
 * @param {object} req
 * @param {object} res
 */
exports.accept = async (req, res) => {
  const { tripId, driverId } = req.params;
  try {
    let trip = await Trips.findById(tripId);
    let driver = await Drivers.findById(driverId);
    const driver_id = driver._id;
    const price = trip.driver_price / trip.required_drivers;
    //creating ride when driver accepts invitation
    let tripDate = moment(trip.date).format('YYYY-MM-DD');
    let today = moment(new Date()).format('YYYY-MM-DD');
    if (!trip || !driver) {
      return res.status(404).json({ success: false, message: 'Trip/Driver not found' });
    } else if (trip.required_drivers <= trip.assigned_drivers.length) {
      return res.status(400).json({ success: false, message: 'Trip already booked' });
    }
    const ride = await Rides.create({
      price: price,
      client: trip.client,
      driver: driver_id,
      vehicle: driver.vehicles[0],
      trip: trip._id,
      date: trip.date,
    });

    //updating trip after creating ride
    const updatedTrip = await Trips.findByIdAndUpdate(
      trip._id,
      {
        $push: { assigned_drivers: driverId, rides: ride._id },
        $pull: { invited_drivers: { driver: driverId } },
      },
      { new: true }
    );
    if (updatedTrip.assigned_drivers.length === updatedTrip.required_drivers) {
      updatedTrip.status = 'confirmed';
      await updatedTrip.save();
    }

    res.json({ success: true, trip: updatedTrip });
  } catch (err) {
    console.log('Error ----> ', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/**
 * Decline trip by driver
 * @param {object} req
 * @param {object} res
 */
exports.declineByDriver = async (req, res) => {
  try {
    let { tripId, driverId } = req.params;

    let declinedTrip = await Trips.findByIdAndUpdate(
      tripId,
      {
        $pull: {
          invited_drivers: { driver: driverId },
        },
      },
      { new: true }
    )
      .populate('client')
      .populate('rides')
      .populate('passengers')
      .populate({
        path: 'invited_drivers',
        populate: {
          path: 'driver',
        },
      })
      .populate('assigned_drivers');

    if (!declinedTrip) {
      return res.status(400).json({ success: false, message: 'Trip already declined' });
    }

    res.json({ success: true, declinedTrip });
  } catch (err) {
    console.log('Error ----> ', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/**
 * Get all trips
 * @param {object} req
 * @param {object} res
 */
exports.getAll = async (req, res) => {
  try {
    const trips = await Trips.find()
      .populate('client')
      .populate('rides')
      .populate('passengers')
      .populate({
        path: 'invited_drivers',
        populate: {
          path: 'driver',
        },
      })
      .populate('assigned_drivers')
      .sort({ date: -1 });
    if (!trips) res.status(404).send('No Trips Found');
    res.json({ success: true, trips });
  } catch (err) {
    console.log('Error ----> ', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/**
 * Get pending trips by driver id
 * @param {object} req
 * @param {object} res
 */
exports.getPendingByDriver = async (req, res) => {
  try {
    let { driverId } = req.params;

    const trips = await Trips.find({
      'invited_drivers.driver': driverId,
      status: 'pending',
    })
      .populate('client')
      .populate('rides')
      .populate('passengers')
      .populate({
        path: 'invited_drivers',
        populate: {
          path: 'driver',
        },
      })
      .populate({
        path: 'client',
        populate: {
          path: 'passengers',
        },
      })
      .populate('assigned_drivers')
      .sort({ date: 1 });

    if (!trips) res.status(404).send('No Trips Found');

    res.json({ success: true, trips });
  } catch (err) {
    console.log('Error ----> ', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/**
 * Get upcoming trips/rides
 * @param {object} req
 * @param {object} res
 */

exports.getUpcomingTrips = async (req, res) => {
  try {
    const trips = await Trips.find({ client: req.params.clientId })
      .populate('client')
      .populate('rides')
      .populate('passengers')
      .populate({
        path: 'invited_drivers',
        populate: {
          path: 'driver',
        },
      })
      .populate('assigned_drivers')
      .sort({ date: 1 });
    var current = moment();
    let upcomingTrips = trips.filter((a) => moment(current).isBefore(a.date));
    if (!upcomingTrips) return res.status(404).send('No Trips Found');
    res.json({ success: true, upcomingTrips });
  } catch (err) {
    console.log('Error ----> ', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/**
 * Get past trips/rides
 * @param {object} req
 * @param {object} res
 */
exports.getPastTrips = async (req, res) => {
  try {
    const trips = await Trips.find({
      client: req.params.clientId,
    })
      .populate('client')
      .populate('rides')
      .populate('passengers')
      .populate({
        path: 'invited_drivers',
        populate: {
          path: 'driver',
        },
      })
      .populate('assigned_drivers')
      .sort({ date: -1 });
    var current = moment();
    let pastTrips = trips.filter((a) => moment(current).isAfter(a.date));
    if (!trips) return res.status(404).send('No Trips Found');
    res.json({ success: true, pastTrips });
  } catch (err) {
    console.log('Error ----> ', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/**
 * Get trip by id
 * @param {object} req
 * @param {object} res
 */
exports.getById = async (req, res) => {
  try {
    const tripId = req.params.tripId;
    const trip = await Trips.findById(tripId)
      .populate('client')
      .populate('rides')
      .populate('passengers')
      .populate({
        path: 'invited_drivers',
        populate: {
          path: 'driver',
        },
      })
      .populate('assigned_drivers');
    if (!trip) res.status(404).send('No Trips Found');
    res.json({ success: true, trip });
  } catch (err) {
    console.log('Error ----> ', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/**
 * Get trip by status
 * @param {object} req
 * @param {object} res
 */
exports.getTripsByStatus = async (req, res) => {
  try {
    const { pageNumber, pageSize } = req.body;
    const trips = await Trips.find({
      status: req.params.status === 'all' ? undefined : req.params.status,
    })
      .skip(pageNumber * pageSize)
      .limit(parseInt(pageSize))
      .populate('client')
      .populate('passengers')
      .populate({
        path: 'invited_drivers',
        populate: {
          path: 'driver',
        },
      })
      .populate('assigned_drivers')
      .sort({ date: -1 });
    if (!trips) res.status(404).send('No Trips Found');
    const totalResults = await Trips.find().countDocuments();
    res.json({ success: true, trips, totalResults });
  } catch (err) {
    console.log('Error ----> ', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/**
 * Update trip
 * @param {object} req
 * @param {object} res
 */
exports.update = async (req, res) => {
  try {
    const tripId = req.params.tripId;
    // const findTrip = await Trips.findById(tripId);
    const { start_address, end_address, addresses, inviteddrivers, assigned_drivers } = req.body;

    if (inviteddrivers) {
      req.body.invited_drivers = inviteddrivers.map((driver) => ({
        driver: driver,
      }));
    }

    //if (req.body.status === "pending") {
    // const daysCount = new Date().getTime() + 1296000000; //To set Expiry date for notification
    // const fifteenDays = new Date(daysCount); //Set date after 15days
    // var pubMsg = {
    //   verb: "published",
    //   actions: "Vous avez un nouveau trajet ",
    // }; //Message for fcm
    // var pushMessage = "ous avez un nouveau trajet "; //Notification title fcm
    // let newDriver = req.body.invited_drivers.filter(
    //   (o1) => !findTrip.invited_drivers.some((o2) => o1.driver == o2.driver)
    // );
    // const drivers = await Drivers.find({
    //   _id: { $in: newDriver.driver },
    // });
    // drivers.map(async (driver) => {
    //   if (driver?.fcmToken) {
    //     fcmservice.sendPushMessage(
    //       driver.fcmToken,
    //       "Demande de course",
    //       pushMessage,
    //       pubMsg
    //     );
    //     //store notification in db
    //     const notification = await Notifications.create({
    //       title: "Vous avez un nouveau trajet",
    //       expiry_date: fifteenDays,
    //       receiver: driver.id,
    //     });
    //     //update driver with new notification
    //     await Drivers.findByIdAndUpdate(driver.id, {
    //       $push: {
    //         notifications: notification.id,
    //       },
    //     });
    //   }
    // });
    // }
    //if stetp not added by admin
    if (Object.values(addresses).length < 1) {
      const result = await findDistance(start_address, end_address);
      req.body.distance = result.distance ? result.distance / 1000 : 0;
    } else {
      //if stetp  added by admin
      const result = await findDistance2(start_address, addresses, end_address);
      req.body.distance = result.distance ? (result.distance / 1000).toFixed(1) : 0;
    }
    const updatedTrip = await Trips.findByIdAndUpdate(tripId, {
      ...req.body,
      assigned_drivers: assigned_drivers ? assigned_drivers : null,
    })
      .populate('client')
      .populate('rides')
      .populate('passengers')
      .populate({
        path: 'invited_drivers',
        populate: {
          path: 'driver',
        },
      })
      .populate('assigned_drivers');
    if (!updatedTrip) res.status(404).send('No Trip is Updated');
    res.json({ success: true, updatedTrip });
  } catch (err) {
    console.log('Error ----> ', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

exports.updateEvent = async (req, res) => {
  try {
    const tripId = req.params.tripId;
    const updatedTrip = await Trips.findByIdAndUpdate(tripId, {
      ...req.body,
    })
      .populate('client')
      .populate('rides')
      .populate('passengers')
      .populate({
        path: 'invited_drivers',
        populate: {
          path: 'driver',
        },
      })
      .populate('assigned_drivers');
    if (!updatedTrip) res.status(404).send('No Trip is Updated');
    res.json({ success: true, updatedTrip });
  } catch (err) {
    console.log('Error ----> ', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/**
 * Delete trip
 * @param {object} req
 * @param {object} res
 */
exports.delete = async (req, res) => {
  try {
    const tripId = req.params.tripId;
    const deletedTrip = await Trips.findByIdAndDelete(tripId);
    if (!deletedTrip) return res.status(404).send('No Trip Found');
    const rides = await Rides.deleteMany({
      _id: { $in: deletedTrip?.rides },
    });
    res.json({ success: true, deletedTrip });
  } catch (err) {
    console.log('Error ----> ', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/**
 * Delete multiple trips
 * @param {object} req
 * @param {object} res
 */
exports.deleteMany = async (req, res) => {
  try {
    const { tripIds } = req.body;
    let deletedTrip;
    for (i = 0; i < tripIds.length; i++) {
      deletedTrip = await Trips.findByIdAndDelete(tripIds[i]);
      await Rides.deleteMany({
        _id: { $in: deletedTrip?.rides },
      });
    }
    return res.json({ success: true, deletedTrip });
  } catch (err) {
    console.log('Error ----> ', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Get All Results
exports.paginationTrip = async (req, res) => {
  try {
    const { pageNumber, pageSize } = req.body;
    //Fetching results from database in descending order according to date
    const results = await Trips.find()
      .skip(pageNumber * pageSize)
      .limit(parseInt(pageSize))
      .populate('client')
      .populate('rides')
      .populate('passengers')
      .populate({
        path: 'invited_drivers',
        populate: {
          path: 'driver',
        },
      })
      .populate('assigned_drivers')
      .sort({ date: -1 });
    const totalResults = await Trips.find().countDocuments();
    res.status(200).send({ msg: 'All Results', results, totalResults });
  } catch (error) {
    console.log('Error ----> ', error);
    res.status(500).send('Something Failed');
  }
};
/**
 * Get Trips By Date
 * @param {object} req
 * @param {object} res
 */
exports.TripsByDate = async (req, res) => {
  try {
    const { start_date, end_date, pageNumber, pageSize } = req.body;
    let End_date = new Date(end_date).getTime() + 86400000;
    const trips = await Trips.find({
      $and: [{ date: { $gte: new Date(start_date) } }, { date: { $lt: new Date(End_date) } }],
    })
      .skip(pageNumber * pageSize)
      .limit(parseInt(pageSize))
      .populate('client')
      .populate('rides')
      .populate('passengers')
      .populate({
        path: 'invited_drivers',
        populate: {
          path: 'driver',
        },
      })
      .populate('assigned_drivers')
      .sort({ date: -1 });
    const count = await Trips.find({
      $and: [{ date: { $gte: new Date(start_date) } }, { date: { $lt: new Date(End_date) } }],
    }).countDocuments();
    if (trips) return res.status(200).json({ success: true, trips, count });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/**
 * Get Trips By Driver
 * @param {object} req
 * @param {object} res
 */

exports.TripsByDriver = async (req, res) => {
  try {
    const { pageNumber, pageSize } = req.body;
    let driver = req.body.driver.split(' ');
    let drivers = await Drivers.find({
      first_name: driver[0],
      last_name: driver[1],
    });
    drivers = drivers.filter((e) => {
      return e._id;
    });
    const trips = await Trips.find({
      $or: [{ 'invited_drivers.driver': { $in: drivers } }, { assigned_drivers: { $in: drivers } }],
    })
      .skip(pageNumber * pageSize)
      .limit(parseInt(pageSize))
      .populate('client')
      .populate('rides')
      .populate('passengers')
      .populate({
        path: 'invited_drivers',
        populate: {
          path: 'driver',
        },
      })
      .populate('assigned_drivers')
      .sort({ date: -1 });
    const count = await Trips.find({
      $or: [{ 'invited_drivers.driver': { $in: drivers } }, { assigned_drivers: { $in: drivers } }],
    }).countDocuments();
    if (trips) return res.status(200).json({ success: true, trips, count });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

exports.TripsByClient = async (req, res) => {
  try {
    const { pageNumber, pageSize, status } = req.body;
    let client = req.body.client.split(' ');
    let clients = await Users.find({
      first_name: client[0],
      last_name: client[1],
    });
    clients = clients.filter((e) => {
      return e._id;
    });
    if (status === 'all') {
      const trips = await Trips.find({
        client: { $in: clients },
      })
        .skip(pageNumber * pageSize)
        .limit(parseInt(pageSize))
        .populate('client')
        .populate('rides')
        .populate('passengers')
        .populate({
          path: 'invited_drivers',
          populate: {
            path: 'driver',
          },
        })
        .populate('assigned_drivers')
        .sort({ date: -1 });
      const count = await Trips.find({
        client: { $in: clients },
      }).countDocuments();
      if (trips) return res.status(200).json({ success: true, trips, count });
    } else {
      const trips = await Trips.find({
        client: { $in: clients },
        status: status,
      })
        .skip(pageNumber * pageSize)
        .limit(parseInt(pageSize))
        .populate('client')
        .populate('rides')
        .populate('passengers')
        .populate({
          path: 'invited_drivers',
          populate: {
            path: 'driver',
          },
        })
        .populate('assigned_drivers')
        .sort({ date: -1 });
      const count = await Trips.find({
        client: { $in: clients },
        status: status,
      }).countDocuments();
      if (trips) return res.status(200).json({ success: true, trips, count });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
//Weekly Report
exports.getDailyReport = async (req, res) => {
  try {
    let today = new Date();
    let lastweek = today.getTime() - 604800000;
    today = moment(today).format('YYYY-MM-DD');
    lastweek = moment(lastweek).format('YYYY-MM-DD');
    const reports = await Trips.aggregate([
      {
        $match: {
          date: {
            $gte: new Date(lastweek),
            $lte: new Date(today),
          },
          status: 'completed',
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$date' },
          },
          driver_price: { $sum: '$client_price' },
          turnover: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    return res.status(200).json({ success: true, reports });
  } catch (err) {
    console.log('Error ----> ', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

//Add stop to trip
exports.addStop = async (req, res) => {
  try {
    const tripId = req.params.tripId;
    const trip = await Trips.findById(tripId);
    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not Found' });
    }
    const { addresses } = req.body;
    const result = await findDistance2(trip.start_address, addresses, trip.end_address);
    trip.distance = result.distance ? (result.distance / 1000).toFixed(1) : 0;
    trip.addresses = addresses;
    await trip.save();
    return res.json({ success: true, trip });
  } catch (err) {
    console.log('Error ----> ', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

//Find remaining distance
exports.remainingDistance = async (req, res) => {
  try {
    const tripId = req.params.tripId;
    const trip = await Trips.findById(tripId);
    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not Found' });
    }
    const { address } = req.body;
    const result = await findDistance(trip.end_address, address);
    const remainingDistance =
      parseInt(trip.distance) > parseInt(result.distance)
        ? parseInt(trip.distance) - parseInt(result.distance) / 1000
        : parseInt(result.distance) - parseInt(trip.distance) / 1000;

    return res.json({
      success: true,
      remainingDistance: remainingDistance,
    });
  } catch (err) {
    console.log('Error ----> ', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// //Monthly Revenue
exports.getWeeklyReport = async (req, res) => {
  try {
    let setMonday = new Date();
    setMonday.setDate(setMonday.getDate() - ((setMonday.getDay() + 6) % 7)); //set last monday
    let findMonday = setMonday.getTime() - 604800000; //start monday to the set monday
    setMonday = moment(setMonday).format('YYYY-MM-DD'); //format
    findMonday = moment(findMonday).format('YYYY-MM-DD'); //format
    const reports = await Trips.aggregate([
      {
        $match: {
          date: {
            $gte: new Date(findMonday),
            $lte: new Date(setMonday),
          },
          status: 'completed',
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$date' },
          },
          client_price: { $sum: '$client_price' },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    return res.status(200).json({ success: true, reports });
  } catch (err) {
    console.log('Error ----> ', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
//Get Client Trip
exports.clientTrip = async (req, res) => {
  try {
    const clientId = req.body.client;
    const trips = await Trips.find({ status: 'completed', client: clientId });
    return res.json({ success: true, trips });
  } catch (err) {
    console.log('Error ----> ', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
//5weeks Revenue
exports.getRevenue = async (req, res) => {
  try {
    let setMonday = new Date();
    setMonday.setDate(setMonday.getDate() - ((setMonday.getDay() + 6) % 7)); //set last monday
    let findMonday = setMonday.getTime() - 3024000000; // 5
    let Fir_week = setMonday.getTime() - 2419200000; //4
    let S_week = setMonday.getTime() - 1814400000; //3
    let T_week = setMonday.getTime() - 1209600000; //2
    let Fo_week = setMonday.getTime() - 604800000; //1
    let Fi_week = setMonday; //Fifth week
    setMonday = moment(setMonday).format('YYYY-MM-DD'); //format
    findMonday = moment(findMonday).format('YYYY-MM-DD'); //format
    let reports = await Trips.aggregate([
      {
        $match: {
          date: {
            $gte: new Date(findMonday),
            $lte: new Date(setMonday),
          },
          status: 'completed',
        },
      },
      {
        $group: {
          _id: {
            $week: '$date',
          },
          client_price: { $sum: '$client_price' },
          count: {
            $sum: { $cond: [{ $eq: ['$client_price', 'none'] }, 0, 1] },
          },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    if (reports.length < 6) {
      let dates = [Fi_week, Fo_week, T_week, S_week, Fir_week, findMonday];
      let Weeks = await findWeeks([dates]);
      let missingWeek = Weeks.filter((o1) => !reports.some((o2) => o1 === o2._id));
      missingWeek.map((e) => {
        reports.push({
          _id: e,
          client_price: 0,
          count: 0,
        });
      });
    }
    reports = reports.sort((a, b) => Number(a._id) - Number(b._id));
    return res.status(200).json({ success: true, reports });
  } catch (err) {
    console.log('Error ----> ', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/**
 *
 * @param {object} req
 * @param {object} res
 * @returns Exported pdf
 */

exports.ExportPdf = async (req, res) => {
  try {
    const tripsIds = req.body.trips;
    const company = await Company.findOne();
    const admin = await Admin.findOne();
    const date = new Date();
    let trips = await Trips.find({ _id: { $in: tripsIds } })
      .populate('client')
      .populate('rides')
      .populate('passengers')
      .populate({
        path: 'invited_drivers',
        populate: {
          path: 'driver',
        },
      })
      .populate('assigned_drivers')
      .lean();

    if (trips.length === 0) res.status(404).send('No Trip Found');

    const tripTemplate = fs.readFileSync(path.join(__dirname, '../template/trips.html'), 'utf-8');
    let filteredTrips = {};
    trips.map((trip) => {
      if (!filteredTrips[trip.client._id]) {
        filteredTrips[trip.client._id] = [];

        // Changing format for issue data as desired
        trip['date'] = moment(trip.date).format('DD/MM/YYYY');
        trip['client_price'] = (parseInt(trip.client_price) + parseInt(trip.client_price * 0.2)).toFixed(2);
        filteredTrips[trip.client._id].push(trip);
      } else {
        // Changing format for issue data as desired
        trip['date'] = moment(trip.date).format('DD/MM/YYYY');
        filteredTrips[trip.client._id].push(trip);
      }
    });
    let files = [];
    let obj = {};
    const saveFiles = Object.entries(filteredTrips).map(([key, value]) => {
      let totalPrice = 0;
      value.map((e) => {
        totalPrice = totalPrice + +e.client_price;
      });

      let totalPriceWithoutTax = 0;
      let Vat = ((totalPrice * 20) / 100).toFixed(2);
      totalPriceWithoutTax = (+totalPrice - +Vat).toFixed(2);
      obj = {
        trip: value,
        clientPrice: totalPrice,
        vat: Vat,
        TotalPriceWithoutTax: totalPriceWithoutTax,
        admin_name: 'Maxime Chevallier',
        admin_email: admin.email,
        admin_address: company.address,
        admin_company_name: company.company_name,
        date: moment(date).format('YYYY-MM-DD'),
        logo: `data:image/png;base64,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`,
      };
      let clientName = [];
      if (value.length > 0) {
        clientName = value[0].client.first_name + value[0].client.last_name;
      }
      const filename = Math.random() + clientName + '.pdf';
      const document = {
        html: tripTemplate,
        data: obj,
        path: `./uploads/trips/${filename}`,
      };
      const filepath = `${process.env.BASE_URL}/uploads/trips/${filename}`;
      files.push(filepath);
      return pdf.create(document, {
        formate: 'A4',
        orientation: 'portrait',
        border: '10mm',
      });
    });

    await Promise.all(saveFiles);
    return res.status(200).json({ success: true, files });
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

//Create Pdf

const createPdf = async (tripsIds) => {
  const company = await Company.findOne();
  const date = new Date();
  const admin = await Admin.findOne();
  let trips = await Trips.find({ _id: { $in: tripsIds } })
    .populate('client')
    .populate('rides')
    .populate('passengers')
    .populate({
      path: 'invited_drivers',
      populate: {
        path: 'driver',
      },
    })
    .populate('assigned_drivers')
    .lean();

  if (trips.length === 0) res.status(404).send('No Trip Found');

  const tripTemplate = fs.readFileSync(path.join(__dirname, '../template/trips.html'), 'utf-8');
  let filteredTrips = [];
  trips.map((trip) => {
    if (!filteredTrips[trip.client._id]) {
      filteredTrips[trip.client._id] = [];
    }
    // Changing format for issue data as desired
    trip['date'] = moment(trip.date).format('DD/MM/YYYY');
    filteredTrips[trip.client._id].push(trip);
  });
  let files = [];
  let obj = {};
  const saveFiles = Object.entries(filteredTrips).map(([key, value]) => {
    let totalPrice = 0;
    value.map((e) => {
      totalPrice = totalPrice + e.client_price;
    });
    let totalPriceWithoutTax = 0;
    let Vat = (totalPrice * 20) / 100;
    totalPriceWithoutTax = +totalPrice - +Vat;
    obj = {
      trip: value,
      clientPrice: totalPrice,
      vat: Vat,
      TotalPriceWithoutTax: totalPriceWithoutTax,
      admin_name: 'Maxime Chevallier',
      admin_email: admin.email,
      admin_address: company.address,
      date: moment(date).format('yyyy-mm-dd'),
      admin_company_name: company.company_name,
      logo: `data:image/png;base64,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`,
    };
    let clientName = [];
    if (value.length > 0) {
      clientName = value[0].client.first_name + value[0].client.last_name;
    }
    const filename = Math.random() + clientName + '.pdf';
    const document = {
      html: tripTemplate,
      data: obj,
      path: `./uploads/trips/${filename}`,
      logo: `data:image/png;base64,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`,
    };
    const filepath = `${process.env.BASE_URL}/uploads/trips/${filename}`;
    files.push(filepath);
    return pdf.create(document, {
      formate: 'A4',
      orientation: 'portrait',
      border: '10mm',
    });
  });

  await Promise.all(saveFiles);
  return files;
};

//Find week by date
let findWeeks = async ([dates]) => {
  let weeks = dates.map((i) => {
    i = new Date(i);
    var oneJan = new Date(i.getFullYear(), 0, 1);
    // calculating number of days in given year before a given date
    var numberOfDays = Math.floor((i - oneJan) / (24 * 60 * 60 * 1000));
    // adding 1 since to current date and returns value starting from 0
    var result = Math.ceil((i.getDay() + 1 + numberOfDays) / 7);
    return result;
  });
  return weeks;
};
