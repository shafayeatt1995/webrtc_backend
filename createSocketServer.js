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

  const activeUser = [];
  io.on("connection", (socket) => {
    socket.on("join-user", ({ email, roomID }) => {
      const i = activeUser.findIndex(({ id }) => id === socket.id);
      if (i === -1) activeUser.push({ email, id: socket.id, roomID });
      io.emit("active-users", { activeUser });
    });

    socket.on("local-offer", ({ sender, receiver, offer }) => {
      io.to(receiver.id).emit("remote-offer", { offer, sender, receiver });
    });

    socket.on("local-answer", ({ answer, sender, receiver }) => {
      io.to(sender.id).emit("remote-answer", { answer, sender, receiver });
    });

    socket.on("local-icecandidate", (candidate) => {
      socket.broadcast.emit("remote-icecandidate", candidate);
    });

    socket.on("disconnect", (reason) => {
      console.log(reason);
      const i = activeUser.findIndex(({ id }) => id === socket.id);
      if (i !== -1) activeUser.splice(i, 1);
      io.emit("active-users", { activeUser });
    });
  });

  global.io = io;
  return server;
};

module.exports = { createSocketServer };
