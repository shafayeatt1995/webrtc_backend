const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Schema = mongoose.Schema;

const RoomSchema = new Schema(
  {
    id: { type: String, unique: true, index: true },
    name: { type: String, required: true },
    users: { type: [Schema.Types.ObjectId], default: [] },
    creator: { type: Schema.Types.ObjectId, required: true },
  },
  {
    strict: true,
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

module.exports = mongoose.model("Room", RoomSchema);
