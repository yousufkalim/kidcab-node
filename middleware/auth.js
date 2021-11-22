const jwt = require("jsonwebtoken");
const User = require("../models/users");

exports.auth = async (req, res, next) => {
  try {
    const token = await req.header("Authorization").replace("Bearer ", "");
    const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
    const user = await User.findOne({
      _id: decoded._id,
      "tokens.token": token,
    });
    if (!user) {
      throw new Error();
    }
    req.token = token;
    req.user = user;
    next();
  } catch (error) {
    res.status(401).send({ error: "Please authenticated" });
  }
};

exports.generateAuthToken = async (user) => {
  const token = jwt.sign(
    { _id: user._id.toString() },
    process.env.TOKEN_SECRET
  );
  user.tokens = user.tokens.concat({
    token,
  });
  await user.save();
  return token;
};
