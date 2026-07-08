import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getAuth, browserLocalPersistence, setPersistence, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyD6tu5Yfjrt_GeCugcYAha5bmUU5yfkByk",
    authDomain: "pruebasfirepad.firebaseapp.com",
    projectId: "pruebasfirepad",
    storageBucket: "pruebasfirepad.firebasestorage.app",
    messagingSenderId: "4463672678",
    appId: "1:4463672678:web:1e007a953292f3add95ca7",
    measurementId: "G-4DDBYYNSSV"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

await setPersistence(auth, browserLocalPersistence);

onAuthStateChanged(auth, async user => {
    if (!user) {
        window.location.href = "./index.html";
        return;
    }

    const userDoc = await getDoc(doc(db, "usuarios", user.uid));

    if (!userDoc.exists() || userDoc.data().admin !== true) {
        window.location.href = "./index.html";
        return;
    }

    document.body.classList.remove("auth-loading");
});