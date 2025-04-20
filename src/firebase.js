import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyAxcyh9aFO2-r2PRD2JdWdkU5Uo7_a9JPg",
    authDomain: "segunda-nobre-78aa4.firebaseapp.com",
    projectId: "segunda-nobre-78aa4",
    storageBucket: "segunda-nobre-78aa4.firebasestorage.app",
    messagingSenderId: "825729109215",
    appId: "1:825729109215:web:77b5f000831a7675c2ed6a"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
