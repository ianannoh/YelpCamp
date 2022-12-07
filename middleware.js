const ExpressError = require('./utilities/ExpressError.js');
const { campSchema, reviewSchema } = require('./Schemas');
const Campground = require('./models/campGround')
const Review = require('./models/reviews')

module.exports.loggedin = (req, res, next) => {
    if(!req.isAuthenticated()){
        req.session.returnTo = req.originalUrl;
    req.flash('error', 'you need to be logged in first');
    return res.redirect('/login')
}
    next();
}

module.exports.validateCamp = (req, res, next) => {
    const { error } = campSchema.validate(req.body)
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next()
    }
}

module.exports.isAuthorized = async(req, res, next) => {
    const {id} = req.params;
    const foundID = await Campground.findById(id);
    if (!foundID.author.equals(req.user._id)) {
        req.flash('error', 'not authorised')
       return res.redirect(`/campgrounds/${id}`);
    }
    next();
};

module.exports.isAuthorizedReview = async(req, res, next) => {
    const {reviewId, id} = req.params;
    const foundID = await Review.findById(reviewId);
    if (!foundID.author.equals(req.user._id)) {
        req.flash('error', 'not authorised')
       return res.redirect(`/campgrounds/${id}`);
    }
    next();
};

module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body)
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next()
    }
}