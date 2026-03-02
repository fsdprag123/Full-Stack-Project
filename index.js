const express = require("express");
const mongoose = require("mongoose");
const Event = require("./models/event");
const expressLayouts = require("express-ejs-layouts");
const path = require("path");

const app = express();

mongoose.connect("mongodb://127.0.0.1:27017/stayfinder")
.then(() => {
    console.log("MongoDB Connected");
})
.catch((err) => {
    console.log(err);
});

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use(expressLayouts);
app.set("layout", "layouts/boilerplate");


// GET route to display all events
app.get("/events", async (req, res) => {
    try {
        const events = await Event.find({});
        res.render("listings/index", { events });
    } catch (err) {
        console.log(err);
        res.send("Error fetching events");
    }
});

//GEt show route
app.get("/events/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const event = await Event.findById(id);

        if (!event) {
            return res.status(404).send("Event not found");
        }

        res.render("listings/show", { event });

    } catch (err) {
        console.log(err);
        res.status(500).send("Something went wrong");
    }
});

app.get("/", (req, res) => {
    res.render("listings/landing");
});

app.listen(8080, () => {
    console.log("Server running on port 8080");
});

