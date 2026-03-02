const mongoose = require("mongoose");

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
    type: String,
    default: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30"
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
    }

});

module.exports = mongoose.model("Event", eventSchema);