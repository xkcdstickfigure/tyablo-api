const { ORIGIN } = process.env;
const db = require("../../prisma");

module.exports = async (req, res) => {
  const { user } = req.session;
  const { id } = req.params;

  // Get Post
  const post = await db.post.findUnique({
    where: { id },
    include: {
      user: {
        include: {
          followers: {
            where: {
              followerId: user.id,
            },
          },
        },
      },
      page: {
        include: {
          subscribers: {
            where: {
              userId: user.id,
            },
          },
        },
      },
      likes: {
        where: {
          userId: user.id,
        },
      },
      _count: {
        select: {
          likes: true,
        },
      },
    },
  });
  if (!post || post.deletedAt || (!post.user && !post.page))
    return res.status(404).send("Missing Resource");

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

  // Response
  res.json({
    id: post.id,
    author: post.page
      ? {
          id: post.page.id,
          page: true,
          following: !!post.page.subscribers.length,
          manager: !!manager,
          name: post.page.name,
          avatar: post.page.avatar
            ? `${ORIGIN}/fs/${post.page.avatar}`
            : `${ORIGIN}/s/pavatar.png`,
        }
      : {
          id: post.user.id,
          page: false,
          following: !!post.user.followers.length,
          manager: post.user.id === user.id,
          name: post.user.name,
          avatar: post.user.avatar
            ? `${ORIGIN}/fs/${post.user.avatar}`
            : `${ORIGIN}/s/uavatar.png`,
          pronoun: post.user.pronoun,
          new:
            post.user.createdAt >
            new Date().getTime() - 1000 * 60 * 60 * 24 * 14,
        },
    content: post.content,
    image: post.image && `${ORIGIN}/fs/${post.image}`,
    date: post.createdAt,
    likes: {
      count: post._count.likes,
      self: !!post.likes.length,
    },
  });
};
