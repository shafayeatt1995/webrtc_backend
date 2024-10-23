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
};

module.exports = controller;
