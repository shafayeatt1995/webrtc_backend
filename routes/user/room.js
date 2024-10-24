const express = require("express");
const { checkRoom } = require("../../controllers/RoomController");
const router = express.Router();

router.post("/create", () => {});
router.post("/check", checkRoom);

module.exports = router;
