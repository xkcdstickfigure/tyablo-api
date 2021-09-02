const api = require("express").Router();
module.exports = api;

// Login
api.post("/login/phone", require("./login/phone"));
api.post("/login/code", require("./login/code"));
