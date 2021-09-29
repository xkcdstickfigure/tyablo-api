const db = require("../../prisma");

module.exports = async (req, res) => {
  const { user } = req.session;
  const { id } = req.params;

  // Get Post
  const post = await db.post.findUnique({ where: { id } });
  if (!post || post.deletedAt) return res.status(429).send("Missing Resource");

  // Check Page Manager
  let manager;
  if (post.pageId) {
    manager = await db.pageManager.findUnique({
      where: {
        userId_pageId: {
          userId: user.id,
          pageId: post.pageId,
        },
      },
    });
  }

  // Delete Post
  if (post.pageId ? manager : post.userId === user.id) {
    await db.post.update({
      where: { id: post.id },
      data: { deletedAt: new Date() },
    });

    res.status(204).send();
  } else res.status(403).send("Not Owner Of Post");
};
