import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAW-BrsQmoMPCrSTeie4KkPPZN9aOdF458",
  authDomain: "aquarc-bd068.firebaseapp.com",
  projectId: "aquarc-bd068",
  storageBucket: "aquarc-bd068.appspot.com",
  messagingSenderId: "164336926401",
  appId: "1:164336926401:web:515030428dbf8129469e40",
  measurementId: "G-75PZQ5EBGD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { app, auth, googleProvider };
