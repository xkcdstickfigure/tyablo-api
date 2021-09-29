const { FILE_STORE } = process.env;
const db = require("../../prisma");
const nanoid = require("../../util/id");
const fileStore = require("../../util/fileStore");
const sharp = require("sharp");
const fs = require("fs");

module.exports = async (req, res) => {
  const { user, primary } = req.session;
  const location =
    primary &&
    user.locationUpdatedAt > new Date().getTime() - 1000 * 60 * 60 * 24;

  const { image, page: pageId } = req.body;
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

  // Page
  let page;
  if (typeof pageId === "string") {
    page = await db.page.findUnique({ where: { id: pageId } });
    if (!page) return res.status(400).send("Not Manager Of Page");

    const manager = await db.pageManager.findUnique({
      where: {
        userId_pageId: {
          userId: user.id,
          pageId: page.id,
        },
      },
    });
    if (!manager) return res.status(400).send("Not Manager Of Page");
  }

  // Image
  let imgPath;
  if (typeof image === "string") {
    try {
      let img = Buffer.from(image.split(";base64,")[1], "base64");

      img = await sharp(img)
        .resize({
          width: 1000,
          height: 1000,
          fit: "inside",
        })
        .flatten({
          background: {
            r: 255,
            g: 255,
            b: 255,
          },
        })
        .toBuffer();

      if (img.byteLength > 5000000)
        return res.status(413).send("Attachment Too Large");

      const path = fileStore() + "/image.png";
      await db.upload.create({
        data: {
          id: nanoid(),
          path,
          userId: user.id,
        },
      });

      fs.writeFileSync(`${FILE_STORE}/${path}`, img);
      imgPath = path;
    } catch (err) {
      return res.status(400).send("Attachment Upload Failed");
    }
  }

  // Create Post
  const post = await db.post.create({
    data: {
      id: nanoid(),
      content,
      image: imgPath,
      lat: location ? user.lat : null,
      lon: location ? user.lon : null,
      userId: user.id,
      pageId: page?.id,
    },
  });

  // Response
  res.json({ id: post.id });
};
