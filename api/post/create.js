const db = require("../../prisma");
const nanoid = require("../../util/id");

module.exports = async (req, res) => {
  const { user, primary } = req.session;
  const location =
    primary &&
    user.locationUpdatedAt > new Date().getTime() - 1000 * 60 * 60 * 24;

  let { content } = req.body;
  if (typeof content !== "string") return res.status(400).send("Bad Request");

  content = content.trim();
  if (!content || content.length > 2000)
    return res.status(400).send("Bad Request");

  // Count Posts
  const count = await db.post.count({
    where: {
      userId: user.id,
      createdAt: {
        gte: new Date(new Date().getTime() - 1000 * 60 * 60),
      },
    },
  });
  if (count >= 30) return res.status(429).send("Too Many Requests");

  // Create Post
  const post = await db.post.create({
    data: {
      id: nanoid(),
      content,
      lat: location ? user.lat : null,
      lon: location ? user.lon : null,
      userId: user.id,
    },
  });

  // Response
  res.json({ id: post.id });
};
