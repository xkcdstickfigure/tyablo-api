const db = require("../../prisma");

module.exports = async (req, res) => {
  const { user } = req.session;
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

  // Update
  await db.user.update({
    where: { id: user.id },
    data: update,
  });

  // Response
  res.status(204).send();
};
