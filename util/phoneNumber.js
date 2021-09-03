const libphonenumber = require("google-libphonenumber");
const phoneUtil = libphonenumber.PhoneNumberUtil.getInstance();
const format = libphonenumber.PhoneNumberFormat;

const intlFormat = (number) =>
  phoneUtil.format(phoneUtil.parse("+" + number, ""), format.INTERNATIONAL);

const isValidNumber = (number) => {
  try {
    return phoneUtil.isValidNumber(phoneUtil.parse("+" + number, ""));
  } catch (e) {
    return false;
  }
};

module.exports = {
  intlFormat,
  isValidNumber,
};
