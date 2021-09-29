const { ORIGIN } = process.env;
const db = require("../prisma");
const square = require("../util/square");

module.exports = async (req, res) => {
  const { user } = req.session;
  const { before } = req.query;

  // Before Date Offset
  const beforeDate = typeof before === "string" && new Date(Number(before));

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
        lt: beforeDate && beforeDate.valueOf() ? beforeDate : undefined,
      },
      deletedAt: null,
    },
    take: 20,
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
            avatar: `${ORIGIN}/s/uavatar.png`,
          }
        : {
            id: post.user.id,
            page: false,
            following: !!post.user.followers.length,
            name: post.user.name,
            avatar: post.user.avatar
              ? `${ORIGIN}/fs/${post.user.avatar}`
              : `${ORIGIN}/s/uavatar.png`,
          },
      content: post.content,
      image: post.image && `${ORIGIN}/fs/${post.image}`,
      createdAt: post.createdAt,
      likes: {
        count: post._count.likes,
        self: !!post.likes.length,
      },
    })),
  });
};
