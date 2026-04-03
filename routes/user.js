const express=require("express");
const router = express.Router();
const wrapAsync=require("../utils/wrapAsync.js");
const User=require("../models/User.js");
const Event=require("../models/event.js");
const passport=require("passport");

router.get("/signup", (req, res) => {
    res.render("users/signup");
});

router.post("/signup",wrapAsync(async (req,res)=>{
    let {username,email,password,name,branch,year}=req.body;
    const newUser= new User({email,username,name,branch,year});
    const registerUser=await User.register(newUser,password);
     console.log(registerUser);
     req.login(registerUser,(err)=>{
        if(err){
            return next(err);
        }
     })
     req.flash("success","welcome college event portal");
     res.redirect("/events");
}));

router.get("/login", (req, res) => {
    
    res.render("users/login");
});

router.post("/login",
    passport.authenticate("local",
    {failureRedirect:'/user/login',
    failureFlash:true}),
    wrapAsync(async (req,res)=>{
     req.flash("success","welcome to event portal");
    
     res.redirect("/events");
}));

router.get("/logout",(req,res,next)=>{
    req.logout((err)=>{
        if(err){
          return  next(err);
        }
        req.flash("success","you are logged out!");
        res.redirect("/events");
    })
});

router.get("/profile", (req, res) => {
    const user = req.user; 

    res.render("users/profile.ejs", { user });
});

router.get("/createdevents",  async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate("createdEvents");
        console.log(user);
        res.render("users/created.ejs", { 
            events: user.createdEvents
        });

    } catch (err) {
        console.log(err);
        res.send("Error fetching events");
    }
});

router.get("/registerevents",  async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate("registerEvents");
        console.log(user);
        res.render("users/registeredevents.ejs", { 
            events: user.registerEvents,
        });

    } catch (err) {
        console.log(err);
        res.send("Error fetching events");
    }
});

router.get("/:id/registrations", async (req, res) => {
    try {
        const { id } = req.params;
        const event = await Event.findById(id).populate("registration");
        if (!event) {
            return res.send("Event not found");
        }
        res.render("users/registrations.ejs", {
            users: event.registration
        });
    } catch (err) {
        console.log(err);
        res.send("Error fetching registrations");
    }
});

module.exports = router; 