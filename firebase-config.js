// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyCT0GTVZSv3d48qP3_2auOtibkjD00cUMA",
  authDomain: "gomrka-420d0.firebaseapp.com",
  databaseURL: "https://gomrka-420d0-default-rtdb.firebaseio.com",
  projectId: "gomrka-420d0",
  storageBucket: "gomrka-420d0.firebasestorage.app",
  messagingSenderId: "581820766419",
  appId: "1:581820766419:web:b8f05224532782be5a5c26",
  measurementId: "G-61DFP9M8BQ"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

const CLOUDINARY_CLOUD_NAME = 'dmdrxi9xl';
const CLOUDINARY_UPLOAD_PRESET = 'go_45xx';

export { auth, database, CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET };
