const db = require("../../prisma");

module.exports = async (req, res) => {
  const { user } = req.session;
  const { id } = req.params;

  // Get User
  const user2 = await db.user.findUnique({ where: { id } });
  if (!user2) return res.status(400).send("Missing Resource");

  // Create Follow
  await db.follow.upsert({
    where: {
      followingId_followerId: {
        followingId: user2.id,
        followerId: user.id,
      },
    },
    create: {
      followingId: user2.id,
      followerId: user.id,
    },
    update: {},
  });

  // Response
  res.status(204).send();
};
