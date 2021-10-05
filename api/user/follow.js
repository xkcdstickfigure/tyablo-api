const db = require("../../prisma");

module.exports = async (req, res) => {
  const { user } = req.session;
  const { id } = req.params;

  // Get User
  const user2 = await db.user.findUnique({ where: { id } });
  if (!user2) return res.status(404).send("Missing Resource");

  // Prevent Self Follow
  if (user.id === user2.id)
    return res.status(403).send("Self Follow Not Allowed");

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
