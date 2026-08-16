const karyaGridSemua = document.getElementById("karyaGridSemua");
const kategoriPills = document.getElementById("kategoriPills");
const inputCari = document.getElementById("inputCari");

let semuaKarya = [];
let kategoriAktif = "Semua";
let kataKunci = "";

function renderPills() {
  const daftarKategori = ["Semua"].concat(
    Array.from(new Set(semuaKarya.map(function(k) { return k.kategori; })))
  );

  kategoriPills.innerHTML = "";
  daftarKategori.forEach(function(kat) {
    const pill = document.createElement("button");
    pill.className = "kategori-pill" + (kat === kategoriAktif ? " active" : "");
    pill.textContent = kat;
    pill.addEventListener("click", function() {
      kategoriAktif = kat;
      renderPills();
      renderGrid();
    });
    kategoriPills.appendChild(pill);
  });
}

function renderGrid() {
  const hasil = semuaKarya.filter(function(k) {
    const cocokKategori = kategoriAktif === "Semua" || k.kategori === kategoriAktif;
    const cocokPencarian = k.judul.toLowerCase().includes(kataKunci.toLowerCase());
    return cocokKategori && cocokPencarian;
  });

  karyaGridSemua.innerHTML = "";
  if (hasil.length === 0) {
    karyaGridSemua.innerHTML = "<div class='karya-empty'>Tidak ada karya yang cocok.</div>";
    return;
  }

  hasil.slice().reverse().forEach(function(karya, i) {
    const card = document.createElement("a");
    card.href = "/karya/" + karya.slug;
    card.className = "karya-card";
    card.style.animationDelay = (i * 0.05) + "s";

    const img = document.createElement("img");
    img.src = "/photo-files/" + karya.cover;
    img.loading = "lazy";
    card.appendChild(img);

    const label = document.createElement("div");
    label.className = "karya-label";
    label.innerHTML = "<div class='karya-title'>" + karya.judul + "</div>" +
      "<div class='karya-kategori'>" + karya.kategori + "</div>";
    card.appendChild(label);

    karyaGridSemua.appendChild(card);
  });
}

inputCari.addEventListener("input", function() {
  kataKunci = inputCari.value;
  renderGrid();
});

fetch("/api/karya")
  .then(function(res) { return res.json(); })
  .then(function(data) {
    semuaKarya = data;
    renderPills();
    renderGrid();
  })
  .catch(function(err) { console.error("Gagal muat karya:", err); });