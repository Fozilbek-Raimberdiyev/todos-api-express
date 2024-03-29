const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const dotenv = require("dotenv");
const router = require("./routes");
const fs = require("fs");
const mime = require("mime");
const morgan = require("morgan")
//setting node environment variables
dotenv.config()
// Set up MIME types
mime.define(
  {
    "text/css": ["css"],
    "image/png": ["png"],
    "image/jpeg": ["jpg", "jpeg"],
    "application/pdf": ["pdf"],
    "audio/mpeg": ["mp3"],
    "audio/wav": ["wav"],
    "audio/ogg": ["ogg"],
    "audio/midi": ["midi"],
    "audio/webm": ["webm"],
  },
  { force: true }
);


//connecting to database
mongoose.set("strictQuery", false);
mongoose
  .connect(process.env.DB_HOST, {})
  .then(() => {
    console.log("MongoDB ga ulanish muvaffaqqiyatli amalga oshirildi", 'address :' +  process.env.DB_HOST)
  })
  .catch((er) => {
    console.log("MongoDB ga ulanishda xato ro'y berdi", er);
  });

//declaring app
const app = express();

//setup websocket
const server = require("http").Server(app)
const io = require("socket.io")(server)
//configuring static files
app.use(express.static("public"));

// Increase maximum payload size to 10mb
app.use(bodyParser.json({ limit: "6mb" }));
app.use(bodyParser.urlencoded({ limit: "6mb", extended: true }));

//using cors
app.use(
  cors({
    origin: "*", // replace with the actual origin of your Vue.js app
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// app.use(compression)

app.get("/", (req, res) => {
  res.send({ message: "Assalomu alaykum!" });
});

app.get("/public/uploads/:filename", async(req, res) => {

  let fileName = req.params.filename;
  fs.access(`${__dirname}/public/uploads/${fileName}`, (err) => {
    if (err) {
      console.error(err);
      return res.status(404).send("Fayl topilmadi");
    }
    if (req.params.filename.includes(".png")) {
      res.type("png");
    } else if (req.params.filename.includes(".jpg")) {
      res.type("jpg");
    } else if (req.params.filename.includes(".jpeg")) {
      res.type("jpeg");
    } else {
      return res.status(400).send({ message: "Fayl ko'rsatilgan tipda emas!" });
    }
    return res.sendFile(`${__dirname}/public/uploads/${fileName}`);
  });
});

//get listening audio
app.get("/public/uploads/listening/:filename", (req, res) => {
  let fileName = req.params.filename;
  let file = fs.access(
    `${__dirname}/public/uploads/listening/${fileName}`,
    function (err, data) {
      if (err) {
        console.error(err);
        return;
      }
      if (req.params.filename.includes(".mp3")) {
        res.type("mp3");
      } else if (req.params.filename.includes(".wav")) {
        res.type("wav");
      } else if (req.params.filename.includes(".ogg")) {
        res.type("ogg");
      } else if (req.params.filename.includes(".midi ")) {
        res.type("midi");
      } else if (req.params.filename.includes(".webm ")) {
        res.type("webm");
      } else {
        return res
          .status(400)
          .send({ message: "Fayl ko'rsatilgan tipda emas!" });
      }
      return res.sendFile(`${__dirname}/public/uploads/listening/${fileName}`);
    }
  );
});

//initial route
app.use("/api", router);

// parse application/x-www-form-urlencoded
// app.use(bodyParser.urlencoded({ extended: true, limit : "50mb" }));
// app.use(bodyParser.json({limit : "50mb"}))

// app.use(express.json());
// parse application/jsonapp.use(bodyParser.json());

//using morgan logger
app.use(morgan("tiny"));

// listening port
server.listen(process.env.PORT || 3000, () => {
  console.log("Server is listening in ", process.env.PORT, 'mode : ',process.env.NODE_ENV );
});
