const express = require("express");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

const musicPath = path.join(__dirname, "uploads", "music");
if (!fs.existsSync(musicPath)) {
  fs.mkdirSync(musicPath, { recursive: true });
}

const musicStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, musicPath);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  }
});
const uploadMusic = multer({ storage: musicStorage });

app.use(express.static(__dirname));
app.use("/music-files", express.static(musicPath));

app.post("/upload-music", uploadMusic.single("file"), function (req, res) {
  res.json({ message: "Lagu berhasil disimpan!", filename: req.file.filename });
});

app.get("/songs", function (req, res) {
  fs.readdir(musicPath, function (err, files) {
    if (err) return res.status(500).json({ error: "Gagal baca folder music" });
    res.json(files);
  });
});

app.listen(PORT, function () {
  console.log("Server jalan di http://localhost:" + PORT);
});