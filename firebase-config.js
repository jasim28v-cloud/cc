// js/firebase-config.js
// إعدادات Firebase الكاملة لمشروع "قالبك"
// تأكدي من أن قواعد الأمان في Realtime Database تسمح بالقراءة العامة (".read": true)

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

// تهيئة Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();
const storage = firebase.storage();

console.log("✅ Firebase Connected: gomrka-420d0");
