const express = require('express');
const router = express.Router({mergeParams: true});
const user = require('../controllers/user')
const catchAsync = require('../utilities/catchAsync');
const passport = require('passport');

router.get('/register', user.signupForm);

router.get('/login', user.loginForm)

router.get('/logout', user.logout)
 
router.post('/register', catchAsync(user.registerUser));

router.post('/login', passport.authenticate('local', {failureFlash: true, failureRedirect: '/login'}), user.login);

module.exports = router;