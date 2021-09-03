const api = require("express").Router();
module.exports = api;

// Auth
const auth = require("./auth");

// Login
api.post("/login/phone", require("./login/phone"));
api.post("/login/code", require("./login/code"));

// Set Location
api.post("/location", auth, require("./location"));

// Home
api.get("/home", auth, require("./home"));
