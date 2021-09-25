const { FILE_STORE } = process.env;
const fs = require("fs");
const { generate: randomString } = require("randomstring");

module.exports = () => {
  const code = randomString({ capitalization: "lowercase", length: 32 });
  const date = new Date();
  const d = date.getDate().toString().padStart(2, 0);
  const m = (date.getMonth() + 1).toString().padStart(2, 0);
  const y = date.getFullYear();

  const path = `/${y}/${m}/${d}/${code}`;
  fs.mkdirSync(FILE_STORE + path, { recursive: true });
  return path;
};
