const { SocketUser } = require("../models");
const { message } = require("../utils");
const controller = {
  async createRoom(req, res) {
    try {
      console.log(req.body);
      res.json({ user: payload, token });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message });
    }
  },
  async checkRoom(req, res) {
    try {
      const { email, socketID, roomID } = req.body;
      const activeClient = Array.from(global.io.sockets.sockets.keys());
      if (activeClient.includes(socketID)) {
        const count = await SocketUser.countDocuments({
          roomID,
          email: { $ne: email },
        });
        if (count < 2) {
          const sender = await SocketUser.findOneAndUpdate(
            { email },
            { email, socketID, roomID },
            { upsert: true, new: true }
          ).select("email roomID socketID");
          const receiver = await SocketUser.findOne({
            roomID: sender.roomID,
            email: { $ne: sender.email },
          }).select("email roomID socketID");
          return res.json({ permission: true, sender, receiver });
        }
        return res.json({
          permission: false,
          message: "Room is full",
        });
      }
      return res.json({ permission: false, message: "You are not valid user" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message });
    }
  },
};

module.exports = controller;
