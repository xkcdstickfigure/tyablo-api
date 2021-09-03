const db = require("../prisma");

module.exports = async (req, res, next) => {
  const fail = () => res.status(401).send("Bad Authorization");
  const token = req.headers.authorization;
  if (typeof token !== "string") return fail();

  const t = token.split(" ");
  if (t.length !== 2 || t[0] !== "Bearer") return fail();

  const session = await db.session.findUnique({
    where: { token: t[1] },
    include: { user: true },
  });
  if (!session || session.user.suspendedAt) return fail();

  await db.session.update({
    where: { id: session.id },
    data: { usedAt: new Date() },
  });

  req.session = session;
  next();
};
