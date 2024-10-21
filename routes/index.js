const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();

router.use("/auth", require("./auth"));
router.use("/admin", require("./admin"));
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

module.exports = router;
