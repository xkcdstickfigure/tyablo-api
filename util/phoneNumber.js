const libphonenumber = require("google-libphonenumber");
const phoneUtil = libphonenumber.PhoneNumberUtil.getInstance();
const format = libphonenumber.PhoneNumberFormat;

const intlFormat = (number) =>
  phoneUtil.format(phoneUtil.parse("+" + number, ""), format.INTERNATIONAL);

const isValidNumber = (number) =>
  phoneUtil.isValidNumber(phoneUtil.parse("+" + number, ""));

module.exports = {
  intlFormat,
  isValidNumber,
};
