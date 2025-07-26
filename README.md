# KARINA — AI-Powered Mortgage Simulation on ICP

**ICP Hackathon Project | Web3 + Smart Mortgage Planning**

**KARINA** is a Web3-based mortgage (KPR) simulation application that leverages the power of **AI and the Internet Computer (ICP) blockchain**. With an intuitive interface and Motoko-powered backend, this app allows users to **strategically plan their mortgage**, analyze interest rates, simulate early repayments, and integrate their schedule into calendars.

---

## 🎯 Problem Statement

Many people struggle to clearly plan their home financing — especially understanding the impact of early payments, floating interest, or penalties. Conventional mortgage calculators are often static, rigid, and non-transparent.

**KARINA offers a modern solution: decentralized, intelligent, and transparent.**

---

## 🚀 Key Features

- 🧮 **Flexible Mortgage Simulation:** Input key loan data (amount, tenor, interest rate, etc.)
- 🔁 **Add Custom Interest Schemes, Early Payments & Penalties**
- 🧠 **AI-Powered Analysis:** Get insights based on your mortgage plan
- 📊 **Interactive Charts:** Visualize loan principal vs interest over time
- 🕒 **History & Calendar Integration:** Track your simulation history and set up payment reminders
- 🔐 **Motoko Backend on ICP:** Ensures transparency and trustless execution

---

## 🧱 Technology Stack

| Layer          | Technology                  |
| -------------- | --------------------------- |
| Smart Contract | Motoko (Internet Computer)  |
| Frontend       | HTML, CSS, JavaScript       |
| Dev Tools      | Vite, DFX, MOPS             |

---

## 📂 Project Structure
```
KARINA/
├── .devcontainer/               # VS Code Dev Container config
│   └── devcontainer.json
│
├── .dfx/                        # Folder build lokal DFX (abaikan dalam git)
│   └── local/
│       └── canisters/
│           └── backend/
│               ├── backend.did
│               ├── backend.most
│               ├── backend.old.most
│               ├── backend.wasm
│               ├── constructor.did
│               ├── index.js
│               ├── init_args.txt
│               ├── service.did
│               └── service.did.js
│
├── .mops/                       # Dependencies Motoko
│   └── base@0.14.9/
│       └── src/
│           ├── Array.mo
│           ├── Blob.mo
│           └── ... (file Motoko standar)
│
├── backend/                     # Kode utama backend dalam Motoko
│   └── app.mo
│
├── frontend/                    # Antarmuka pengguna
│   ├── index.html               # (kalau ada)
│   ├── analisis.html
│   ├── calendar.html
│   ├── auth.js
│   ├── chart.js
│   ├── styles.css               # (jika ada)
│   └── declarations/           # Output build DFX (auto-generated)
│       └── backend/
│           ├── backend.did
│           ├── backend.most
│           ├── service.did
│           └── service.did.js
│
├── dfx.json                     # Konfigurasi proyek Internet Computer
├── mops.toml                    # Dependency config Motoko
├── package.json                 # Config project frontend (Node.js)
├── vite.config.js               # Config bundler Vite
├── .env                         # Environment variable
├── dfx_deploy_auto.sh           # Skrip deploy otomatis
├── dfx_reset.sh                 # Skrip reset environment
├── .gitignore                   # File/folder yang diabaikan Git
├── README.md                    # Dokumentasi proyek
└── BUILD.md                     # Panduan build dan deploy

```
---

## 🛠️ Getting Started

1. **Clone the repository:**

```
git clone https://github.com/username/KARINA.git
cd KARINA
```

2. **Install and run the frontend:**
```
cd frontend
npm install
npm run dev
```

3. **Run the backend locally using DFX:**
```
dfx start --background
dfx deploy
```

---

## 🌐 Why Internet Computer?

The Internet Computer (ICP) provides **security, speed, and scalability** for Web3 applications without relying on traditional servers or third-party bridges. Our backend is written entirely in Motoko to ensure transparent and reliable mortgage logic.

---

## 🤝 Contributions

We welcome contributions to help enhance the project further — including integrating stablecoin support, decentralized identity, or financial APIs.

---

## 📄 License

MIT License

