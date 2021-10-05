const db = require("../../prisma");

module.exports = async (req, res) => {
  const { user } = req.session;
  const { id } = req.params;

  // Get Page
  const page = await db.page.findUnique({ where: { id } });
  if (!page) return res.status(404).send("Missing Resource");

  // Delete Subscription
  try {
    await db.pageSubscription.delete({
      where: {
        userId_pageId: {
          userId: user.id,
          pageId: page.id,
        },
      },
    });
  } catch (err) {}

  // Response
  res.status(204).send();
};
