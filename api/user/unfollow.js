const db = require("../../prisma");

module.exports = async (req, res) => {
  const { user } = req.session;
  const { id } = req.params;

  // Get User
  const user2 = await db.user.findUnique({ where: { id } });
  if (!user2) return res.status(400).send("Missing Resource");

  // Delete Follow
  try {
    await db.follow.delete({
      where: {
        followingId_followerId: {
          followingId: user2.id,
          followerId: user.id,
        },
      },
    });
  } catch (err) {}

  // Response
  res.status(204).send();
};
