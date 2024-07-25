const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
});
UserSchema.plugin(passportLocalMongoose); //this automatically adds username and password

module.exports = mongoose.model("User", UserSchema);
