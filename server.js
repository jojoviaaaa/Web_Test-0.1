require("dotenv").config();

const express = require("express");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const fs = require("fs");
const session = require("express-session");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET || "ganti-ini-di-env",
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 24 * 7 }
}));
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

const karyaFile = path.join(dataFolder, "karya.json");
if (!fs.existsSync(karyaFile)) {
  fs.writeFileSync(karyaFile, "[]");
}

app.use("/music-files", express.static(musicPath));
app.use("/covers", express.static(coversPath));
app.use("/photo-files", express.static(photosPath));

// ---- Autentikasi ----
function requireAdmin(req, res, next) {
  if (req.session.isAdmin) {
    next();
  } else {
    res.status(401).json({ error: "Belum login" });
  }
}

app.post("/api/login", function (req, res) {
  if (req.body.password === process.env.ADMIN_PASSWORD) {
    req.session.isAdmin = true;
    res.json({ success: true });
  } else {
    res.status(401).json({ success: false, error: "Password salah" });
  }
});

app.post("/api/logout", function (req, res) {
  req.session.destroy(function () {
    res.json({ success: true });
  });
});

app.get("/api/check-auth", function (req, res) {
  res.json({ isAdmin: !!req.session.isAdmin });
});

// ---- Musik ----
const musicStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, musicPath);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  }
});
const uploadMusic = multer({ storage: musicStorage });

app.post("/settings/upload-music", requireAdmin, uploadMusic.single("file"), async function (req, res) {
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

// ---- Karya (proyek foto) ----
const photoStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, photosPath);
  },
  filename: function (req, file, cb) {
    const acak = Math.random().toString(36).slice(2, 8);
    cb(null, Date.now() + "-" + acak + "-" + file.originalname);
  }
});
const uploadFoto = multer({ storage: photoStorage });

function buatSlug(teks) {
  return teks.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

app.post("/settings/upload-karya", requireAdmin, uploadFoto.array("foto", 30), function (req, res) {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: "Minimal 1 foto dibutuhkan" });
  }

  const daftarKarya = JSON.parse(fs.readFileSync(karyaFile));
  const namaFile = req.files.map(function (f) { return f.filename; });

  const entryBaru = {
    id: Date.now(),
    slug: buatSlug(req.body.judul) + "-" + Date.now(),
    judul: req.body.judul,
    kategori: req.body.kategori || "Umum",
    deskripsi: req.body.deskripsi || "",
    cover: namaFile[0],
    foto: namaFile
  };

  daftarKarya.push(entryBaru);
  fs.writeFileSync(karyaFile, JSON.stringify(daftarKarya, null, 2));

  res.json({ message: "Karya berhasil disimpan!", data: entryBaru });
});

app.get("/api/karya", function (req, res) {
  const daftarKarya = JSON.parse(fs.readFileSync(karyaFile));
  res.json(daftarKarya);
});

app.get("/api/karya/:slug", function (req, res) {
  const daftarKarya = JSON.parse(fs.readFileSync(karyaFile));
  const karya = daftarKarya.find(function (k) { return k.slug === req.params.slug; });
  if (!karya) return res.status(404).json({ error: "Karya tidak ditemukan" });
  res.json(karya);
});

app.get(["/", "/semua-karya", "/settings", "/karya/:slug"], function (req, res) {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.delete("/settings/karya/:id", requireAdmin, function (req, res) {
  const daftarKarya = JSON.parse(fs.readFileSync(karyaFile));
  const index = daftarKarya.findIndex(function (k) { return String(k.id) === req.params.id; });
  if (index === -1) return res.status(404).json({ error: "Karya tidak ditemukan" });

  const karya = daftarKarya[index];
  karya.foto.forEach(function (f) {
    const filePath = path.join(photosPath, f);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  });

  daftarKarya.splice(index, 1);
  fs.writeFileSync(karyaFile, JSON.stringify(daftarKarya, null, 2));
  res.json({ message: "Karya berhasil dihapus" });
});

app.listen(PORT, function () {
  console.log("Server jalan di http://localhost:" + PORT);
});