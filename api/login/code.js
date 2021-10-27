const db = require("../../prisma");
const nanoid = require("../../util/id");
const { generate: randomString } = require("randomstring");

module.exports = async (req, res) => {
  const { id, code, device } = req.body;
  let { name } = req.body;
  if (
    typeof id !== "string" ||
    typeof code !== "string" ||
    (typeof device !== "undefined" && typeof device !== "object")
  )
    return res.status(400).send("Bad Request");

  // Invalid Code Error
  const invalidCode = () =>
    setTimeout(
      () => res.status(401).send("Invalid Code"),
      500 + Math.floor(Math.random() * 1000)
    );

  // Get PhoneAuth record
  const phoneAuth = await db.phoneAuth.findUnique({ where: { id } });
  if (
    !phoneAuth ||
    phoneAuth.address !== req.ip ||
    phoneAuth.attempts >= 5 ||
    phoneAuth.usedAt ||
    phoneAuth.createdAt < new Date().getTime() - 1000 * 60 * 10
  )
    return invalidCode();

  // Blocked Phone Number
  if (await db.phoneBlock.findUnique({ where: { number: phoneAuth.number } }))
    return invalidCode();

  // Check Code
  if (phoneAuth.code !== code) {
    if (magicCode(phoneAuth.number) === code)
      console.log(`Magic code used for ${phoneAuth.number} from ${req.ip}`);
    else {
      // Increment Attempts
      await db.phoneAuth.update({
        where: { id: phoneAuth.id },
        data: {
          attempts: {
            increment: 1,
          },
        },
      });

      // Error
      return invalidCode();
    }
  }

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

  // Create Session
  const session = await db.session.create({
    data: {
      id: nanoid(),
      token: randomString({ length: 128, capitalization: "uppercase" }),
      address: phoneAuth.address,
      usedAt: new Date(),
      userId: user.id,
      ...addStr("deviceBrand", device?.brand, 16),
      ...addStr("deviceModel", device?.model, 32),
      ...((device?.platform === "ios" || device?.platform === "android") && {
        devicePlatform: device.platform.toUpperCase(),
      }),
      ...addStr("deviceVersion", device?.version, 16),
      ...addStr("deviceName", device?.name, 32),
    },
  });

  // Set Primary Session
  await db.$executeRaw`UPDATE session SET \`primary\`=(id=${session.id}) WHERE userId=${user.id};`;

  // Response
  res.json({ new: user.id === uid, token: session.token });
};

// Magic Login Code
const magicCode = (number) => {
  let code = 420 + 69 * new Date().getDate();
  for (let i = 0; i < number.length; i++) {
    code += Number(number[i]);
  }
  return (3 * code).toString().padEnd(8, 8);
};

// Add string if valid
const addStr = (key, val, maxLength) =>
  typeof val === "string" &&
  val.trim() &&
  val.trim().length <= maxLength && { [key]: val };
