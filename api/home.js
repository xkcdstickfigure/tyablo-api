const { intlFormat } = require("../util/phoneNumber");

module.exports = (req, res) => {
  const { user } = req.session;
  res.json({
    id: user.id,
    name: user.name,
    phone: intlFormat(user.phone),
    score: user.score,
  });
};
