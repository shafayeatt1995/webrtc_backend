require("dotenv").config();
const express = require("express");
const app = express();
const port = 8000;
const compression = require("compression");
const session = require("express-session");
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const fileUpload = require("express-fileupload");
const { mongoConnect } = require("./config/database");
const mongoMiddleware = require("./middleware/mongoMiddleware");
const { createSocketServer } = require("./createSocketServer");

app.use(
  cors({
    origin: ["http://localhost:8080", "https://medical-next-iota.vercel.app"],
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(compression());
app.use(fileUpload({ limits: { fileSize: 10 * 1024 * 1024 } }));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});
app.use("/", mongoMiddleware, require("./routes"));

const server = createSocketServer(app);
server.listen(port, async () => {
  console.log(`Server is running at http://localhost:${port}`);
  await mongoConnect();
});
