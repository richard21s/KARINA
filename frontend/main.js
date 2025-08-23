import { AuthClient } from "@dfinity/auth-client";
import { createActor } from "./declarations/backend";
import { renderChart } from "./chart.js";

const OPENROUTER_API_KEY = "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";


let actor;
let identity;

export async function loadComponents() {
  const sidebarHtml = await fetch("sidebar.html").then(r => r.text());
  document.getElementById("sidebar-placeholder").innerHTML = sidebarHtml;

  const headerHtml = await fetch("header.html").then(r => r.text());
  document.getElementById("header-placeholder").innerHTML = headerHtml;

  initSidebarAndHeader();
}

function initSidebarAndHeader() {
  const principal = localStorage.getItem("principal");
  const token = localStorage.getItem("googleAccessToken");
  const email = localStorage.getItem("googleEmail");
  // ✅ Cek login
  if ((!token && !principal) || !email || !email.includes("@")) {
    alert("Anda belum login. Silakan login dulu.");
    window.location.href = "index.html";
    return;
  }
  // ✅ Sidebar toggle
  const hamburger = document.getElementById('hamburger');
  const body = document.body;
  hamburger?.addEventListener('click', () => {
    body.classList.toggle('sidebar-visible');
    hamburger.classList.toggle('open');
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.sidebar') && !e.target.closest('#hamburger')) {
      body.classList.remove('sidebar-visible');
      hamburger?.classList.remove('open');
    }
  });

  // ✅ Navigasi sidebar
  document.querySelector('.home')?.addEventListener('click', () => window.location.href = "home.html");
  document.querySelector('.main')?.addEventListener('click', () => window.location.href = "analisis.html");
  document.querySelector('.history')?.addEventListener('click', () => window.location.href = "history.html");
  document.querySelector('.calendar')?.addEventListener('click', () => window.location.href = "calendar.html");

  // ✅ Tombol logout
  // document.querySelector('.logout')?.addEventListener('click', async () => {
  //   localStorage.clear();
  //   window.location.href = "index.html?logout=" + Date.now();
  // });
  // Logout handler
  document.querySelector('.logout')?.addEventListener('click', async () => {
    const token = localStorage.getItem("googleAccessToken");

    // Revoke token Google jika tersedia
    if (token) {
      try {
        await fetch(`https://accounts.google.com/o/oauth2/revoke?token=${token}`, {
          method: 'GET',
          mode: 'no-cors'
        });
        console.log("✅ Google token revoked");
      } catch (e) {
        console.warn("⚠️ Gagal revoke token Google, lanjutkan logout lokal");
      }
    }

    // Logout dari Internet Identity (auth-client)
    try {
      const authClient = await AuthClient.create();
      await authClient.logout();
      console.log("✅ Internet Identity logout sukses");
    } catch (e) {
      console.warn("⚠️ Gagal logout Internet Identity:", e);
    }

    // Bersihkan hanya data login (❌ jangan hapus lastChartData)
    localStorage.removeItem("googleAccessToken");
    localStorage.removeItem("registeredEmails");
    localStorage.removeItem("principal");
    localStorage.removeItem("loggedIn");
    localStorage.removeItem("googleEmail");

    // Redirect ke login page
    window.location.href = "index.html?logout=" + new Date().getTime();
  });


  const userEmailEl = document.querySelector('.sidebar-username');
  const avatarEl = document.querySelector('.sidebar-avatar');
  const welcomeEl = document.querySelector('.welcome'); // <- hanya ada di home


  if (token) {
    fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(user => {
        // Sidebar
        if (userEmailEl) userEmailEl.innerText = user.name || user.email;
        if (avatarEl && user.picture) {
          const proxyUrl = `https://images.weserv.nl/?url=${encodeURIComponent(user.picture)}`;
          avatarEl.innerHTML = `<img src="${proxyUrl}" alt="Avatar" />`;
        }

        // ✅ Khusus home.html → update welcome
        if (welcomeEl) {
          welcomeEl.innerText = `Hello, ${user.given_name || user.name || "User"}`;
        }
      });
  } else if (principal) {
    // Sidebar
    if (userEmailEl) userEmailEl.innerText = email || `Principal: ${principal}`;
    if (welcomeEl) {
      welcomeEl.innerText = `Hello, ${email || "Internet Identity user"}`;
    }
    avatarEl.innerHTML = `<img src="https://avatars.githubusercontent.com/u/61081342?s=200&v=4" alt="II" width="40" height="40" style="border-radius: 6px;">`;
  }
}

// ✅ Jalankan otomatis saat halaman selesai dimuat
document.addEventListener("DOMContentLoaded", initSidebarAndHeader);


// ⏳ Jalankan otomatis
loadComponents();


async function init() {
  const loggedIn = localStorage.getItem("loggedIn") === "1";
  const googleToken = localStorage.getItem("googleAccessToken");

  if (loggedIn) {
    const authClient = await AuthClient.create();
    identity = authClient.getIdentity();
    const principal = identity.getPrincipal().toText();
    console.log("✅ Logged in via Internet Identity:", principal);

    // actor = createActor("uxrrr-q7777-77774-qaaaq-cai", {
    //   agentOptions: { identity },
    // });
    actor = createActor("uxrrr-q7777-77774-qaaaq-cai"); // tanpa `agentOptions` karena tidak perlu autentikasi
  } else if (googleToken) {
    console.log("✅ Logged in via Google OAuth. Token:", googleToken);
    // Untuk user Google, kita tidak punya identity dari Internet Identity
    identity = null; // atau kamu bisa assign guest identity jika ingin
    actor = createActor("uxrrr-q7777-77774-qaaaq-cai"); // tanpa `agentOptions` karena tidak perlu autentikasi

    // Jika kamu butuh `principal` untuk tracking, bisa simpan dummy ID:
    // const dummyPrincipal = "google-user-" + googleToken.slice(0, 8);
  } else {
    alert("⚠️ Anda belum login. Silakan login terlebih dahulu.");
    window.location.href = "index.html";
  }
}


const email = localStorage.getItem("googleEmail");


function getTodayDate() {
  return new Date().toISOString().split("T")[0];
}

function readSkemaInputs() {
  const containers = document.querySelectorAll(".bunga-item");
  return Array.from(containers).map(div => ({
    tahunMulai: parseInt(div.querySelector(".start").value),
    tahunSelesai: parseInt(div.querySelector(".end").value),
    bungaTahunan: parseFloat(div.querySelector(".rate").value),
    tipe: div.querySelector(".tipe").value,
    cicilanBulanan: parseInt(div.querySelector(".cicilan").value),
  }));
}

function readPelunasanInputs() {
  const rows = document.querySelectorAll('.pelunasan-item');
  return Array.from(rows).map(div => [
    parseInt(div.querySelector('.bulan').value),
    parseInt(div.querySelector('.nominal').value)
  ]);
}

function readPenaltiInputs() {
  const rows = document.querySelectorAll('.penalti-item');
  return Array.from(rows).map(div => ({
    bulan: parseInt(div.querySelector('.bulan').value),
    persen: parseFloat(div.querySelector('.persen').value),
    jenis: div.querySelector('.jenis').value
  }));
}

function buildSkemaText(skema) {
  return skema.map(s =>
    `- Tahun ${s.tahunMulai}–${s.tahunSelesai}: ${s.bungaTahunan}% (${s.tipe}), cicilan Rp${s.cicilanBulanan}/bulan`
  ).join('\n');
}

function buildPelunasanText(list) {
  if (!list.length) return "- Tidak ada pelunasan ekstra.";
  return list.map(([bulan, nominal]) =>
    `- Bulan ${bulan}: Rp${nominal.toLocaleString("id-ID")}`
  ).join('\n');
}

function buildPenaltiText(list) {
  if (!list.length) return "- Tidak ada penalti.";
  return list.map(p =>
    `- Bulan ${p.bulan}: ${p.persen}% (${p.jenis === "early" ? "pelunasan dipercepat" : "telat bayar"})`
  ).join('\n');
}

window.addEventListener("DOMContentLoaded", async () => {
  await init();
  const form = document.querySelector("form");
  const bungaContainer = document.getElementById("bungaSkema");
  const pelunasanContainer = document.getElementById("pelunasanEkstra");
  const penaltiContainer = document.getElementById("penaltiPembayaran");
  const loginStatus = document.getElementById("loginStatus");
  const greeting = document.getElementById("greeting");
  const grafikKPR = document.getElementById("grafikKPR");
  const exportCSV = document.getElementById("exportCSV");


  // Tambah Skema Bunga
  const skemaBunga = document.getElementById("addSkema");
  if (skemaBunga) {
    skemaBunga.addEventListener("click", () => {
      const div = document.createElement("div");
      div.classList.add("bunga-item");
      div.innerHTML = `
      <label>Mulai (th)</label><input type="number" class="start" required>
      <label>Selesai (th)</label><input type="number" class="end" required>
      <label>Bunga (%)</label><input type="number" class="rate" step="0.01" required>
      <label>Tipe</label>
      <select class="tipe">
        <option value="fix">Fix</option>
        <option value="floating">Floating</option>
      </select>
      <label>Cicilan Bulanan</label><input type="number" class="cicilan" required>
      <button type="button" class="hapusSkema">Hapus</button><hr/>
    `;
      div.querySelector(".hapusSkema").addEventListener("click", () => div.remove());
      bungaContainer.appendChild(div);
    });
  }

  // Tambah Pelunasan Ekstra
  const addPelunasan = document.getElementById("addPelunasan");
  if (addPelunasan) {
    document.getElementById("addPelunasan").addEventListener("click", () => {
      const div = document.createElement("div");
      div.classList.add("pelunasan-item");
      div.innerHTML = `
      <label>Bulan ke-</label><input type="number" class="bulan" required>
      <label>Nominal (Rp)</label><input type="number" class="nominal" required>
      <button type="button" class="hapusPelunasan">Hapus</button><hr/>
    `;
      div.querySelector(".hapusPelunasan").addEventListener("click", () => div.remove());
      pelunasanContainer.appendChild(div);
    });
  }

  const addPenalti = document.getElementById("addPenalti");
  if (addPenalti) {
    // Tambah Penalti
    document.getElementById("addPenalti").addEventListener("click", () => {
      const div = document.createElement("div");
      div.classList.add("penalti-item");
      div.innerHTML = `
      <label>Bulan ke-</label><input type="number" class="bulan" required>
      <label>Persen Penalti (%)</label><input type="number" class="persen" step="0.01" required>
      <label>Jenis</label>
      <select class="jenis">
        <option value="early">Early (pelunasan dipercepat)</option>
        <option value="late">Late (terlambat bayar)</option>
      </select>
      <button type="button" class="hapusPenalti">Hapus</button><hr/>
    `;
      div.querySelector(".hapusPenalti").addEventListener("click", () => div.remove());
      penaltiContainer.appendChild(div);
    });
  }

  // Submit Form
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const googleToken = localStorage.getItem("googleAccessToken");
      if (!identity && !googleToken) {
        return alert("Harap login terlebih dahulu.");
      }


      const bungaSkema = readSkemaInputs();
      const pelunasanEkstra = readPelunasanInputs();
      const penalti = readPenaltiInputs();

      const overlap = bungaSkema.some((s1, i) =>
        bungaSkema.some((s2, j) =>
          i !== j && !(s1.tahunSelesai < s2.tahunMulai || s1.tahunMulai > s2.tahunSelesai)
        )
      );
      if (overlap) return alert("Skema bunga tumpang tindih!");

      const data = {
        hargaRumah: parseInt(harga.value),
        dp: parseInt(dp.value),
        tenorBulan: parseInt(tenor.value) * 12,
        tanggalMulai: mulai.value,
        tanggalAnalisa: getTodayDate(),
        bungaSkema,
        pelunasanEkstra,
        penalti,
        keterangan: keterangan.value,
      };

      const prompt = `
Saya membeli rumah seharga Rp${data.hargaRumah}, dengan DP sebesar Rp${data.dp} dan tenor ${data.tenorBulan / 12} tahun.
Tanggal mulai cicilan: ${data.tanggalMulai}, dan analisis dilakukan pada tanggal ${data.tanggalAnalisa}.

📈 Skema bunga dan cicilan:
${buildSkemaText(bungaSkema)}

💰 Pelunasan ekstra yang telah dilakukan:
${buildPelunasanText(pelunasanEkstra)}

⚠️ Daftar penalti pelunasan:
${buildPenaltiText(penalti)}

Catatan tambahan: ${data.keterangan}

🧠 Saya ingin Anda sebagai konsultan keuangan dan KPR memberikan saran:
1. Apakah saya sebaiknya melakukan pelunasan dipercepat dalam beberapa bulan ke depan, atau lebih baik menyimpan uang di instrumen investasi?
2. Jika pelunasan dipercepat menguntungkan, mohon sarankan **bulan ke berapa dan nominal berapa** yang paling optimal untuk dilakukan, dengan mempertimbangkan sisa pokok, penalti pelunasan (baik yang early maupun late), dan peluang return investasi tetap sebesar 8% per tahun.
3. Jelaskan secara ringkas keuntungannya dibanding jika saya tetap membayar cicilan normal tanpa pelunasan.

Tolong jawab dalam format yang jelas dan mudah dipahami oleh non-finansial sekalipun.
`.trim();


      const aiRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "deepseek/deepseek-chat-v3-0324:free",
          messages: [
            { role: "system", content: "Kamu adalah konsultan KPR dan keuangan rumah tangga..." },
            { role: "user", content: prompt }
          ]
        })
      });

      const aiData = await aiRes.json();
      const hasilAI = aiData.choices?.[0]?.message?.content || "AI tidak menjawab.";

      if (!email) {
        alert("Email tidak ditemukan. Pastikan Anda login dengan Google.");
        return;
      }

      const kprData = {
        ...data,      // data dari form
        hasilAI,      // hasil dari OpenAI
      };

      await actor.saveKPR(email, kprData);

      greeting.style.display = "block";
      greeting.innerText = hasilAI;
      const allKPR = await actor.getKPR(email);
      const index = allKPR.length - 1;
      let fullSimulasi = []; // data asli lengkap
      const simulasi = await actor.getSimulasi(email, index);
      fullSimulasi = simulasi;

      const months = simulasi.map(([b]) => `Bulan ${b}`);
      const pokok = simulasi.map(([_, p]) => Math.round(p));
      const bunga = simulasi.map(([_, __, b]) => Math.round(b));
      const penaltiVals = simulasi.map(([_, __, ___, p]) => Math.round(p));
      const ctx = grafikKPR.getContext("2d");
      if (!ctx) {
        console.error("Context canvas tidak tersedia");
        return;
      }
      renderChart(ctx, months, pokok, bunga, penaltiVals);
      // Simpan chart terakhir ke localStorage
      // const chartDataToSave = {
      //   months,
      //   pokok,
      //   bunga,
      //   penaltiVals
      // };
      // localStorage.setItem("lastChartData", JSON.stringify(chartDataToSave));
      // Cari identitas user aktif
      const principal = localStorage.getItem("principal");       // untuk Internet Identity  

      // Tentukan key unik untuk simpan chart
      let userKey = null;
      if (principal) {
        userKey = `lastChartData_${principal}`;
      } else if (email) {
        userKey = `lastChartData_${email}`;
      }

      if (userKey) {
        const chartDataToSave = { months, pokok, bunga, penaltiVals };
        localStorage.setItem(userKey, JSON.stringify(chartDataToSave));
      }



      function updateChartRange(startBulan, endBulan) {
        const filtered = fullSimulasi.filter(([bulan]) => bulan >= startBulan && bulan <= endBulan);
        const months = filtered.map(([b]) => `Bulan ${b}`);
        const pokok = filtered.map(([_, p]) => Math.round(p));
        const bunga = filtered.map(([_, __, b]) => Math.round(b));
        const penaltiVals = filtered.map(([_, __, ___, p]) => Math.round(p));

        const ctx = document.getElementById("grafikKPR").getContext("2d");
        renderChart(ctx, months, pokok, bunga, penaltiVals);
        const chartDataToSave = {
          months,
          pokok,
          bunga,
          penaltiVals,
        };
        localStorage.setItem("lastChartData", JSON.stringify(chartDataToSave));
      }
      const sliderStart = document.getElementById("sliderStart");
      const sliderEnd = document.getElementById("sliderEnd");
      const rangeDisplay = document.getElementById("rangeDisplay");

      sliderStart.max = simulasi.length;
      sliderEnd.max = simulasi.length;
      sliderEnd.value = simulasi.length;
      rangeDisplay.textContent = `${sliderStart.value} – ${sliderEnd.value}`;

      sliderStart.addEventListener("input", () => {
        const start = parseInt(sliderStart.value);
        const end = parseInt(sliderEnd.value);
        if (start <= end) {
          updateChartRange(start, end);
          rangeDisplay.textContent = `${start} – ${end}`;
        }
      });

      sliderEnd.addEventListener("input", () => {
        const start = parseInt(sliderStart.value);
        const end = parseInt(sliderEnd.value);
        if (start <= end) {
          updateChartRange(start, end);
          rangeDisplay.textContent = `${start} – ${end}`;
        }
      });

      exportCSV.style.display = "inline-block";
      exportCSV.onclick = () => {
        const rows = ["bulan,pokok,bunga,penalti"];
        simulasi.forEach(([b, p, bungaVal, penaltiVal]) =>
          rows.push(`${b},${p.toFixed(0)},${bungaVal.toFixed(0)},${penaltiVal.toFixed(0)}`)
        );
        const blob = new Blob([rows.join("\n")], { type: "text/csv" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "simulasi_kpr.csv";
        a.click();
      };
    });
  }

  const downloadICS = document.getElementById("downloadICS");
  if (downloadICS) {
    downloadICS.onclick = async () => {
      const pad = (num) => String(num).padStart(2, "0");

      const allKPR = await actor.getKPR(email);
      if (!allKPR.length) {
        alert("Belum ada data KPR.");
        return;
      }

      const latestIndex = allKPR.length - 1;
      const latestEntry = allKPR[latestIndex];

      const simulasi = await actor.getSimulasi(email, latestIndex);
      const startDate = new Date(latestEntry.tanggalMulai);

      const events = simulasi.map(([bulan, pokok, bunga, penalti]) => {
        const eventDate = new Date(startDate);
        eventDate.setMonth(eventDate.getMonth() + Number(bulan) - 1);
        const y = eventDate.getFullYear();
        const m = pad(eventDate.getMonth() + 1);
        const d = pad(eventDate.getDate());

        const dateStr = `${y}${m}${d}`;
        const total = pokok + bunga + penalti;

        return `
BEGIN:VEVENT
SUMMARY:Cicilan KPR Bulan ${bulan}
DESCRIPTION:Pokok: Rp${pokok.toLocaleString("id-ID")}\\nBunga: Rp${bunga.toLocaleString("id-ID")}\\nPenalti: Rp${penalti.toLocaleString("id-ID")}\\nTotal: Rp${total.toLocaleString("id-ID")}
DTSTART;VALUE=DATE:${dateStr}
DTEND;VALUE=DATE:${dateStr}
END:VEVENT`.trim();
      });

      const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
CALSCALE:GREGORIAN
METHOD:PUBLISH
PRODID:-//AI KPR Tracker//EN
${events.join("\n")}
END:VCALENDAR`;

      const blob = new Blob([icsContent], { type: "text/calendar" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "jadwal_kpr.ics";
      a.click();

      alert("📅 File berhasil diunduh!\nKlik dua kali untuk menambahkan ke Google Calendar atau aplikasi kalender lainnya.");
    };
  };

  const historyButton = document.getElementById("lihatHistoriBtn");
  if (historyButton) {
    // Lihat histori
    historyButton.addEventListener("click", async () => {
      const histori = await actor.getKPR(email);
      let output = "";

      histori.forEach((entry, index) => {
        const harga = entry.hargaRumah ? Number(entry.hargaRumah).toLocaleString("id-ID") : "-";
        const tenor = entry.tenorBulan ? Number(entry.tenorBulan) / 12 : "-";
        const mulai = entry.tanggalMulai || "-";
        const analisa = entry.tanggalAnalisa || "-";
        const keterangan = entry.keterangan?.trim() || "-";
        const hasilAI = entry.hasilAI || "-";

        const skema = buildSkemaText(entry.bungaSkema);
        const pelunasan = buildPelunasanText(entry.pelunasanEkstra);
        const penalti = buildPenaltiText(entry.penalti || []);

        output += `#${index + 1} - Harga: Rp${harga}\n`;
        output += `Tenor: ${tenor} tahun, Mulai: ${mulai}, Analisa: ${analisa}\n`;
        output += `Keterangan: ${keterangan}\n`;
        output += `📊 Skema Cicilan:\n${skema}\n`;
        output += `💵 Pelunasan Ekstra:\n${pelunasan}\n`;
        output += `⚠️ Penalti:\n${penalti}\n`;
        output += `🧠 Hasil AI:\n${hasilAI}\n\n`;
      });
      const historiOutput = document.getElementById("historiOutput");
      if (historiOutput) {
        document.getElementById("historiOutput").innerText = output || "Belum ada data.";
      }
    });
  }
});
