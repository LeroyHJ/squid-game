const Player = require("./player");
const CookieJar1 = require("./cookieJar1");
const CookieJar2 = require("./cookieJar2");

const levelCharTypes = {
  ".": "empty",
  "#": "wall",
  "M": "CM",
  "@": Player,
  "!": CookieJar1, //this is for the tests!
  "1": CookieJar1,
  "2": CookieJar2,
};

module.exports = levelCharTypes;
