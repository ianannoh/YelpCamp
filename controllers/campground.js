const Campground = require('../models/campGround');
const {cloudinary} = require('../cloudinary'); //automatically looks for an index.js file

module.exports.allCamps = async (req, res) => {
    const campgrounds = await Campground.find({})
    res.render('campgrounds/allcampgrounds', { campgrounds })
}

module.exports.newCampForm = (req, res) => {
    res.render('campgrounds/create')
}

module.exports.showPage = async (req, res) => {
    try {
        const { id } = req.params;
        const foundID = await Campground.findById(id).populate({
            path: 'reviews',
            populate: {
                path: 'author'
            }
        }).populate('author');
        res.render('campgrounds/show', { foundID })
    } catch (error) {
        req.flash('error', 'Cannot find camp');
        console.log(error)
        return res.redirect('/campgrounds')
    }
};

module.exports.editCampForm = async (req, res) => {
    const { id } = req.params;
    const foundID = await Campground.findById(id);
    if (!foundID) {
        req.flash('error', 'Cannot find camp')
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/update', { foundID })
};

module.exports.editCamp = async (req, res, next) => {
    const { id } = req.params;
    const foundID = await Campground.findById(id);
    if (!foundID.author.equals(req.user._id)) {
        req.flash('error', 'not authorised')
       return res.redirect(`/campgrounds/${id}`);
    }
    const campUpdate = await Campground.findByIdAndUpdate(id, req.body, { runValidators: true });
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename}));
    campUpdate.image.push(...imgs);
    campUpdate.save();
    if (req.body.deleteImages) {
        for (let f of req.body.deleteImages){
            await cloudinary.uploader.destroy(f);
        }
        await foundID.updateOne({ $pull: {image: { filename: {$in: req.body.deleteImages}}}});
    }
    req.flash('success', 'Updated camp successfully');
    res.redirect(`/campgrounds/${campUpdate._id}`)
};

module.exports.addCamp = async (req, res, next) => {
    const newCamp = new Campground(req.body);
    newCamp.image = req.files.map(f => ({ url: f.path, filename: f.filename}));
    newCamp.author = req.user._id;
    await newCamp.save()
    req.flash('success', 'Created camp successfully');
    res.redirect(`/campgrounds/${newCamp._id}`)
};

module.exports.deleteCamp = async (req, res) => {
    const { id } = req.params
    const foundID = await Campground.findById(id)
    await foundID.deleteOne()
    req.flash('success', 'Successfully deleted camp');
    res.redirect('/campgrounds')
};