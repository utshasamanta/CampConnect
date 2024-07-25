const mongoose = require("mongoose");
const Campground = require("../models/campground");

mongoose.connect("mongodb://localhost:27017/yelp-camp");

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const deleteReview = async () => {
    const grounds = await Campground.find({});
    for (let ground of grounds) {
        if (ground.reviews.length !== 0) {
            while (ground.reviews.length !== 0) {
                ground.reviews.pop();
            }
            await ground.save();
        }
    }
};

deleteReview().then(() => {
    mongoose.connection.close(); // closes the mongoose connection
});
