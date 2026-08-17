const app = document.getElementById("app");

// ---------- Router ----------
function updateActiveNav() {
  const path = window.location.pathname;
  document.querySelectorAll(".nav-link").forEach(function(link) {
    link.classList.toggle("active", link.getAttribute("href") === path);
  });
}

function renderRoute() {
  const path = window.location.pathname;
  updateActiveNav();

  if (path === "/" || path === "/index.html") {
    renderBeranda();
  } else if (path === "/semua-karya") {
    renderSemuaKarya();
  } else if (path === "/settings") {
    renderSettings();
  } else if (path.startsWith("/karya/")) {
    renderKaryaDetail(path.split("/karya/")[1]);
  } else {
    app.innerHTML = "<h1>Halaman tidak ditemukan</h1>";
  }
}

function navigateTo(path) {
  history.pushState(null, "", path);
  renderRoute();
}

document.body.addEventListener("click", function(e) {
  const link = e.target.closest("a");
  if (!link) return;
  const href = link.getAttribute("href");
  if (!href || !href.startsWith("/")) return;
  e.preventDefault();
  navigateTo(href);
});

window.addEventListener("popstate", renderRoute);

// ---------- Halaman: Beranda ----------
function renderBeranda() {
  app.innerHTML = "<h1>Karya</h1><div class='karya-grid' id='karyaGrid'></div>";

  fetch("/api/karya")
    .then(function(res) { return res.json(); })
    .then(function(daftarKarya) {
      const karyaGrid = document.getElementById("karyaGrid");
      if (daftarKarya.length === 0) {
        karyaGrid.innerHTML = "<div class='karya-empty'>Belum ada karya. Upload lewat halaman Settings.</div>";
        return;
      }
      karyaGrid.innerHTML = "";
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
}

// ---------- Halaman: Semua Karya ----------
function renderSemuaKarya() {
  app.innerHTML =
    "<h1>Semua Karya</h1>" +
    "<div class='search-bar'><input type='text' id='inputCari' placeholder='Cari judul karya...'></div>" +
    "<div class='kategori-pills' id='kategoriPills'></div>" +
    "<div class='karya-grid' id='karyaGridSemua'></div>";

  const karyaGridSemua = document.getElementById("karyaGridSemua");
  const kategoriPills = document.getElementById("kategoriPills");
  const inputCari = document.getElementById("inputCari");

  let semuaKaryaData = [];
  let kategoriAktif = "Semua";
  let kataKunci = "";

  function renderPills() {
    const daftarKategori = ["Semua"].concat(
      Array.from(new Set(semuaKaryaData.map(function(k) { return k.kategori; })))
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
    const hasil = semuaKaryaData.filter(function(k) {
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
      semuaKaryaData = data;
      renderPills();
      renderGrid();
    })
    .catch(function(err) { console.error("Gagal muat karya:", err); });
}

// ---------- Halaman: Settings ----------
function renderSettings() {
  fetch("/api/check-auth")
    .then(function(res) { return res.json(); })
    .then(function(data) {
      if (data.isAdmin) {
        renderSettingsForm();
      } else {
        renderLoginForm();
      }
    })
    .catch(function(err) { console.error("Gagal cek login:", err); });
}

function renderLoginForm() {
  app.innerHTML =
    "<h1>Settings</h1>" +
    "<form id='formLogin' class='login-form'>" +
      "<input type='password' id='inputPassword' placeholder='Password' required>" +
      "<button type='submit'>Masuk</button>" +
    "</form>" +
    "<p class='login-error' id='loginError'></p>";

  document.getElementById("formLogin").addEventListener("submit", function(e) {
    e.preventDefault();
    const password = document.getElementById("inputPassword").value;

    fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: password })
    })
      .then(function(res) { return res.json(); })
      .then(function(data) {
        if (data.success) {
          renderSettingsForm();
        } else {
          document.getElementById("loginError").textContent = "Password salah, coba lagi.";
        }
      })
      .catch(function(err) { console.error("Gagal login:", err); });
  });
}

function renderSettingsForm() {
  app.innerHTML =
    "<div class='settings-header'><h1>Settings</h1><button id='btnLogout' class='logout-btn'>Keluar</button></div>" +
    "<h2>Upload musik</h2>" +
    "<label for='inputMusic' class='file-label'>Pilih file musik</label>" +
    "<input type='file' id='inputMusic' accept='audio/flac,audio/*' class='file-input-hidden'>" +
    "<span class='file-name' id='fileNameMusic'>Belum ada file dipilih</span>" +
    "<div id='songList' class='song-list'></div>" +
    "<h2>Buat Karya baru</h2>" +
    "<form id='formKarya' class='photo-form'>" +
      "<input type='text' id='inputJudul' placeholder='Judul karya' required>" +
      "<input type='text' id='inputKategori' placeholder='Kategori'>" +
      "<textarea id='inputDeskripsi' placeholder='Deskripsi singkat (opsional)' rows='3'></textarea>" +
      "<label for='inputFotoKarya' class='file-label'>Pilih foto (bisa lebih dari satu)</label>" +
    "<input type='file' id='inputFotoKarya' accept='image/*' multiple required class='file-input-hidden'>" +
    "<span class='file-name' id='fileNameFoto'>Belum ada foto dipilih</span>" +
    "<p class='hint'>Tahan Ctrl (atau Shift) sambil klik buat pilih banyak foto jadi satu album.</p>" +
    "</form>" +
    "<div id='karyaListSettings' class='photo-grid-mini'></div>";

  document.getElementById("btnLogout").addEventListener("click", function() {
    fetch("/api/logout", { method: "POST" }).then(function() { renderSettings(); });
  });

  const inputMusic = document.getElementById("inputMusic");
  const songList = document.getElementById("songList");

  function muatDaftarLagu() {
    songList.innerHTML = "";
    fetch("/songs")
      .then(function(res) { return res.json(); })
      .then(function(daftarLagu) {
        daftarLagu.slice().reverse().forEach(function(lagu) {
          const item = document.createElement("div");
          item.className = "song-row";

          const cover = document.createElement("div");
          cover.className = "song-cover";
          if (lagu.cover) cover.style.backgroundImage = "url(/covers/" + lagu.cover + ")";
          item.appendChild(cover);

          const info = document.createElement("div");
          info.className = "song-info";
          info.innerHTML = "<div class='song-title'>" + lagu.judul + "</div>" +
            "<div class='song-artist'>" + lagu.artis + "</div>";
          item.appendChild(info);

          item.addEventListener("click", function() {
            putarLaguById(lagu.id);
          });

          songList.appendChild(item);
        });
      })
      .catch(function(err) { console.error("Gagal muat daftar lagu:", err); });
  }

  inputMusic.addEventListener("change", function() {
    const file = inputMusic.files[0];
    document.getElementById("fileNameMusic").textContent = file ? file.name : "Belum ada file dipilih";
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    fetch("/settings/upload-music", { method: "POST", body: formData })
      .then(function(res) { return res.json(); })
      .then(function(data) {
        console.log("Lagu tersimpan:", data);
        muatDaftarLagu();
        muatSemuaLagu();
      })
      .catch(function(err) { console.error("Gagal upload lagu:", err); });
  });

  muatDaftarLagu();

  const formKarya = document.getElementById("formKarya");
  const karyaListSettings = document.getElementById("karyaListSettings");

  document.getElementById("inputFotoKarya").addEventListener("change", function() {
    const jumlah = this.files.length;
    document.getElementById("fileNameFoto").textContent = jumlah > 0 ? jumlah + " foto dipilih" : "Belum ada foto dipilih";
  });

  function muatDaftarKarya() {
    karyaListSettings.innerHTML = "";
    fetch("/api/karya")
      .then(function(res) { return res.json(); })
      .then(function(daftarKarya) {
        daftarKarya.slice().reverse().forEach(function(karya) {
          const wrap = document.createElement("div");
          wrap.className = "photo-thumb-wrap";

          const thumb = document.createElement("div");
          thumb.className = "photo-thumb";
          thumb.style.backgroundImage = "url(/photo-files/" + karya.cover + ")";
          thumb.title = karya.judul + " (" + karya.foto.length + " foto)";
          wrap.appendChild(thumb);

          const hapus = document.createElement("button");
          hapus.type = "button";
          hapus.className = "photo-thumb-delete";
          hapus.textContent = "\u00D7";
          hapus.addEventListener("click", function() {
            if (!confirm("Hapus \"" + karya.judul + "\"?")) return;
            fetch("/settings/karya/" + karya.id, { method: "DELETE" })
              .then(function(res) { return res.json(); })
              .then(function() { muatDaftarKarya(); })
              .catch(function(err) { console.error("Gagal hapus:", err); });
          });
          wrap.appendChild(hapus);

          karyaListSettings.appendChild(wrap);
        });
      })
      .catch(function(err) { console.error("Gagal muat karya:", err); });
  }

  formKarya.addEventListener("submit", function(e) {
    e.preventDefault();
    const files = document.getElementById("inputFotoKarya").files;
    if (!files || files.length === 0) return;

    const tombolSubmit = formKarya.querySelector("button[type='submit']");
    tombolSubmit.disabled = true;
    tombolSubmit.textContent = "Menyimpan...";

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) formData.append("foto", files[i]);
    formData.append("judul", document.getElementById("inputJudul").value);
    formData.append("kategori", document.getElementById("inputKategori").value);
    formData.append("deskripsi", document.getElementById("inputDeskripsi").value);

    fetch("/settings/upload-karya", { method: "POST", body: formData })
      .then(function(res) { return res.json(); })
      .then(function(data) {
        console.log("Karya tersimpan:", data);
        formKarya.reset();
        const namaFoto = document.getElementById("fileNameFoto");
        if (namaFoto) namaFoto.textContent = "Belum ada foto dipilih";
        muatDaftarKarya();
      })
      .catch(function(err) { console.error("Gagal simpan karya:", err); })
      .finally(function() {
        tombolSubmit.disabled = false;
        tombolSubmit.textContent = "Simpan karya";
      });
  });

  muatDaftarKarya();
}

// ---------- Halaman: Detail Karya ----------
function renderKaryaDetail(slug) {
  app.innerHTML = "<p class='subtitle'>Memuat karya...</p>";

  Promise.all([
    fetch("/api/karya/" + slug).then(function(res) { return res.json(); }),
    fetch("/api/karya").then(function(res) { return res.json(); })
  ]).then(function(hasil) {
    const karyaSekarang = hasil[0];
    const semuaKaryaList = hasil[1];

    if (karyaSekarang.error) {
      app.innerHTML = "<p>Karya tidak ditemukan.</p>";
      return;
    }

    const fotoUtama = karyaSekarang.foto[0];
    let thumbnailHtml = "";
    karyaSekarang.foto.forEach(function(f, i) {
      thumbnailHtml += "<img src='/photo-files/" + f + "' class='thumb-item" + (i === 0 ? " active" : "") + "' data-src='/photo-files/" + f + "'>";
    });

    const index = semuaKaryaList.findIndex(function(k) { return k.slug === karyaSekarang.slug; });
    const prev = semuaKaryaList[index - 1];
    const next = semuaKaryaList[index + 1];

    app.innerHTML =
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
  }).catch(function(err) { console.error("Gagal muat karya:", err); });
}

// ---------- Mulai ----------
renderRoute();