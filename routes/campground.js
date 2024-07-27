const express = require("express");
const router = express.Router();
const campgrounds = require('../controllers/campgrounds.js')
const catchAsync = require("../utils/catchAsync");
const ExpressError = require("../utils/ExpressError");
const multer  = require('multer')
const { storage } = require('../cloudinary/index.js');
const { isLoggedIn, isAuthor, validateCampground, validateCampgroundMulter } = require('../middleware.js');
const upload = multer({ 
    storage,
    fileFilter: function (req, file, cb) {
        try {
            validateCampgroundMulter(req.body) // doing this to validate the fields first if any image uploaded
        } catch (err) {
            return cb(err, false);
        }

        const alloweTypes = ['image/png', 'image/jpg', 'image/jpeg'];
        if (!alloweTypes.includes(file.mimetype)) {
           console.log("hello!");
           return cb(new ExpressError("Only takes png, jpg, jpeg", 400), false);
        }
        cb(null, true);
    }
})

router.route('/')
    .get(catchAsync(campgrounds.index))
    .post(isLoggedIn, upload.array('image'), validateCampground, catchAsync(campgrounds.createCampground));


router.get("/new", isLoggedIn, campgrounds.renderNewForm);

router.route('/:id')
    .get(catchAsync(campgrounds.showCampground))
    .put(isLoggedIn, isAuthor, upload.array('image'), validateCampground, catchAsync(campgrounds.editCampground))
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground));

router.get("/:id/edit", isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm));


module.exports = router;