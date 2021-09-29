const { ORIGIN } = process.env;
const db = require("../prisma");
const { intlFormat } = require("../util/phoneNumber");

module.exports = async (req, res) => {
  const { user } = req.session;

  const pages = await db.page.findMany({
    where: {
      managers: {
        some: {
          userId: user.id,
        },
      },
    },
  });

  res.json({
    user: {
      id: user.id,
      name: user.name,
      avatar: user.avatar
        ? `${ORIGIN}/fs/${user.avatar}`
        : `${ORIGIN}/s/uavatar.png`,
      phone: intlFormat(user.phone),
      score: user.score,
    },
    pages: pages.map((p) => ({
      id: p.id,
      name: p.name,
      avatar: p.avatar ? `${ORIGIN}/fs/${p.avatar}` : `${ORIGIN}/s/pavatar.png`,
    })),
  });
};
