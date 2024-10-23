const express = require("express");
const router = express.Router();

router.use("/room", require("./room"));

module.exports = router;
