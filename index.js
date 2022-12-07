if (process.env.NODE_ENV !== "production") {
    require('dotenv').config()
}
//this means if we are in development require the dotenv package


const sanitize = require('express-mongo-sanitize');
const mongo = process.env.MONGO_URL || 'mongodb://localhost:27017/yelpCamp' ;
const express = require('express')
const app = express()
const path = require('path')
const Campground = require('./models/campGround')
const ejsmate = require('ejs-mate')
const catchAsync = require('./utilities/catchAsync.js')
const ExpressError = require('./utilities/ExpressError.js')
const {campSchema, reviewSchema} = require('./Schemas')
const campgrounds = require('./routes/campgrounds')
const mongoose = require('mongoose')
const reviews = require('./routes/reviews');
const session = require('express-session')
const flash = require('connect-flash')
const passport = require('passport');
const passportLocal = require('passport-local');
const User = require('./models/user');
const userRoutes = require('./routes/userroute');
const MongoStore = require('connect-mongo');

main().catch(err => console.log(err));
async function main() {
    await mongoose.connect(mongo);
    console.log('connected')
}



const methodOverride = require('method-override')


app.engine('ejs', ejsmate)

/*const store = new MongoStore({
    url: 'mongodb://localhost:27017/yelpCamp',
    secret: 'secret',
    touchAfter: 24 * 3600 // in seconds
})
store.on('error', function(e) {
    console.log('STORE ERROR', e)
})

const sessionOptions = {
    store,
    secret: 'secret', resave: false, saveUninitialized: true
};*/







app.use(session({secret: 'secret', resave: false, saveUninitialized: true}));
app.use(flash())
app.use(methodOverride('_method'))
app.use(express.static(path.join(__dirname, 'public')))
app.use(express.urlencoded({ extended: true })) //to parse req.body for a post request
app.use(sanitize())
app.use(passport.initialize());
app.use(passport.session());
passport.use(new passportLocal(User.authenticate()))
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success')
    res.locals.error = req.flash('error')
    next()
})

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))



app.use('/campgrounds', campgrounds);

app.use('/campgrounds/:id/reviews', reviews);

app.get('/', (req, res) => {
    res.send('Welcome to YelpCamp')
})

app.use('/', userRoutes);

app.all('*', (req, res, next) => {
    next(new ExpressError('Non-existent', 404))
})
 
app.use((err, req, res, next) => {
    const { statusCode = 500 } = err
    console.log(err)
    if (!err.message) err.message = 'Probelem'
    res.status(statusCode).render('error', { err })
})

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`port ${port}`)
})