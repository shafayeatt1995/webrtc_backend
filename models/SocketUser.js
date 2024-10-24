const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const SocketUserSchema = new Schema(
  {
    email: { type: String, unique: true, required: true },
    socketID: { type: String, required: true },
    roomID: { type: String, required: true },
  },
  {
    strict: true,
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

module.exports = mongoose.model("SocketUser", SocketUserSchema);
