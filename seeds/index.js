if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const mongoose = require("mongoose");
const axios = require("axios");
const cities = require("./cities");
const Campground = require("../models/campground"); //double dot because backed out to main directory
const { descriptors, places } = require("./seedHelpers");
const maptilerClient = require("@maptiler/client");
maptilerClient.config.apiKey = process.env.MAPTILER_KEY;


mongoose.connect("mongodb://localhost:27017/yelp-camp");

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const randArray = (array) => array[Math.floor(Math.random() * array.length)];
async function seedImg() {
    try {
        const resp = await axios.get("https://api.unsplash.com/photos/random", {
            params: {
                client_id: "z2XpSRXHpQNFp1dPrX59S1K8wJpn7JTHUm60wQ4EJa8",
                collections: 1114848,
            },
        });
        return resp.data.urls.regular;
    } catch (err) {
        console.error(err);
    }
}

const geoCode = async (location) => {
    const geoData = await maptilerClient.geocoding.forward(location, {
        limit: 1,
    });
    return geoData.features[0].geometry;
};

const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 50; i++) {
        const rand = Math.floor(Math.random() * 1000); //there  are 1000 cities
        const camp = new Campground({
            location: `${cities[rand].city}, ${cities[rand].state}`,
            title: `${randArray(descriptors)} ${randArray(places)}`,
            images: [
                {
                    url: "https://res.cloudinary.com/dtbvrygyd/image/upload/v1720451188/YelpCamp/nefgr6odiurhjo16ayey.jpg",
                    filename: "YelpCamp/nefgr6odiurhjo16ayey",
                },
                {
                    url: "https://res.cloudinary.com/dtbvrygyd/image/upload/v1720451188/YelpCamp/taearg0okezlgifeai4f.jpg",
                    filename: "YelpCamp/taearg0okezlgifeai4f",
                },
            ],
            author: "66871171c772a4ab69941203",
            price: 15,
            geometry: await geoCode(`${cities[rand].city}, ${cities[rand].state}`),
            description:
                "Lorem ipsum dolor sit amet consectetur adipisicing elit. Delectus, ullam assumenda. Obcaecati hic nesciunt optio, quae asperiores nihil, commodi quis earum alias maxime maiores perferendis fugit!",
        });
        await camp.save();
    }
};

seedDB().then(() => {
    mongoose.connection.close(); // closes the mongoose connection
});








