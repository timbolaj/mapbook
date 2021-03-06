// load .env data into process.env
require('dotenv').config();

// Web server config
const PORT       = process.env.PORT || 8080;
const ENV        = process.env.ENV || "development";
const express    = require("express");
const bodyParser = require("body-parser");
const sass       = require("node-sass-middleware");
const app        = express();
const morgan     = require('morgan');
const cookieSession = require('cookie-session')

// PG database client/connection setup
const { Pool } = require('pg');
const dbParams = require('./lib/db.js');
const db = new Pool(dbParams);
db.connect();

// Load the logger first so all (static) HTTP requests are logged to STDOUT
// 'dev' = Concise output colored by response status for development use.
//  The :status token will be colored red for server error codes, yellow for client error codes, cyan for redirection codes, and uncolored for all other codes.
app.use(morgan('dev'));

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/styles", sass({
  src: __dirname + "/styles",
  dest: __dirname + "/public/styles",
  debug: true,
  outputStyle: 'expanded'
}));
app.use(express.static("public"));
app.use(cookieSession({
  name: 'session',
  keys: ['f77888e3-fad9-4e89-b8b7-1cff127f37aa', 'e6337385-acd1-43b5-aa6a-73090c8ce23f']
}));

// Separated Routes for each Resource
// Note: Feel free to replace the example routes below with your own
const mapsRoutes = require("./routes/maps");
const markersRoutes = require('./routes/markers');
const favoritesRoutes = require('./routes/favorites');
const registerRoutes = require('./routes/register');

// Mount all resource routes
// Note: Feel free to replace the example routes below with your own
app.use("/api/maps", mapsRoutes(db));
app.use("/api/markers", markersRoutes(db));
app.use('/api/favorites', favoritesRoutes(db));
app.use('/users/register', registerRoutes(db));
// Note: mount other resources here, using the same pattern above


// Home page
// Warning: avoid creating more routes in this file!
// Separate them into separate routes files (see above).
app.get("/", (req, res) => {
  res.render("index");
});

app.post("/", (req, res) => { // /get/user/
  const userID = req.session.user_id;
  res.json(userID);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
