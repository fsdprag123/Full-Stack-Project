const mongoose = require("mongoose");
const Event = require("../models/event");
const events = require("./eventdata");

mongoose.connect("mongodb://127.0.0.1:27017/stayfinder")
.then(() => console.log("MongoDB Connected"))
.catch((err) => console.log(err));

const initDB = async () => {
    await Event.deleteMany({});
    await Event.insertMany(events);
    console.log("Database Initialized with Events");
};

initDB();