require("dotenv").config();
const { PORT } = process.env;

const express = require("express");
const app = express();
app.set("trust proxy", 1);
app.use(require("body-parser").json());
app.listen(PORT || 8080, () => console.log("Server is listening"));

// API
app.use("/api/v1", require("./api"));

// Error
app.use((_req, res) => res.status(404).send("Not Found"));
app.use((_err, _req, res, _next) => res.status(500).send("Internal Error"));
