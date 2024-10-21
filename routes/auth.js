const express = require("express");
const router = express.Router();
const { login, socialLogin } = require("../controllers/AuthController");
const { loginValidation } = require("../validation/auth");
const { validation } = require("../validation");
const passport = require("passport");
require("../config/passport");
const data = { error: true };

router.use(passport.initialize());
router.use(passport.session());

router.post("/signin", loginValidation, validation, login);
router.get(
  "/social-login/google",
  passport.authenticate("google", { scope: ["email", "profile"] })
);
router.get(
  "/social-login/google/callback",
  passport.authenticate("google", {
    failureRedirect: `/social-login?e=${btoa(JSON.stringify(data))}`,
  }),
  socialLogin
);
router.get(
  "/social-login/facebook",
  passport.authenticate("facebook", { scope: ["email", "public_profile"] })
);
router.get(
  "/social-login/facebook/callback",
  passport.authenticate("facebook", {
    failureRedirect: `/social-login?e=${btoa(JSON.stringify(data))}`,
  }),
  (req, res, next) => {
    if (req.isAuthenticated()) {
      req.passportUser = req.user;
    }
    next();
  },
  socialLogin
);
router.get("/logout", (req, res) => {
  return res.json({ success: true, message: "Logout successful" });
});

module.exports = router;
