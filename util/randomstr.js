const random = require("randomstring").generate;
module.exports = (length) => random({ capitalization: "uppercase", length });
