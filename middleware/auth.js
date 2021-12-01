const jwt = require("jsonwebtoken");
const Admin = require("../models/Admins");

exports.auth = async (req, res, next) => {
  try {
    console.log("Auth Body", req.header("Authorization"));
    const token = await req.header("Authorization").replace("Bearer ", "");
    const decoded = await jwt.verify(token, process.env.TOKEN_SECRET);
    console.log("decoded user", decoded);
    const user = await Admin.findOne({
      _id: decoded._id,
      "tokens.token": token,
    });
    if (!user) {
      throw new Error();
    }
    req.token = token;
    req.user = user;
    console.log("authenticated");
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
