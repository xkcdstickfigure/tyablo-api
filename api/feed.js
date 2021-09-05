const db = require("../prisma");

module.exports = async (req, res) => {
  const { user } = req.session;

  // Get Posts
  const posts = await db.post.findMany({
    where: {
      OR: [
        // Users
        {
          pageId: null,
          OR: [
            {
              // Followed Users
              user: {
                followers: {
                  some: {
                    followerId: user.id,
                  },
                },
              },
            },
            // Self
            { userId: user.id },
          ],
        },
        // Pages
        {
          page: {
            OR: [
              // Pages Managed By User
              {
                managers: {
                  some: {
                    userId: user.id,
                  },
                },
              },
              // Pages Subscribed To
              {
                subscribers: {
                  some: {
                    userId: user.id,
                  },
                },
              },
            ],
          },
        },
      ],
      deletedAt: null,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      user: true,
      page: true,
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

  // Response
  res.json({
    posts: posts.map((post) => ({
      id: post.id,
      author: post.page
        ? {
            page: true,
            id: post.page.id,
            name: post.page.name,
          }
        : {
            page: false,
            id: post.user.id,
            name: post.user.name,
          },
      content: post.content,
      createdAt: post.createdAt,
      likes: {
        count: post._count.likes,
        self: !!post.likes.length,
      },
    })),
  });
};
