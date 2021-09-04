const db = require("../../prisma");

module.exports = async (req, res) => {
  const { user } = req.session;
  const { id } = req.params;

  // Get Post
  const post = await db.post.findUnique({ where: { id } });
  if (!post || post.deletedAt) return res.status(429).send("Missing Resource");

  // Delete Post
  if (post.userId === user.id) {
    await db.post.update({
      where: { id: post.id },
      data: { deletedAt: new Date() },
    });
  }

  // Response
  res.status(204).send();
};
