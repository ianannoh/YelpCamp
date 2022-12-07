const express = require('express');
const router = express.Router({ mergeParams: true });
const catchAsync = require('../utilities/catchAsync.js')
const campgrounds = require('../controllers/campground')
const Campground = require('../models/campGround')
const multer = require('multer');
const {loggedin, validateCamp, isAuthorized} = require('../middleware');
const {storage} = require('../cloudinary/index')
const upload = multer({storage});

router.route('/')
    .get(catchAsync(campgrounds.allCamps))
    .post( loggedin,  upload.array('image'),validateCamp, catchAsync(campgrounds.addCamp));
    

router.get('/new', loggedin, campgrounds.newCampForm);


router.route('/:id')
    .get(campgrounds.showPage)
    .put( loggedin, isAuthorized, upload.array('image'), validateCamp, catchAsync(campgrounds.editCamp))
    .delete(loggedin, isAuthorized, catchAsync(campgrounds.deleteCamp));

router.get('/:id/edit', loggedin, isAuthorized, catchAsync(campgrounds.editCampForm));

module.exports = router;