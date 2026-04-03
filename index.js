if(process.env.NODE_ENV !="production"){
    require("dotenv").config();
}

const express = require("express");
const mongoose = require("mongoose");
const Event = require("./models/event");
const ExpressError=require("./utils/ExpressError.js");
const engine = require("ejs-mate");
const MongoStore = require('connect-mongo').default;
const expressLayouts = require("express-ejs-layouts");
const path = require("path");
const methodOverride = require("method-override");
const session = require("express-session");
const flash = require("connect-flash");
const User = require("./models/user");
const passport=require("passport");
const LocalStrategy=require("passport-local");
const userRouter=require("./routes/user.js");
const {isLoggedIn}=require("./middleware.js");

const multer=require('multer');
const {storage}=require("./cloudConfig.js");
const upload = multer({storage});



const app = express();

const dburl=process.env.ATLASDB_URL;

main().then(res=>console.log("connected to database")).catch(err => console.log(err));

async function main() {
  await mongoose.connect(dburl, {
    tls: true,
    tlsAllowInvalidCertificates: true
});
}


app.engine("ejs", engine);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use(expressLayouts);
app.set("layout", "layouts/boilerplate");


const store = MongoStore.create({
    mongoUrl: dburl,
    crypto: {
        secret: process.env.SECRET,
    },
    touchAfter: 24 * 3600,
});
store.on("error",(err)=>{
    console.log("ERROR IN MONGO SESSION STORE",err);
});


const sessionOptions={
    secret : "mysupersecretcode",
    resave: false,
    saveUninitialized:true,
    cookie:{
        expires:Date.now()+7*24*60*60*1000,
        maxAge: 7*24*60*60*1000,
        httpOnly: true,
    },
};


app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use((req,res,next)=>{
    res.locals.success=req.flash("success");
    res.locals.error=req.flash("error");
    res.locals.currUser=req.user;
    next();
});


app.use("/user",userRouter);

//get new event
app.get("/events/new", isLoggedIn,(req, res) => {
    res.render("listings/new.ejs");
});

// CREATE EVENT
app.post("/events" ,isLoggedIn, upload.single("event[image]") , async (req, res) => {
    try {
         if (!req.file) {
        return res.status(400).send("No image uploaded");
        }
        console.log(req.file);
        let url=req.file.path;
        let filename=req.file.filename;
        const newEvent = new Event(req.body.event);
        let userid=req.user._id
        newEvent.owner =userid;
        newEvent.image={url,filename};
        await newEvent.save();
        await User.findByIdAndUpdate(
         req.user._id,
        { $push: { createdEvents: newEvent._id } },
        { new: true }
        );
        res.redirect("/events");
    } catch (err) {
        console.log(err);
        res.status(500).send("Error creating event");
    }
});

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
app.get("/events/:id", isLoggedIn,async (req, res) => {
    try {
        const { id } = req.params;

        const event = await Event.findById(id).populate("owner");
        console.log(event);
        if (!event) {
            return res.status(404).send("Event not found");
        }

        res.render("listings/show", { event });

    } catch (err) {
        console.log(err);
        res.status(500).send("Something went wrong");
    }
});

//get edit
app.get("/events/:id/edit",isLoggedIn, async (req, res) => {

    const { id } = req.params;

    // find event by id from database
    const event = await Event.findById(id);
     if(!event){
        req.flash("error","event you requested for doesnot exists");
        return res.redirect("/listings");
    }

     let originalImageUrl=event.image.url;
     originalImageUrl=originalImageUrl.replace("/upload","/upload/h_300,w_250");

    // render edit page and send event data
    res.render("listings/edit", { event ,originalImageUrl});

});

//event registration
app.get("/events/:id/register",isLoggedIn,async(req,res)=>{
       try{
          const {id}=req.params;
           let userid=req.user._id;
            await Event.findByIdAndUpdate(
                id,
                { $addToSet: {  registration: userid } },
                );
            await User.findByIdAndUpdate(
                userid,
                { $addToSet: {registerEvents : id } },
                );   
            console.log("success");
            res.redirect(`/events/${id}`); 
       } catch (err) {
        console.log(err);
        res.status(500).send("Error in registration");
    }     
});



//put edit 
app.put("/events/:id", isLoggedIn,  upload.single("event[image]") , async (req, res) => {

    // extract event id from URL
    const { id } = req.params;

    // update event using form data
    let event = await Event.findByIdAndUpdate(id, req.body.event);

    if(typeof req.file!=="undefined"){
       let url=req.file.path;
       let filename=req.file.filename;
       event.image={url,filename};
       await event.save();
    }
    req.flash("success","Listing Updated!")
    // redirect to event details page after update
    res.redirect(`/events/${id}`);

});


//delete event
app.delete("/events/:id", isLoggedIn,async (req, res) => {
    const { id } = req.params;
    
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).send("Event not found");
    }
    //  // 🟢 DELETE IMAGE FROM CLOUDINARY
    // if (event.image && event.image.filename) {
    //   await cloudinary.uploader.destroy(event.image.filename);
    // }

    let deletedlisting= await Event.findByIdAndDelete(id);
   
    

    res.redirect("/events");

});



app.get("/", (req, res) => {
    res.render("listings/landing");
});

// 404 handler
app.use((req, res, next) => {
     next(new ExpressError(404, "Page Not Found!"));
});

// error middleware
app.use((err, req, res, next) => {
    let { statusCode = 500, message = "Something went wrong" } = err;
    res.status(statusCode).render("listings/error.ejs",{err});
    // res.status(statusCode).send(message);
});



app.listen(8080, () => {
    console.log("Server running on port 8080");
});

