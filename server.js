const express = require("express");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const fs = require("fs");

const app = express();
const PORT = 3000;

app.use(cors());

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "..", "..", "uploads"));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  }
});
const upload = multer({ storage: storage });

app.use(express.static(__dirname));
app.use("/uploads", express.static(path.join(__dirname, "..", "..", "uploads")));

app.post("/upload", upload.single("file"), function (req, res) {
  res.json({ message: "File berhasil disimpan!", filename: req.file.filename });
});

app.get("/files", function (req, res) {
  const uploadsPath = path.join(__dirname, "..", "..", "uploads");
  fs.readdir(uploadsPath, function (err, files) {
    if (err) return res.status(500).json({ error: "Gagal baca folder uploads" });
    res.json(files);
  });
});

app.listen(PORT, function () {
  console.log("Server jalan di http://localhost:" + PORT);
});