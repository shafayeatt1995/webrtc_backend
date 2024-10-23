const jwt = require("jsonwebtoken");

const isAuthenticated = async (req, res, next) => {
  try {
    const bearer = req.headers.authorization || "";
    if (bearer) {
      const token =
        bearer.split(" ")[0].toLowerCase() === "bearer"
          ? bearer.split(" ")[1]
          : null;

      const { _id, name, email, avatar, type, socialAccount, provider } =
        await jwt.verify(token, process.env.AUTH_SECRET);
      const payload = {
        _id,
        name,
        email,
        avatar,
        type,
        socialAccount,
        provider,
      };
      req.user = payload;
      next();
    } else {
      throw new Error("Token not found");
    }
  } catch (error) {
    return res.status(401).send({ success: false, message: "Unauthorized" });
  }
};

module.exports = isAuthenticated;
