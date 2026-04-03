const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const eventSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true,
        trim: true
    },

    theme: {
        type: String,
        required: true
    },

    image: {
       url:String,
       filename:String,
    },

    dateTime: {
        type: Date,
        required: true
    },

    venue: {
        type: String,
        required: true
    },

    description: {
        type: String,
        required: true
    },

    organizer: {
        type: String,
        required: true
    },

    registrationFee: {
        type: Number,
        default: 0
    },

    prizesAndBenefits: {
        type: String
    },

    contactNumber: {
        type: String,
        required: true
    },

    whatsappLink: {
        type: String
    },

    socialMediaLinks: {
        type: [String]  // array of links (Instagram, Facebook, etc.)
    },

    createdAt: {
        type: Date,
        default: Date.now
    },
   
    owner:{
        type: Schema.Types.ObjectId,
        ref:"User",
    },
   
    registration:[
        {
             type: Schema.Types.ObjectId,
             ref:"User", 
        }
    ]

});



module.exports = mongoose.model("Event", eventSchema);