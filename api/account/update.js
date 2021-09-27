const { FILE_STORE } = process.env;
const db = require("../../prisma");
const sharp = require("sharp");
const fileStore = require("../../util/fileStore");
const nanoid = require("../../util/id");

module.exports = async (req, res) => {
  const { user } = req.session;
  const { avatar } = req.body;
  let { name, pronoun, description, discoverable } = req.body;
  const update = {};

  // Name
  if (typeof name === "string") {
    name = name.trim();
    if (!name) return res.status(400).send("Name is required");
    if (name.length > 35) return res.status(400).send("Name is too long");
    update.name = name;
  }

  // Pronoun
  if (typeof pronoun === "string") {
    pronoun = pronoun.trim();
    if (pronoun.length > 35) return res.status(400).send("Pronoun is too long");
    update.pronoun = pronoun || null;
  }

  // Description
  if (typeof description === "string") {
    description = description.trim();
    if (description.length > 128)
      return res.status(400).send("Pronoun is too long");
    update.description = description || null;
  }

  // Discoverable
  if (typeof discoverable === "boolean") update.discoverable = discoverable;

  // Avatar
  if (typeof avatar === "string") {
    try {
      let img = Buffer.from(avatar.split(";base64,")[1], "base64");
      img = await sharp(img)
        .resize({
          width: 256,
          height: 256,
          fit: "cover",
        })
        .flatten({
          background: {
            r: 255,
            g: 255,
            b: 255,
          },
        })
        .png();

      const path = fileStore() + "/avatar.png";
      await db.upload.create({
        data: {
          id: nanoid(),
          path,
          userId: user.id,
        },
      });
      await img.toFile(`${FILE_STORE}/${path}`);
      update.avatar = path;
    } catch (err) {}
  }

  // Update
  await db.user.update({
    where: { id: user.id },
    data: update,
  });

  // Response
  res.status(204).send();
};
