const express = require("express");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.static(__dirname));

const musicPath = path.join(__dirname, "uploads", "music");
const coversPath = path.join(__dirname, "uploads", "covers");
const dataFolder = path.join(__dirname, "data");

[musicPath, coversPath, dataFolder].forEach(function (folder) {
  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder, { recursive: true });
  }
});

const songsFile = path.join(dataFolder, "songs.json");
if (!fs.existsSync(songsFile)) {
  fs.writeFileSync(songsFile, "[]");
}

app.use("/music-files", express.static(musicPath));
app.use("/covers", express.static(coversPath));

const musicStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, musicPath);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  }
});
const uploadMusic = multer({ storage: musicStorage });

app.post("/settings/upload-music", uploadMusic.single("file"), async function (req, res) {
  try {
    const mm = await import("music-metadata");
    const filePath = path.join(musicPath, req.file.filename);
    const metadata = await mm.parseFile(filePath);

    const judul = metadata.common.title || req.file.originalname;
    const artis = metadata.common.artist || "Tidak diketahui";
    const album = metadata.common.album || "";

    let coverFilename = null;
    if (metadata.common.picture && metadata.common.picture.length > 0) {
      const gambar = metadata.common.picture[0];
      const ext = gambar.format.split("/")[1] || "jpg";
      coverFilename = "cover-" + Date.now() + "." + ext;
      fs.writeFileSync(path.join(coversPath, coverFilename), gambar.data);
    }

    const daftarLagu = JSON.parse(fs.readFileSync(songsFile));
    const entryBaru = {
      id: Date.now(),
      filename: req.file.filename,
      judul: judul,
      artis: artis,
      album: album,
      cover: coverFilename
    };
    daftarLagu.push(entryBaru);
    fs.writeFileSync(songsFile, JSON.stringify(daftarLagu, null, 2));

    res.json({ message: "Lagu berhasil disimpan!", data: entryBaru });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gagal proses metadata lagu" });
  }
});

app.get("/songs", function (req, res) {
  const daftarLagu = JSON.parse(fs.readFileSync(songsFile));
  res.json(daftarLagu);
});

app.listen(PORT, function () {
  console.log("Server jalan di http://localhost:" + PORT);
});