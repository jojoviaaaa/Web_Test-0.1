const audioPlayer = document.getElementById("audioPlayer");
const coverArt = document.getElementById("coverArt");
const trackTitle = document.getElementById("trackTitle");
const trackArtist = document.getElementById("trackArtist");
const btnPrev = document.getElementById("btnPrev");
const btnNext = document.getElementById("btnNext");
const btnPlay = document.getElementById("btnPlay");
const progressBar = document.getElementById("progressBar");
const progressFill = document.getElementById("progressFill");
const timeSekarang = document.getElementById("timeSekarang");
const timeDurasi = document.getElementById("timeDurasi");

let daftarLagu = [];
let indexSekarang = 0;

function formatWaktu(detik) {
  if (isNaN(detik)) return "0:00";
  const menit = Math.floor(detik / 60);
  const sisaDetik = Math.floor(detik % 60);
  return menit + ":" + (sisaDetik < 10 ? "0" : "") + sisaDetik;
}

function tampilkanLagu(index) {
  if (daftarLagu.length === 0) return;
  indexSekarang = (index + daftarLagu.length) % daftarLagu.length;
  const lagu = daftarLagu[indexSekarang];

  audioPlayer.src = "/music-files/" + lagu.filename;
  trackTitle.textContent = lagu.judul;
  trackArtist.textContent = lagu.artis;
  coverArt.style.backgroundImage = lagu.cover ? "url(/covers/" + lagu.cover + ")" : "none";

  localStorage.setItem("lastSongId", lagu.id);
}

btnPrev.addEventListener("click", function() {
  tampilkanLagu(indexSekarang - 1);
  audioPlayer.play();
});

btnNext.addEventListener("click", function() {
  tampilkanLagu(indexSekarang + 1);
  audioPlayer.play();
});

btnPlay.addEventListener("click", function() {
  if (audioPlayer.paused) {
    audioPlayer.play();
  } else {
    audioPlayer.pause();
  }
});

audioPlayer.addEventListener("play", function() { btnPlay.textContent = "⏸"; });
audioPlayer.addEventListener("pause", function() { btnPlay.textContent = "▶"; });

audioPlayer.addEventListener("timeupdate", function() {
  const persen = (audioPlayer.currentTime / audioPlayer.duration) * 100;
  progressFill.style.width = (isNaN(persen) ? 0 : persen) + "%";
  timeSekarang.textContent = formatWaktu(audioPlayer.currentTime);
});

audioPlayer.addEventListener("loadedmetadata", function() {
  timeDurasi.textContent = formatWaktu(audioPlayer.duration);
});

audioPlayer.addEventListener("ended", function() {
  tampilkanLagu(indexSekarang + 1);
  audioPlayer.play();
});

progressBar.addEventListener("click", function(e) {
  const rect = progressBar.getBoundingClientRect();
  const persenKlik = (e.clientX - rect.left) / rect.width;
  audioPlayer.currentTime = persenKlik * audioPlayer.duration;
});

fetch("/songs")
  .then(function(res) { return res.json(); })
  .then(function(data) {
    daftarLagu = data;
    if (daftarLagu.length === 0) return;
    const lastId = localStorage.getItem("lastSongId");
    let startIndex = 0;
    if (lastId) {
      const idx = daftarLagu.findIndex(function(l) { return String(l.id) === lastId; });
      if (idx !== -1) startIndex = idx;
    }
    tampilkanLagu(startIndex);
  })
  .catch(function(err) { console.error("Gagal muat lagu:", err); });