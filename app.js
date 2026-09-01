import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";

import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";


/* ==========================================
   FIREBASE CONFIG
   PASTE YOUR FIREBASE CONFIG HERE
========================================== */

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.firebasestorage.app",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};


/* ==========================================
   FIREBASE INITIALIZATION
========================================== */

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();


/* ==========================================
   ELEMENTS
========================================== */

const loginScreen = document.getElementById("loginScreen");
const appScreen = document.getElementById("appScreen");
const googleLogin = document.getElementById("googleLogin");
const logout = document.getElementById("logout");

const userPhoto = document.getElementById("userPhoto");
const welcomeText = document.getElementById("welcomeText");


/* ==========================================
   GOOGLE LOGIN
========================================== */

googleLogin.addEventListener("click", async () => {

  try {

    googleLogin.disabled = true;
    googleLogin.innerText = "Connecting...";

    await signInWithPopup(auth, provider);

  } catch (error) {

    console.error(error);

    alert("Google login failed. Please try again.");

    googleLogin.disabled = false;
    googleLogin.innerText = "Continue with Google";
  }

});


/* ==========================================
   AUTH STATE
========================================== */

onAuthStateChanged(auth, (user) => {

  if (user) {

    loginScreen.classList.add("hidden");
    appScreen.classList.remove("hidden");

    const name = user.displayName || "there";

    welcomeText.textContent = `Hello, ${name.split(" ")[0]} 👋`;

    if (user.photoURL) {
      userPhoto.src = user.photoURL;
    }

  } else {

    loginScreen.classList.remove("hidden");
    appScreen.classList.add("hidden");

  }

});


/* ==========================================
   LOGOUT
========================================== */

logout.addEventListener("click", async () => {

  await signOut(auth);

});
