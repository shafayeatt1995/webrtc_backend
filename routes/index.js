const mongoose = require("mongoose");
const express = require("express");
const isAuthenticated = require("../middleware/isAuthenticated");
const router = express.Router();

router.use("/auth", require("./auth"));
router.get("/check-connect", async (req, res) => {
  try {
    const connection = mongoose.connection.readyState === 1;
    return res.json({ success: false, connection });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again.",
    });
  }
});

router.use(isAuthenticated);
router.use("/admin", require("./admin"));
router.use("/user", require("./user"));

module.exports = router;
