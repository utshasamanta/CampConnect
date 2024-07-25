const Campground = require("../models/campground");
const { cloudinary } = require("../cloudinary/index");
const maptilerClient = require("@maptiler/client");
maptilerClient.config.apiKey = process.env.MAPTILER_KEY;

module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render("campgrounds/index", { campgrounds });
};

module.exports.renderNewForm = (req, res) => {
    res.render("campgrounds/new");
};

module.exports.createCampground = async (req, res, next) => {
    const geoData  = await maptilerClient.geocoding.forward(req.body.campground.location, { limit: 1});
    const newCampground = new Campground(req.body.campground);
    newCampground.geometry = geoData.features[0].geometry;
    newCampground.images = req.files.map((f) => ({
        url: f.path,
        filename: f.filename,
    }));
    newCampground.author = req.user._id;
    await newCampground.save();
    req.flash("success", "Successfully made a new campground!");
    res.redirect(`/campgrounds/${newCampground._id}`);
};

module.exports.showCampground = async (req, res) => {
    const { id } = req.params;
    const ground = await Campground.findById(id)
        .populate({ path: "reviews", populate: { path: "author" } })
        .populate("author");
    if (!ground) {
        req.flash("error", "Cannot find that campground");
        return res.redirect("/campgrounds");
    }
    res.render("campgrounds/show", { ground });
};

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const ground = await Campground.findById(id);
    if (!ground) {
        req.flash("error", "Cannot find that campground");
        return res.redirect("/campgrounds");
    }
    if (!ground.author.equals(req.user._id)) {
        req.flash("error", "You do not have permission to do that!");
        return res.redirect(`/campgrounds/${id}`);
    }
    res.render("campgrounds/edit", { ground });
};

module.exports.editCampground = async (req, res) => {
    const { id } = req.params;
    const geoData = await maptilerClient.geocoding.forward(req.body.campground.location, {limit: 1});
    const ground = await Campground.findByIdAndUpdate(
        id,
        { ...req.body.campground },
        { new: true, runValidators: true }
    );
    const imgs = req.files.map((f) => ({ url: f.path, filename: f.filename }));
    ground.images.push(...imgs);
    ground.geometry = geoData.features[0].geometry;
    await ground.save();
    if (req.body.deleteImages) {
        for(let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await ground.updateOne({
            $pull: { images: { filename: { $in: req.body.deleteImages } } },
        });
    }
    req.flash("success", "Successfully updated campground!");
    res.redirect(`/campgrounds/${ground._id}`);
};

module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash("success", "Successfully deleted campground!");
    res.redirect("/campgrounds");
};
