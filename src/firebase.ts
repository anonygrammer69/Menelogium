import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyDDIEKYcS--LPL4lJViI4aSh1M5EBfy_b0",
    authDomain: "menelogium.firebaseapp.com",
    projectId: "menelogium",
    storageBucket: "menelogium.appspot.com",
    messagingSenderId: "1003792853268",
    appId: "1:1003792853268:web:fbde967b7dbc7009377a01",
    measurementId: "G-MX9YWE0NSL"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);