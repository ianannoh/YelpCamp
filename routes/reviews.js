const express = require('express');
const router = express.Router({mergeParams: true});
const catchAsync = require('../utilities/catchAsync.js');
const {validateReview, loggedin, isAuthorizedReview} = require('../middleware');
const review = require('../controllers/reviews');




router.post('/', loggedin, validateReview, catchAsync(review.addReview))
 
router.delete('/:reviewId', loggedin, isAuthorizedReview, catchAsync(review.deleteReview))
 
module.exports = router;