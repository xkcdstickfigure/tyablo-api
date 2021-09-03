module.exports = (req, res) => {
  const { user } = req.session;
  res.json({
    id: user.id,
    name: user.name,
    phone: user.phone,
    score: user.score,
  });
};
