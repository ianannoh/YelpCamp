const Campground = require('../models/campGround');
const Review = require('../models/reviews');

module.exports.addReview = async(req, res) => {
    const {id} = req.params;
    const foundID = await Campground.findById(id);
    const newReview = new Review(req.body)
    foundID.reviews.push(newReview);
    newReview.author = req.user._id;
    await foundID.save()
    await newReview.save()
    req.flash('success', 'Review added successfully');
    res.redirect(`/campgrounds/${id}`)
};

module.exports.deleteReview = async(req, res) => {
    const {id, reviewId} = req.params;
    await Campground.findByIdAndUpdate(id, {$pull: {reviews: reviewId}})
    req.flash('success', 'Successfully deleted review');
    await Review.findByIdAndDelete(reviewId)
    res.redirect(`/campgrounds/${id}`)
};