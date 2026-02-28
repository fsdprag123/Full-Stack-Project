const express = require("express");
const mongoose = require("mongoose");
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

app.get("/", (req, res) => {
    res.render("landing");
});

app.listen(8080, () => {
    console.log("Server running on port 8080");
});