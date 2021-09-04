const db = require("../../prisma");
const nanoid = require("../../util/id");
const { generate: randomString } = require("randomstring");

module.exports = async (req, res) => {
  const { id, code } = req.body;
  let { name } = req.body;
  if (typeof id !== "string" || typeof code !== "string")
    return res.status(400).send("Bad Request");

  // Get PhoneAuth record
  const phoneAuth = await db.phoneAuth.findUnique({ where: { id } });
  if (
    !phoneAuth ||
    phoneAuth.code !== code ||
    phoneAuth.address !== req.ip ||
    phoneAuth.usedAt ||
    phoneAuth.createdAt < new Date().getTime() - 1000 * 60 * 10
  )
    return setTimeout(
      () => res.status(401).send("Invalid Code"),
      500 + Math.floor(Math.random() * 1000)
    );

  // Generate User ID
  const uid = nanoid();

  // Find or Create User
  let user;
  if (typeof name === "string") {
    name = name.trim();
    if (!name || name.length > 35) return res.status(400).send("Bad Request");

    user = await db.user.upsert({
      where: { phone: phoneAuth.number },
      create: { id: uid, name, phone: phoneAuth.number },
      update: {},
    });
  } else {
    user = await db.user.findUnique({
      where: { phone: phoneAuth.number },
    });
    if (!user) return res.status(401).send("Missing Account");
  }

  // Mark PhoneAuth as used
  await db.phoneAuth.update({
    where: { id: phoneAuth.id },
    data: { usedAt: new Date() },
  });

  // Suspended
  if (user.suspendedAt) return res.status(403).send("Account Suspended");

  // Create Session
  const session = await db.session.create({
    data: {
      id: nanoid(),
      token: randomString({ length: 128, capitalization: "uppercase" }),
      address: phoneAuth.address,
      usedAt: new Date(),
      userId: user.id,
    },
  });

  // Set Primary Session
  await db.$executeRaw`UPDATE session SET \`primary\`=(id=${session.id}) WHERE userId=${user.id};`;

  // Response
  res.json({ new: user.id === uid, token: session.token });
};
