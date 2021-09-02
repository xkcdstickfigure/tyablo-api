const db = require("../../prisma");
const nanoid = require("../../util/id");
const { generate: randomString } = require("randomstring");
const prefixes = require("../../data/phonePrefixes.json");

module.exports = async (req, res) => {
  const { prefix, number } = req.body;
  if (
    typeof prefix !== "string" ||
    typeof number !== "string" ||
    !prefixes[prefix] ||
    prefix !== "44" ||
    number.replace(/\D/g, "") !== number ||
    !number ||
    number.length > 16
  )
    return res.status(400).send("Bad Request");

  // Count PhoneAuth records
  const count = await db.phoneAuth.count({
    where: {
      address: req.ip,
      createdAt: {
        gte: new Date(new Date().getTime() - 1000 * 60 * 30),
      },
    },
  });
  if (count >= 5) return res.status(429).send("Too Many Requests");

  // Create PhoneAuth
  const phoneAuth = await db.phoneAuth.create({
    data: {
      id: nanoid(),
      number: prefix + number,
      code: randomString({
        length: 8,
        charset: "numeric",
      }),
      address: req.ip,
    },
  });

  // Response
  res.json({ id: phoneAuth.id });
};
