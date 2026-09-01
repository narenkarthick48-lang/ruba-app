import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import {
  getFirestore
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";
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

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBv30wRnc9CJAo0mFQF_7nAXuytZyurfkk",
  authDomain: "ruba-34782.firebaseapp.com",
  projectId: "ruba-34782",
  storageBucket: "ruba-34782.firebasestorage.app",
  messagingSenderId: "916875849283",
  appId: "1:916875849283:web:79bd7170ade790527eeef6",
  measurementId: "G-YY47Z8PCXQ"
};


/* ==========================================
   FIREBASE INITIALIZATION
========================================== */

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
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
