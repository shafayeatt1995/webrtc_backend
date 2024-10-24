const http = require("http");
const { off } = require("process");
const { Server } = require("socket.io");
const { SocketUser } = require("./models");

const createSocketServer = (app) => {
  const server = http.createServer(app);
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:8080",
      methods: ["GET", "POST"],
      transports: ["websocket"],
      credentials: true,
    },
  });

  const activeUser = [];
  io.on("connection", (socket) => {
    socket.on("local-offer", ({ sender, receiver, offer }) => {
      io.to(receiver.socketID).emit("remote-offer", {
        offer,
        sender,
        receiver,
      });
    });

    socket.on("local-answer", ({ answer, sender, receiver }) => {
      io.to(sender.socketID).emit("remote-answer", {
        answer,
        sender,
        receiver,
      });
    });

    socket.on("local-icecandidate", (candidate) => {
      socket.broadcast.emit("remote-icecandidate", candidate);
    });

    socket.on("disconnect", async (reason) => {
      console.log(reason);
      try {
        await SocketUser.deleteOne({ socketID: socket.id });
      } catch (error) {}
      io.emit("active-users", { activeUser });
    });
  });

  global.io = io;
  return server;
};

module.exports = { createSocketServer };
