const http = require("http");
const { off } = require("process");
const { Server } = require("socket.io");

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

  io.on("connection", (socket) => {
    socket.on("join-room", ({ roomID }) => {
      socket.join(roomID);
    });

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

    socket.on("local-icecandidate", async ({ candidate, roomID }) => {
      socket.broadcast.to(roomID).emit("remote-icecandidate", candidate);
    });

    socket.on("disconnect", async (reason) => {
      console.log(reason);
    });
  });

  global.io = io;
  return server;
};

module.exports = { createSocketServer };
