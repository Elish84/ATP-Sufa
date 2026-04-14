// firebase-config.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

export const firebaseConfig = {
  apiKey: "AIzaSyBtf_w7snO_7hyJhv_Z_eFbgzh43FmR2SU",
  authDomain: "sufa-73c50.firebaseapp.com",
  projectId: "sufa-73c50",
  storageBucket: "sufa-73c50.firebasestorage.app",
  messagingSenderId: "627835144004",
  appId: "1:627835144004:web:6ea1c1370f4ca37b5d7911",
  measurementId: "G-NLYG09HGLQ"
};

// Ensure app, auth, and firestore are explicitly started *once*.
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };
