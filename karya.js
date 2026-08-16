const karyaContent = document.getElementById("karyaContent");
const slug = window.location.pathname.split("/karya/")[1];

let semuaKarya = [];
let karyaSekarang = null;

function bangunHalaman() {
  const fotoUtama = karyaSekarang.foto[0];

  let thumbnailHtml = "";
  karyaSekarang.foto.forEach(function(f, i) {
    thumbnailHtml += "<img src='/photo-files/" + f + "' class='thumb-item" + (i === 0 ? " active" : "") + "' data-src='/photo-files/" + f + "'>";
  });

  const index = semuaKarya.findIndex(function(k) { return k.slug === karyaSekarang.slug; });
  const prev = semuaKarya[index - 1];
  const next = semuaKarya[index + 1];

  karyaContent.innerHTML =
    "<p class='breadcrumb'>Beranda / Karya / <strong>" + karyaSekarang.judul + "</strong></p>" +
    "<div class='karya-detail'>" +
      "<div class='karya-detail-gallery'>" +
        "<img src='/photo-files/" + fotoUtama + "' class='foto-utama' id='fotoUtama'>" +
        "<div class='thumb-strip' id='thumbStrip'>" + thumbnailHtml + "</div>" +
      "</div>" +
      "<div class='karya-detail-info'>" +
        "<h1>" + karyaSekarang.judul + "</h1>" +
        "<p class='karya-kategori-tag'>" + karyaSekarang.kategori + "</p>" +
        "<p class='karya-deskripsi'>" + (karyaSekarang.deskripsi || "Tidak ada deskripsi.") + "</p>" +
      "</div>" +
    "</div>" +
    "<div class='karya-nav'>" +
      (prev ? "<a href='/karya/" + prev.slug + "' class='karya-nav-link'>&larr; " + prev.judul + "</a>" : "<span class='karya-nav-link disabled'>&larr; Tidak ada lagi</span>") +
      (next ? "<a href='/karya/" + next.slug + "' class='karya-nav-link'>" + next.judul + " &rarr;</a>" : "<span class='karya-nav-link disabled'>Tidak ada lagi &rarr;</span>") +
    "</div>";

  document.getElementById("thumbStrip").querySelectorAll(".thumb-item").forEach(function(thumb) {
    thumb.addEventListener("click", function() {
      document.getElementById("fotoUtama").src = thumb.dataset.src;
      document.querySelectorAll(".thumb-item").forEach(function(t) { t.classList.remove("active"); });
      thumb.classList.add("active");
    });
  });
}

Promise.all([
  fetch("/api/karya/" + slug).then(function(res) { return res.json(); }),
  fetch("/api/karya").then(function(res) { return res.json(); })
]).then(function(hasil) {
  karyaSekarang = hasil[0];
  semuaKarya = hasil[1];
  if (karyaSekarang.error) {
    karyaContent.innerHTML = "<p>Karya tidak ditemukan.</p>";
    return;
  }
  bangunHalaman();
}).catch(function(err) { console.error("Gagal muat karya:", err); });