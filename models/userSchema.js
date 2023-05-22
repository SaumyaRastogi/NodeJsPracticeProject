const mongoose = require("mongoose")

const userSchema = new mongoose.Schema(
    {
        userName : {
            type: String,
            required: true,
            unique: true
        },
        email : {
            type : String,
            required : true
        },
        role : {
            type : String,
            required: true
        },
        isAdmin : {
            type : Boolean,
            required: true
        },
        contact : {
            type: Number,
            required: true
        },
        skills : {
            type : [String],
            required : true
        },
        password : {
            type : String,
            required : true
        }
    }
)

const userModel = mongoose.model("User", userSchema);
module.exports = userModel