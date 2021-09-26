const { ORIGIN } = process.env;
const { intlFormat } = require("../util/phoneNumber");

module.exports = (req, res) => {
  const { user } = req.session;
  res.json({
    id: user.id,
    name: user.name,
    avatar: user.avatar ? `${ORIGIN}/fs/${user.avatar}` : null,
    phone: intlFormat(user.phone),
    score: user.score,
  });
};
