const api = require("express").Router();
module.exports = api;

// Auth
const auth = require("./auth");

// Login
api.post("/login/phone", require("./login/phone"));
api.post("/login/code", require("./login/code"));

// Context
api.get("/context", auth, require("./context"));

// Set Location
api.post("/location", auth, require("./location"));

// Account
api.post("/account", auth, require("./account/update"));

// Feed
api.get("/feed", auth, require("./feed"));

// Post
api.post("/post", auth, require("./post/create"));
api.delete("/post/:id", auth, require("./post/delete"));
api.post("/post/:id/like", auth, require("./post/like"));
api.delete("/post/:id/like", auth, require("./post/unlike"));

// User
api.post("/user/:id/follow", auth, require("./user/follow"));
api.delete("/user/:id/follow", auth, require("./user/unfollow"));
