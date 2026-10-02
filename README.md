# YelpCamp

A full-stack campground review web application built with **Node.js**, **Express**, **MongoDB**, and **EJS**. Users can register, log in, browse campgrounds, add campgrounds with multiple images, leave star ratings and reviews, and manage (edit/delete) their own content.

This is a classic "YelpCamp" project — the canonical Colt Steele Web Developer Bootcamp capstone — implemented with the MVC-style folder layout (`routes/ → controllers/ → models/`), Express middleware, Joi validation, Passport authentication, Cloudinary image hosting, and `connect-mongo` session storage.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Running the App](#running-the-app)
- [Seeding the Database](#seeding-the-database)
- [Project Structure](#project-structure)
- [Routing](#routing)
- [Data Models](#data-models)
- [Middleware](#middleware)
- [Views](#views)
- [Image Uploads](#image-uploads)
- [Scripts](#scripts)
- [Deployment](#deployment)
- [Known Issues & Caveats](#known-issues--caveats)
- [License](#license)

---

## Features

- **Authentication** — registration and login via Passport's `local` strategy with hashed passwords (`passport-local-mongoose`). Session-based, with "return to original page after login" behaviour.
- **Campground CRUD** — create, view (index + detail), update, and delete campgrounds. Create/update support multiple image uploads.
- **Reviews & Ratings** — authenticated users can leave a 1–5 star rating plus a written body on any campground. Reviews are only deletable by their author.
- **Authorization** — only the author of a campground can edit or delete it; only the author of a review can delete it. Unauthorised attempts flash an error and redirect.
- **Flash messaging** — success/error notifications via `connect-flash`, rendered as Bootstrap alerts.
- **Form validation** — server-side Joi validation for campground and review payloads, plus Bootstrap 5 client-side validation on forms.
- **Cloudinary images** — uploads go straight to Cloudinary via `multer-storage-cloudinary`; deleting an image on edit destroys the Cloudinary asset. A CSS `thumbnail` virtual rewrites the Cloudinary URL for previews.
- **Database-backed sessions** — `connect-mongo` stores sessions in a separate `session-db` database.
- **Bootstrap 5 UI** with a shared EJS layout (`ejs-mate`) and partials for navbar, flash messages, and footer. Star rating widget styled by a pure-CSS "starability" stylesheet.
- **Custom error handling** — 404 catch-all and a central error handler rendering `views/error.ejs`.
- **NoSQL injection hardening** — `express-mongo-sanitize` sanitizes `req.body`, `req.query`, and `req.params`.
- **Seed data** — a script generates 50 randomly titled campgrounds across real US cities.

---

## Tech Stack

| Layer | Technology |
| --- | --- |
| Runtime | Node.js (CommonJS) |
| Framework | Express 4.18 |
| View engine | EJS 3.1 with `ejs-mate` layouts |
| Database | MongoDB via Mongoose 6.7 |
| Auth | Passport 0.6 (`local` + `passport-local-mongoose`) |
| Sessions | `express-session` 1.17 + `connect-mongo` 4.6 |
| Flash messages | `connect-flash` 0.1 |
| Validation | Joi 17.7 |
| File uploads | Multer 1.4 + `multer-storage-cloudinary` 4 |
| Image CDN | Cloudinary 1.32 |
| Security | `express-mongo-sanitize` 2.2 |
| Other | `method-override` 3 (HTML form PUT/DELETE), `dotenv` 16, `sanitize-html` 2.7 (declared) |
| CSS | Bootstrap 5.2 (CDN) + `public/stylesheets/star.css` |
| Tests | None |

> `sanitize-html` is listed in `package.json` but is not `require`d anywhere in the current source.

---

## Prerequisites

- **Node.js** 14+ (developed against Node 16/18; CommonJS syntax)
- **npm** 6+
- **MongoDB** running locally (or a reachable connection string)
- A free **Cloudinary** account (required for image uploads)

---

## Installation

```bash
# 1. Install dependencies
npm install

# 2. Create your environment file
#    (on Windows: copy .env.example .env)
cp .env.example .env

# 3. Edit .env and fill in your values (see table below)

# 4. Start the server
npm start
```

The app listens on `PORT` (default `3000`) → <http://localhost:3000>

> **Note:** `dotenv` is only loaded when `NODE_ENV !== "production"` (see `index.js:1`). In production you must supply the variables through the real environment.

---

## Environment Variables

Create a `.env` file in the project root (already in `.gitignore`):

| Variable | Required | Default | Used in | Purpose |
| --- | :---: | --- | --- | --- |
| `NODE_ENV` | – | `undefined` | `index.js:1` | When not `"production"`, `dotenv` is loaded |
| `MONGO_URL` | – | `mongodb://localhost:27017/yelpCamp` | `index.js:8` | Mongoose connection string |
| `PORT` | – | `3000` | `index.js:25` | HTTP port |
| `SECRET` | ✅ | `'secret'` | `index.js:56` | Session signing secret |
| `CLOUDINARY_CLOUD_NAME` | ✅ | – | `cloudinary/index.js:5` | Cloudinary cloud name |
| `CLOUDINARY_KEY` | ✅ | – | `cloudinary/index.js:6` | Cloudinary API key |
| `CLOUDINARY_SECRET` | ✅ | – | `cloudinary/index.js:7` | Cloudinary API secret |

Example `.env`:

```dotenv
NODE_ENV=development
MONGO_URL=mongodb://localhost:27017/yelpCamp
PORT=3000
SECRET=change-me-to-a-long-random-string

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_KEY=your_api_key
CLOUDINARY_SECRET=your_api_secret
```

Get the three Cloudinary values from your
[Cloudinary console](https://console.cloudinary.com/settings/api-keys).

Sessions are written to the Mongo database **`session-db`** (`index.js:60`), separate from the app database.

---

## Running the App

```bash
npm start          # node index.js
```

On boot the app:

1. Loads `.env` if `NODE_ENV !== "production"`.
2. Connects Mongoose to `MONGO_URL` (logs `connected`).
3. Registers `ejs-mate` as the EJS engine.
4. Sets up the Mongo session store, flash, `method-override`, static files, URL-encoded body parsing, and `express-mongo-sanitize`.
5. Initialises Passport and injects `res.locals.currentUser`, `res.locals.success`, `res.locals.error` for every view.
6. Mounts the routers, a 404 catch-all, and the error handler.
7. Listens and logs `port <PORT>`.

### First-time usage

1. Go to <http://localhost:3000/register> and create an account (you are logged in immediately).
2. Click **Add a camp** and create your first campground.

---

## Seeding the Database

The seed script wipes the campgrounds collection and generates **50** random campgrounds across real US cities, each with a descriptive title, Lorem Ipsum body, random price, and two images (one external Freepik URL, one Cloudinary URL).

> ⚠️ **`seedDB()` calls `Campground.deleteMany({})` — it destroys all existing campgrounds.**

```bash
node seeds/seedsindex.js
```

Details:

- Connects to a **hardcoded** `mongodb://localhost:27017/yelpCamp` (it ignores `MONGO_URL`).
- Assigns every campground a **hardcoded** author ObjectId (`638005aca5424517dbd25565`).
- Closes the connection once seeding finishes.

| File | Role |
| --- | --- |
| `seeds/seedsindex.js` | Entry point — connects, clears, inserts, closes |
| `seeds/seedhelpers.js` | 18 `descriptors` + 21 `places` word lists used to build titles |
| `seeds/cities.js` | 1,000 US city records (`city`, `state`, `latitude`, `longitude`, `population`, `rank`, `growth_from_2000_to_2013`) |

There is **no `npm run seed` script** — invoke the file directly. Because of the hardcoded author id, seeded campgrounds are only editable if that id matches a user you create locally (otherwise you can view but not edit them).

---

## Project Structure

```
YelpCamp/
├── index.js                     # App entry: config, middleware, router mounting, error handling
├── middleware.js                # Auth, ownership, and Joi validation middleware
├── Schemas.js                   # Joi validation schemas (campground, review)
├── package.json
│
├── routes/                      # Express routers (URL definitions + middleware chains)
│   ├── campgrounds.js           #   mounted at /campgrounds
│   ├── reviews.js               #   mounted at /campgrounds/:id/reviews
│   └── userroute.js             #   mounted at /
│
├── controllers/                 # Request handlers (business logic)
│   ├── campground.js            #   7 handlers
│   ├── reviews.js               #   2 handlers
│   └── user.js                  #   5 handlers
│
├── models/                      # Mongoose schemas
│   ├── campGround.js
│   ├── reviews.js
│   └── user.js
│
├── utilities/                   # Small shared helpers
│   ├── catchAsync.js            #   async handler wrapper
│   └── expressError.js          #   HTTP error class
│
├── cloudinary/
│   └── index.js                 # Cloudinary config + multer storage engine
│
├── seeds/
│   ├── seedsindex.js            # Seeder entry point
│   ├── seedhelpers.js           # Word lists
│   └── cities.js                # 1000 US cities
│
├── views/                       # EJS templates (ejs-mate layouts + partials)
│   ├── error.ejs
│   ├── layouts/
│   │   └── boilerplates.ejs     #   The single shared layout
│   ├── partials/
│   │   ├── navbar.ejs
│   │   ├── flash.ejs
│   │   └── footer.ejs
│   ├── campgrounds/
│   │   ├── home.ejs             #   GET /
│   │   ├── allcampgrounds.ejs   #   GET /campgrounds
│   │   ├── show.ejs             #   GET /campgrounds/:id
│   │   ├── create.ejs           #   GET /campgrounds/new
│   │   └── update.ejs           #   GET /campgrounds/:id/edit
│   └── user/
│       ├── login.ejs            #   GET /login
│       └── register.ejs         #   GET /register
│
├── public/                      # Static assets (served by express.static)
│   ├── js/validateForms.js      #   Bootstrap 5 client-side validation
│   └── stylesheets/
│       ├── star.css             #   Pure-CSS star rating widget
│       └── app.css              #   (empty, unreferenced)
│
└── uploads/                     # Leftover local-disk upload dir (unused — see Known Issues)
```

### Request lifecycle

```
Browser
  → express.static      (serves /public if a file matches)
  → express.urlencoded  (parses req.body)
  → express-mongo-sanitize
  → session → flash
  → passport.initialize → passport.session
  → res.locals injection (currentUser, success, error)
  → mounted routers (campgrounds / reviews / users)
  → route-level middleware (loggedin → isAuthorized → upload → validateCamp)
  → controller (wrapped in catchAsync)
  → Mongoose model
  → EJS view rendered through layouts/boilerplates.ejs
  → HTML response
```

---

## Routing

### Campgrounds — `routes/campgrounds.js` (mounted at `/campgrounds`)

| Method | Path | Middleware | Handler |
| --- | --- | --- | --- |
| `GET` | `/campgrounds` | `catchAsync` | `allCamps` |
| `POST` | `/campgrounds` | `loggedin` → `upload.array('image')` → `validateCamp` → `catchAsync` | `addCamp` |
| `GET` | `/campgrounds/new` | `loggedin` | `newCampForm` |
| `GET` | `/campgrounds/:id` | – | `showPage` |
| `PUT` | `/campgrounds/:id` | `loggedin` → `isAuthorized` → `upload.array('image')` → `validateCamp` → `catchAsync` | `editCamp` |
| `DELETE` | `/campgrounds/:id` | `loggedin` → `isAuthorized` → `catchAsync` | `deleteCamp` |
| `GET` | `/campgrounds/:id/edit` | `loggedin` → `isAuthorized` → `catchAsync` | `editCampForm` |

`/new` is intentionally declared **before** `/:id` so it isn't swallowed by the id parameter.

### Reviews — `routes/reviews.js` (mounted at `/campgrounds/:id/reviews`)

| Method | Path | Middleware | Handler |
| --- | --- | --- | --- |
| `POST` | `/campgrounds/:id/reviews` | `loggedin` → `validateReview` → `catchAsync` | `addReview` |
| `DELETE` | `/campgrounds/:id/reviews/:reviewId` | `loggedin` → `isAuthorizedReview` → `catchAsync` | `deleteReview` |

Both routers use `express.Router({ mergeParams: true })` so the parent's `:id` reaches the handlers.

### Users — `routes/userroute.js` (mounted at `/`)

| Method | Path | Middleware | Handler |
| --- | --- | --- | --- |
| `GET` | `/register` | – | `signupForm` |
| `POST` | `/register` | `catchAsync` | `registerUser` |
| `GET` | `/login` | – | `loginForm` |
| `POST` | `/login` | `passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' })` | `login` |
| `GET` | `/logout` | – | `logout` |

`PUT` and `DELETE` are reached from plain HTML forms via `method-override` using a hidden `_method` field (e.g. `action="/campgrounds/<id>?_method=DELETE"`).

---

## Data Models

### `Campground` — `models/campGround.js`

```js
const ImageSchema = new Schema({
    url: String,
    filename: String
});

ImageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_200')  // Cloudinary transform
});

const campgroundSchema = new Schema({
    title: String,
    price: Number,
    description: String,
    location: String,
    image: [ImageSchema],
    author:  { type: Schema.Types.ObjectId, ref: 'User' },
    reviews: [ { type: Schema.Types.ObjectId, ref: 'Review' } ]
});

campgroundSchema.post('findOneAndDelete', async function (doc) {
    if (doc) await Review.deleteMany({ $in: doc.reviews })  // cascade delete
});
```

- `image` is an array of subdocuments (`url` + Cloudinary `filename`).
- `author` references `User`; `reviews` references `Review`.
- `thumbnail` is a virtual used by the edit form's preview grid.
- **No field-level validators** — all validation lives in `Schemas.js`.

### `Review` — `models/reviews.js`

```js
const reviewSchema = new Schema({
    body: String,
    rating: Number,
    author: { type: Schema.Types.ObjectId, ref: 'User' }
})
```

### `User` — `models/user.js`

```js
const userSchema = new Schema({
    email: { type: String, required: true, unique: true }
});
userSchema.plugin(passportLocalMongoose);
```

The plugin injects a unique `username`, a hashed `password`, and the statics `User.register`, `User.authenticate`, `User.serializeUser`, `User.deserializeUser`.

### Population

Population is done explicitly in controllers rather than via `populate` on the schema:

- `controllers/campground.js` `showPage` — two levels:
  ```js
  const foundID = await Campground.findById(id)
      .populate({ path: 'reviews', populate: { path: 'author' } })
      .populate('author');
  ```

---

## Middleware — `middleware.js`

| Export | Purpose |
| --- | --- |
| `loggedin` | Rejects unauthenticated requests: stores `req.session.returnTo = req.originalUrl`, flashes `"you need to be logged in first"`, redirects to `/login`. |
| `validateCamp` | Validates `req.body` against `campSchema`; on failure throws `ExpressError(msg, 400)`. |
| `validateReview` | Same pattern against `reviewSchema`. |
| `isAuthorized` | Loads the campground and compares `foundID.author.equals(req.user._id)`; on mismatch flashes `"not authorised"` and redirects to the campground page. |
| `isAuthorizedReview` | Same ownership check for a review, redirecting to `/campgrounds/:id`. |

### Joi schemas — `Schemas.js`

```js
module.exports.campSchema = joi.object({
    title:       joi.string().required(),
    price:       joi.number().required().min(0),
    location:    joi.string().required(),
    description: joi.string().required(),
    deleteImages: joi.array()
});

module.exports.reviewSchema = joi.object({
    rating: joi.number().required(),
    body:   joi.string().required()
});
```

`price` is submitted as text and coerced to a number; `deleteImages` accepts the edit form's `deleteImages[]` checkboxes.

### Error class — `utilities/expressError.js`

```js
class ExpressError extends Error {
    constructor(message, statusCode) {
        super();
        this.message = message;
        this.statusCode = statusCode;
    }
}
```

### Async wrapper — `utilities/catchAsync.js`

```js
module.exports = func => (req, res, next) => func(req, res, next).catch(next);
```

---

## Views

Rendered with **ejs-mate** so every page declares one shared layout and contributes only its body:

```ejs
<% layout('layouts/boilerplates') %>
```

`views/layouts/boilerplates.ejs` pulls in Bootstrap 5.2.2 from the CDN, includes the navbar, flash, and footer partials around `<%- body %>`, and loads `/js/validateForms.js`.

| Partial | Role |
| --- | --- |
| `partials/navbar.ejs` | Brand, "All Campgrounds", "Add a camp", and Login/Sign Up vs. Logout depending on `currentUser` |
| `partials/flash.ejs` | Bootstrap dismissible alerts for `success` and `error` |
| `partials/footer.ejs` | `© YelpCamp 2022` pinned to the bottom via `mt-auto` |

Notable view details:

- **`campgrounds/show.ejs`** — Bootstrap image carousel, camp metadata, owner-only Update/Delete buttons, the star-rating review form (`starability` radio pattern), and each review with a Delete button for its author. Links `stylesheets/star.css`.
- **`campgrounds/create.ejs` / `update.ejs`** — `multipart/form-data` forms with Bootstrap `needs-validation`. The update form additionally shows a thumbnail grid with `deleteImages[]` checkboxes.
- **`user/register.ejs` / `login.ejs`** — simple Bootstrap forms posting to `/register` and `/login`.

---

## Image Uploads

`cloudinary/index.js` configures both the SDK and the Multer storage engine:

```js
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key:   process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary,
    params: { folder: 'YelpCamp' },
    allowedFormats: ['jpeg', 'png', 'jpg']
});

module.exports = { cloudinary, storage };
```

Flow:

1. **Upload** — `routes/campgrounds.js` uses `multer({ storage })` with `.array('image')`. `controllers/campground.addCamp` maps `req.files` into the `image` subdocument array using `f.path` (the Cloudinary URL) and `f.filename`.
2. **Preview** — the `thumbnail` virtual rewrites the URL to `.../upload/w_200/...` for the edit-form grid.
3. **Delete** — ticking a `deleteImages` checkbox causes `editCamp` to call `cloudinary.uploader.destroy(filename)` and then `$pull` the subdocument out of the campground.

---

## Scripts

| Script | Command |
| --- | --- |
| `npm start` | `node index.js` |
| `npm test` | *stub* — exits 1 ("no test specified") |
| Seeding | `node seeds/seedsindex.js` (no npm script) |

There are **no tests and no dev dependencies** in this project.

---

## Deployment

The repo has commits named "ready to deploy" / "deploy" but contains **no Procfile, Dockerfile, or CI config**. To deploy:

1. Set all seven environment variables (see [Environment Variables](#environment-variables)) in your host's dashboard — `.env` is not read when `NODE_ENV=production`.
2. Provision a MongoDB instance (Atlas or self-hosted) and set `MONGO_URL`.
3. Run `npm install --omit=dev && npm start` (or point the start command at `index.js`).
4. Set `PORT` to match your host's injected port.

> 🔴 **Deploy-blocking bug:** `middleware.js:1` imports `./utilities/ExpressError.js` while the file on disk is `utilities/expressError.js`. This resolves on case-insensitive filesystems (Windows/macOS) but throws `MODULE_NOT_FOUND` on Linux. Fix the casing before deploying to Render/Heroku/Docker.

---

## Known Issues & Caveats

Bugs and rough edges observed during analysis — useful if you're continuing this project:

1. **Case-sensitive import breaks on Linux.** `middleware.js:1` requires `utilities/ExpressError.js`; the actual file is `utilities/expressError.js`.
2. **Cascade delete of reviews never fires.** The `Campground` schema registers a `post('findOneAndDelete')` hook, but `controllers/campground.deleteCamp` calls `foundID.deleteOne()` on a *document*, which does not trigger query middleware — so `Review` documents are orphaned in MongoDB.
3. **Un-awaited save.** `editCamp` calls `campUpdate.save()` without `await` before deleting images and redirecting.
4. **Duplicated authorization.** `editCamp` re-checks `foundID.author.equals(req.user._id)` even though `isAuthorized` already did.
5. **No null guards.** `isAuthorized` / `isAuthorizedReview` dereference the fetched document immediately, so a bad or missing id throws a `TypeError` (500) instead of a 404.
6. **Implicit global.** `index.js:56` is `secret = process.env.SECRET || 'secret'` — missing `const`.
7. **Inconsistent author comparison in views.** `show.ejs` compares `foundID.author.equals(currentUser)` in one place and `currentUser._id` in another.
8. **Assumes images exist.** `allcampgrounds.ejs` reads `camp.image[0].url` with no guard — a campground without images crashes the index page.
9. **`uploads/` is committed** (~268 KB extensionless JPEG) even though nothing reads that directory since Cloudinary was wired in. It is not in `.gitignore`.
10. **Dead/unused files.** `public/stylesheets/app.css` is empty and unreferenced; `sanitize-html` is installed but never imported; a large commented-out `MongoStore` block remains at `index.js:40–54`.
11. **Seeding hazards.** `seeds/seedsindex.js` hardcodes the Mongo URL (ignoring `MONGO_URL`), hardcodes a single author ObjectId, and deletes all campgrounds on every run.
12. **Security gaps.** Logout is a `GET` route; there is no CSRF protection, `helmet`, or rate limiting; `express-mongo-sanitize` is loaded but its options aren't tuned; session `saveUninitialized: true` writes a session row for every visitor.
13. **No test suite** and `npm test` deliberately fails.

---

## License

`ISC` (as declared in `package.json`).