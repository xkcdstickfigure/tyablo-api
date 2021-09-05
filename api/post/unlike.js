const db = require("../../prisma");

module.exports = async (req, res) => {
  const { user } = req.session;
  const { id } = req.params;

  // Get Post
  const post = await db.post.findUnique({ where: { id } });
  if (!post || post.deletedAt) return res.status(400).send("Missing Resource");

  // Delete Like
  try {
    await db.like.delete({
      where: {
        userId_postId: {
          userId: user.id,
          postId: post.id,
        },
      },
    });
  } catch (err) {}

  // Response
  res.status(204).send();
};
