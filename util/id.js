const { customAlphabet } = require("nanoid");
const alphabet = "0123456789abcdefghijklmnopqrstuvwxyz-_";
const nanoid = customAlphabet(alphabet, 16);
module.exports = nanoid;
