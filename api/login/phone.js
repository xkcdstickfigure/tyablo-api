const db = require("../../prisma");
const nanoid = require("../../util/id");
const { generate: randomString } = require("randomstring");
const { isValidNumber } = require("../../util/phoneNumber");

module.exports = async (req, res) => {
  const { number } = req.body;
  if (
    typeof number !== "string" ||
    !number ||
    number.length > 16 ||
    number.replace(/\D/g, "") !== number ||
    !isValidNumber(number) ||
    !number.startsWith("44") // Only allow +44 numbers
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
      number,
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
