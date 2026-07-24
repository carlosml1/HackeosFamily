import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getAuth, browserLocalPersistence, setPersistence, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";
import {
    getDatabase,
    ref,
    set,
    get,
    update,
    onValue
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

console.log("AUTH-GUARD INICIADO");

const firebaseConfig = {
    apiKey: "AIzaSyD6tu5Yfjrt_GeCugcYAha5bmUU5yfkByk",
    authDomain: "pruebasfirepad.firebaseapp.com",
    databaseURL: "https://pruebasfirepad-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "pruebasfirepad",
    storageBucket: "pruebasfirepad.firebasestorage.app",
    messagingSenderId: "4463672678",
    appId: "1:4463672678:web:1e007a953292f3add95ca7",
    measurementId: "G-4DDBYYNSSV"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const realtimeDB = getDatabase(app);

await setPersistence(auth, browserLocalPersistence);

window.realtimeDB = realtimeDB;
window.roomRef = ref;
window.roomSet = set;
window.roomGet = get;
window.roomUpdate = update;
window.roomOnValue = onValue;

console.log("AUTH-GUARD TERMINADO", {
    realtimeDB: window.realtimeDB,
    roomRef: window.roomRef,
    roomSet: window.roomSet
});

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

export {
    realtimeDB,
    ref as roomRef,
    set as roomSet,
    get as roomGet,
    update as roomUpdate,
    onValue as roomOnValue
};