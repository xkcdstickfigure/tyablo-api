const { ORIGIN } = process.env;
const { intlFormat } = require("../../util/phoneNumber");

module.exports = async (req, res) => {
  const { user } = req.session;

  res.json({
    id: user.id,
    name: user.name,
    pronoun: user.pronoun,
    description: user.description,
    avatar: user.avatar
      ? `${ORIGIN}/fs/${user.avatar}`
      : `${ORIGIN}/s/uavatar.png`,
    phone: intlFormat(user.phone),
    score: user.score,
    discoverable: user.discoverable,
    country: user.country,
    createdAt: user.createdAt,
  });
};
