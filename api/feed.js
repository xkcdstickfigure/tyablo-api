const db = require("../prisma");
const square = require("../util/square");

module.exports = async (req, res) => {
  const { user } = req.session;

  // Nearby Area
  const nearby =
    user.locationUpdatedAt > new Date().getTime() - 1000 * 60 * 60 * 24 &&
    square(Number(user.lat), Number(user.lon), 0.5);

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
            // Nearby Posts
            nearby
              ? {
                  lat: {
                    gte: nearby.lat1,
                    lte: nearby.lat2,
                  },
                  lon: {
                    gte: nearby.lon1,
                    lte: nearby.lon2,
                  },
                  user: {
                    discoverable: true,
                  },
                }
              : null,
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
      createdAt: {
        gte: new Date(new Date().getTime() - 1000 * 60 * 60 * 24 * 2),
      },
      deletedAt: null,
    },
    orderBy: {
      createdAt: "desc",
    },
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

  // Response
  res.json({
    posts: posts.map((post) => ({
      id: post.id,
      author: post.page
        ? {
            id: post.page.id,
            page: true,
            following: !!post.page.subscribers.length,
            name: post.page.name,
          }
        : {
            id: post.user.id,
            page: false,
            following: !!post.user.followers.length,
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
