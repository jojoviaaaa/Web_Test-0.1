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
const photosPath = path.join(__dirname, "uploads", "photos");
const dataFolder = path.join(__dirname, "data");

[musicPath, coversPath, photosPath, dataFolder].forEach(function (folder) {
  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder, { recursive: true });
  }
});

const songsFile = path.join(dataFolder, "songs.json");
if (!fs.existsSync(songsFile)) {
  fs.writeFileSync(songsFile, "[]");
}

const photosFile = path.join(dataFolder, "photos.json");
if (!fs.existsSync(photosFile)) {
  fs.writeFileSync(photosFile, "[]");
}

app.use("/music-files", express.static(musicPath));
app.use("/covers", express.static(coversPath));
app.use("/photo-files", express.static(photosPath));

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

const photoStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, photosPath);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  }
});
const uploadPhoto = multer({ storage: photoStorage });

app.post("/settings/upload-photo", uploadPhoto.single("file"), function (req, res) {
  const daftarFoto = JSON.parse(fs.readFileSync(photosFile));
  const entryBaru = {
    id: Date.now(),
    filename: req.file.filename,
    caption: req.body.caption || ""
  };
  daftarFoto.push(entryBaru);
  fs.writeFileSync(photosFile, JSON.stringify(daftarFoto, null, 2));
  res.json({ message: "Foto berhasil disimpan!", data: entryBaru });
});

app.get("/photos", function (req, res) {
  const daftarFoto = JSON.parse(fs.readFileSync(photosFile));
  res.json(daftarFoto);
});

app.listen(PORT, function () {
  console.log("Server jalan di http://localhost:" + PORT);
});