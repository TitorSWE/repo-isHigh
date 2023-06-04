// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getStorage,ref,uploadBytes } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCNrv5YPYt5YL0bUBuFQ3onArFlRup6Kww",
  authDomain: "isboozed.firebaseapp.com",
  projectId: "isboozed",
  storageBucket: "isboozed.appspot.com",
  messagingSenderId: "1091091648629",
  appId: "1:1091091648629:web:e9a568de3706a6c6af283c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);