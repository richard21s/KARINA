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
│
├── backend/            # Contains mortgage simulation logic in Motoko
│   └── app.mo
│
├── frontend/           # Contains user interface (HTML, JS, CSS)
│   ├── index.html
│   ├── main.js
│   └── styles.css
│
├── dfx.json            # Internet Computer configuration
├── mops.toml           # Motoko dependency management
└── README.md           # Project documentation
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

