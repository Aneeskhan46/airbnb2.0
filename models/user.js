const mongoose = require("mongoose");
const passportLocalMongoose = require('passport-local-mongoose');

//creating schema
const userSchema = new mongoose.Schema({
    email:{
        type:String,
        required:true
    },
});

userSchema.plugin(passportLocalMongoose);


//directly we export //creating model
module.exports = mongoose.model("User",userSchema)