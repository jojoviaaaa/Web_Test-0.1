const audioPlayer = document.getElementById("audioPlayer");
const coverArt = document.getElementById("coverArt");
const trackTitle = document.getElementById("trackTitle");
const trackArtist = document.getElementById("trackArtist");
const btnPrev = document.getElementById("btnPrev");
const btnNext = document.getElementById("btnNext");

let daftarLagu = [];
let indexSekarang = 0;

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
  .catch(function(err) {
    console.error("Gagal muat lagu:", err);
  });