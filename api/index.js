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

// Feed
api.get("/feed", auth, require("./feed"));

// Post
api.post("/post", auth, require("./post/create"));
api.delete("/post/:id", auth, require("./post/delete"));
api.post("/post/:id/like", auth, require("./post/like"));
api.delete("/post/:id/like", auth, require("./post/unlike"));
