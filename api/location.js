const db = require("../prisma");

module.exports = async (req, res) => {
  const { user, primary } = req.session;
  const { lat, lon } = req.body;
  res.status(204).send();

  if (
    primary &&
    typeof lat === "number" &&
    typeof lon === "number" &&
    lat > -90 &&
    lat < 90 &&
    lon > -180 &&
    lon < 180
  )
    await db.user.update({
      where: { id: user.id },
      data: { lat, lon, locationUpdatedAt: new Date() },
    });
};
