// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyAML1yicU7JuwWQu18HZJlaldYrrUKkRO4",
  authDomain: "webzalo.firebaseapp.com",
  databaseURL: "https://webzalo-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "webzalo",
  storageBucket: "webzalo.firebasestorage.app",
  messagingSenderId: "170726745891",
  appId: "1:170726745891:web:b5b2239ad0b83d4f630e96",
  measurementId: "G-G9CTCQEKR5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);