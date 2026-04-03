const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose").default;

const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required:true,
    },
    branch: {
        type: String,
        required: true,
    },
    year : {
        type: Number,
        required : true,
    },
    registerEvents : 
    [
        {
            type : Schema.Types.ObjectId,
            ref: "Event",
        },
    ],
    
    createdEvents :
    [
        {
        type : Schema.Types.ObjectId,
        ref: "Event",
        }
    ]
});

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSchema);