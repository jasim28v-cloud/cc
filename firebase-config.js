// js/firebase-config.js
// إعدادات Firebase الكاملة لمشروع "قالبك"

// استيراد الوظائف المطلوبة (إذا كنتِ تستخدمين npm)
// import { initializeApp } from "firebase/app";
// import { getDatabase } from "firebase/database";

// إعدادات Firebase
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

// تهيئة Firebase (للاستخدام المباشر في المتصفح)
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

console.log("✅ Firebase Connected: gomrka-420d0");
