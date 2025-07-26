import { AuthClient } from "@dfinity/auth-client";
import { createActor } from "./declarations/backend";

let actor;

const initActor = async (identity) => {
  actor = createActor("uxrrr-q7777-77774-qaaaq-cai", {
    agentOptions: { identity },
  });
  return actor;
};

// UI Elements
const authForm = document.getElementById("auth-form");
const toggleLink = document.getElementById("toggle-auth");
const formTitle = document.getElementById("form-title");
const submitBtn = document.getElementById("submit-btn");
const iiBtn = document.getElementById("ii-signin");
const googleBtn = document.getElementById("google-signin");

let isRegistering = false;
if (toggleLink){
  // Toggle login/register UI
  toggleLink.onclick = (e) => {
    e.preventDefault();
    isRegistering = !isRegistering;
    formTitle.innerText = isRegistering ? "Register" : "Sign In";
    submitBtn.innerText = isRegistering ? "Register" : "Sign In";
    toggleLink.innerHTML = isRegistering
      ? `Already have an account? <a href="#">Sign In</a>`
      : `Don’t have an account? <a href="#">Register</a>`;
  };
}
if(authForm){
  authForm.onsubmit = async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    const auth = await AuthClient.create();
    await auth.login({
      identityProvider: "https://identity.ic0.app/#authorize",
      onSuccess: async () => {
        const identity = auth.getIdentity();
        const principal = identity.getPrincipal().toText();
        await initActor(identity);

        // Cek duplikat email untuk register
        if (isRegistering) {
          const storedEmails = JSON.parse(localStorage.getItem("registeredEmails") || "[]");
          if (storedEmails.includes(email)) {
            alert("❌ Email sudah terdaftar. Gunakan email lain.");
            return;
          }
          storedEmails.push(email);
          localStorage.setItem("registeredEmails", JSON.stringify(storedEmails));
          alert("✅ Registration successful (dummy). Please sign in.");
          isRegistering = false;
          formTitle.innerText = "Sign In";
          submitBtn.innerText = "Sign In";
          toggleLink.innerHTML = `Don’t have an account? <a href="#">Register</a>`;
          return;
        }

        // Simpan data login
        localStorage.setItem("googleEmail", email);
        localStorage.setItem("principal", principal);
        localStorage.setItem("loggedIn", "1");
        window.location.href = "home.html";
      },
      onError: (err) => {
        console.error("❌ Login error:", err);
        alert("Internet Identity login failed.");
      },
    });
  };
}

// Internet Identity button (langsung login tanpa form)
iiBtn.onclick = async () => {
  const auth = await AuthClient.create();
  await auth.login({
    identityProvider: "https://identity.ic0.app/#authorize",
    onSuccess: async () => {
      const identity = auth.getIdentity();
      const principal = identity.getPrincipal().toText();
      await initActor(identity);

      // Buat email virtual berdasarkan principal
      const emailFromPrincipal = `${principal}@ii.local`;

      // Cek apakah principal/email sudah pernah login
      const registeredEmails = JSON.parse(localStorage.getItem("registeredEmails") || "[]");
      if (!registeredEmails.includes(emailFromPrincipal)) {
        registeredEmails.push(emailFromPrincipal);
        localStorage.setItem("registeredEmails", JSON.stringify(registeredEmails));
      }

      // Simpan ke localStorage
      localStorage.setItem("googleEmail", emailFromPrincipal);
      localStorage.setItem("principal", principal);
      localStorage.setItem("loggedIn", "1");
      window.location.href = "home.html";
    },
    onError: (err) => {
      console.error("❌ II login failed:", err);
      alert("Internet Identity login failed.");
    },
  });
};



// Google OAuth Button (tanpa Firebase)
googleBtn.onclick = async () => {
  const clientId = "842453536709-fuj3n9pupg4dgjj6qeg6u04tslbjjsgv.apps.googleusercontent.com";
  const redirectUri = "http://localhost:5173/oauth-callback.html"; // Ganti sesuai hosting
  const scope = "profile email";
  const responseType = "token";

  const oauthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&response_type=${responseType}&scope=${encodeURIComponent(scope)}&prompt=select_account`;

  window.location.href = oauthUrl;
};

