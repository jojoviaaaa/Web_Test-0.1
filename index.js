const karyaGrid = document.getElementById("karyaGrid");

fetch("/api/karya")
  .then(function(res) { return res.json(); })
  .then(function(daftarKarya) {
    karyaGrid.innerHTML = "";
    if (daftarKarya.length === 0) {
      karyaGrid.innerHTML = "<div class='karya-empty'>Belum ada karya. Upload lewat halaman Settings.</div>";
      return;
    }
    daftarKarya.slice().reverse().forEach(function(karya, i) {
      const card = document.createElement("a");
      card.href = "/karya/" + karya.slug;
      card.className = "karya-card";
      card.style.animationDelay = (i * 0.06) + "s";

      const img = document.createElement("img");
      img.src = "/photo-files/" + karya.cover;
      img.loading = "lazy";
      card.appendChild(img);

      const label = document.createElement("div");
      label.className = "karya-label";
      label.innerHTML = "<div class='karya-title'>" + karya.judul + "</div>" +
        "<div class='karya-kategori'>" + karya.kategori + "</div>";
      card.appendChild(label);

      karyaGrid.appendChild(card);
    });
  })
  .catch(function(err) { console.error("Gagal muat karya:", err); });