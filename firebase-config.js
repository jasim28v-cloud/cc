// js/firebase-config.js
const firebaseConfig = {
  apiKey: "AIzaSyCT0GTVZSv3d48qP3_2auOtibkjD00cUMA",
  authDomain: "gomrka-420d0.firebaseapp.com",
  databaseURL: "https://gomrka-420d0-default-rtdb.firebaseio.com",
  projectId: "gomrka-420d0",
  storageBucket: "gomrka-420d0.firebasestorage.app",
  messagingSenderId: "581820766419",
  appId: "1:581820766419:web:b8f05224532782be5a5c26"
};

firebase.initializeApp(firebaseConfig);
const database = firebase.database();
const storage = firebase.storage();
