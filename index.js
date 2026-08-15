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

const portfolioGrid = document.querySelector(".portfolio-grid");
const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightboxImg");
const lightboxCaption = document.getElementById("lightboxCaption");
const lightboxClose = document.getElementById("lightboxClose");

function bukaLightbox(foto) {
  lightboxImg.src = "/photo-files/" + foto.filename;
  lightboxCaption.textContent = foto.caption || "";
  lightbox.classList.add("active");
}

function tutupLightbox() {
  lightbox.classList.remove("active");
}

lightboxClose.addEventListener("click", tutupLightbox);
lightbox.addEventListener("click", function(e) {
  if (e.target === lightbox) tutupLightbox();
});

function muatPortfolio() {
  fetch("/photos")
    .then(function(res) { return res.json(); })
    .then(function(daftarFoto) {
      portfolioGrid.innerHTML = "";
      if (daftarFoto.length === 0) {
        portfolioGrid.innerHTML = "<div class='portfolio-empty'>Belum ada foto. Upload lewat halaman Settings.</div>";
        return;
      }
      daftarFoto.slice().reverse().forEach(function(foto, i) {
        const item = document.createElement("div");
        item.className = "portfolio-item";
        item.style.animationDelay = (i * 0.06) + "s";

        const img = document.createElement("img");
        img.src = "/photo-files/" + foto.filename;
        img.loading = "lazy";
        item.appendChild(img);

        item.addEventListener("click", function() {
          bukaLightbox(foto);
        });

        portfolioGrid.appendChild(item);
      });
    })
    .catch(function(err) {
      console.error("Gagal muat portofolio:", err);
    });
}

muatPortfolio();