import { initializeApp } from "firebase/app";
import {getAuth , GoogleAuthProvider } from 'firebase/auth'
import { createUserWithEmailAndPassword , sendEmailVerification } from "firebase/auth";




const firebaseConfig = {

  apiKey: import.meta.env.VITE_FIREBASE_APIKEY,
  authDomain: "echo-chat-84010.firebaseapp.com",
  projectId: "echo-chat-84010",
  storageBucket: "echo-chat-84010.firebasestorage.app",
  messagingSenderId: "70279679979",
  appId: "1:70279679979:web:d2898c1fea9209e51993ae"

};



const app=initializeApp(firebaseConfig);
const auth=getAuth(app);
const provider = new GoogleAuthProvider();

export {auth , provider};
