const User = require('../models/user');

module.exports.signupForm = (req, res) => {
    res.render('./user/register')
}

module.exports.loginForm = (req, res) => {
    res.render('./user/login')
};

module.exports.logout = async(req, res) => {
    try{
    await req.logout( (e) => {
        req.flash('success', 'bye');
    res.redirect('/campgrounds')
    if(e) return console.log(e);
    });
    } catch(e) {
        console.log(e)
    } 
}

module.exports.registerUser = async(req, res, next) => {
    try{
    const {username, email, password} = req.body;
    const newUser = await new User({email, username});
    const registeredUser = await User.register(newUser, password);
    req.login(registeredUser, err => {
        if (err) return next(err)
        req.flash('success', 'Welcome to Yelpcamp')
    res.redirect('/campgrounds')
    })
     
    } catch (e) {
        req.flash('error', e.message);
        res.redirect('/register');
    }
};

module.exports.login = (req, res) => {
    req.flash('success', 'Welcome back');
    const redirect = req.session.returnTo || '/campgrounds';
    delete req.session.returnTo;
    res.redirect(redirect);
};