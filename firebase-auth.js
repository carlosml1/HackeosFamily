/* =========================================================
   IMPORTS
========================================================= */

import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";

import {
    getAuth,
    browserLocalPersistence,
    setPersistence,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    updateProfile
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
    getFirestore,
    doc,
    setDoc,
    getDoc,
    serverTimestamp,
    updateDoc,
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


/* =========================================================
   CONFIGURACIÓN FIREBASE
========================================================= */

const firebaseConfig = {

    apiKey:
        "AIzaSyD6tu5Yfjrt_GeCugcYAha5bmUU5yfkByk",

    authDomain:
        "pruebasfirepad.firebaseapp.com",

    projectId:
        "pruebasfirepad",

    storageBucket:
        "pruebasfirepad.firebasestorage.app",

    messagingSenderId:
        "4463672678",

    appId:
        "1:4463672678:web:1e007a953292f3add95ca7",

    measurementId:
        "G-4DDBYYNSSV"

};


/* =========================================================
   INICIAR FIREBASE
========================================================= */

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getFirestore(app);


console.log(
    "FIREBASE AUTH + FIRESTORE CARGADOS"
);


/* =========================================================
   ELEMENTOS HTML
========================================================= */

const authScreen =
    document.getElementById("authScreen");

const authTitle =
    document.getElementById("authTitle");

const authSubtitle =
    document.getElementById("authSubtitle");

const authUsername =
    document.getElementById("authUsername");

const authPassword =
    document.getElementById("authPassword");

const authPasswordRepeat =
    document.getElementById("authPasswordRepeat");

const repeatPasswordField =
    document.getElementById("repeatPasswordField");

const authMessage =
    document.getElementById("authMessage");

const authSubmit =
    document.getElementById("authSubmit");

const authChangeMode =
    document.getElementById("authChangeMode");

const logoutButton =
    document.getElementById("logoutButton");

const consoleButton =
    document.getElementById("consoleButton");

const mainApp =
    document.getElementById("mainApp");

const whitelistScreen =
    document.getElementById("whitelistScreen");

const whitelistUsername =
    document.getElementById("whitelistUsername");

const whitelistLogout =
    document.getElementById("whitelistLogout");


/* =========================================================
   COMPROBAR ELEMENTOS
========================================================= */

const elementosObligatorios = {

    authScreen,
    authTitle,
    authSubtitle,
    authUsername,
    authPassword,
    authPasswordRepeat,
    repeatPasswordField,
    authMessage,
    authSubmit,
    authChangeMode,
    mainApp,
    whitelistScreen,
    whitelistUsername,
    whitelistLogout

};


for (
    const [nombre, elemento]
    of Object.entries(elementosObligatorios)
) {

    if (!elemento) {

        throw new Error(
            `FALTA ELEMENTO HTML: ${nombre}`
        );

    }

}


console.log(
    "ELEMENTOS HTML CORRECTOS"
);


/* =========================================================
   VARIABLES
========================================================= */

let registerMode = false;

let procesando = false;

/*
    Esta variable evita que onAuthStateChanged
    intente leer Firestore mientras todavía
    estamos creando el documento.
*/

let creandoUsuario = false;


/* =========================================================
   PERSISTENCIA
========================================================= */

setPersistence(
    auth,
    browserLocalPersistence
)
    .then(() => {

        console.log(
            "PERSISTENCIA ACTIVADA"
        );

    })
    .catch(error => {

        console.error(
            "ERROR PERSISTENCIA:",
            error
        );

    });


/* =========================================================
   NORMALIZAR USUARIO
========================================================= */

function normalizarUsuario(nombre) {

    return nombre
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "")
        .replace(/[^a-z0-9_-]/g, "");

}


/* =========================================================
   CREAR EMAIL INTERNO
========================================================= */

function usuarioAEmail(nombre) {

    const usuario =
        normalizarUsuario(nombre);

    return `${usuario}@lafauna.local`;

}


/* =========================================================
   MOSTRAR MENSAJE
========================================================= */

function mostrarMensaje(
    texto,
    correcto = false
) {

    authMessage.textContent =
        texto;

    authMessage.style.color =
        correcto
            ? "#68ff91"
            : "#ff5e79";

}


/* =========================================================
   LIMPIAR MENSAJE
========================================================= */

function limpiarMensaje() {

    authMessage.textContent = "";

}


/* =========================================================
   BLOQUEAR BOTONES
========================================================= */

function bloquearBotones(valor) {

    procesando = valor;

    authSubmit.disabled =
        valor;

    authChangeMode.disabled =
        valor;

}


/* =========================================================
   OCULTAR TODAS LAS PANTALLAS
========================================================= */

function ocultarPantallas() {

    authScreen
        .classList
        .add("hidden");

    whitelistScreen
        .classList
        .add("hidden");

    mainApp
        .classList
        .add("hidden");


    if (logoutButton) {

        logoutButton
            .classList
            .add("hidden");

    }

}


/* =========================================================
   MOSTRAR LOGIN
========================================================= */

function mostrarLogin() {

    ocultarPantallas();

    authScreen
        .classList
        .remove("hidden");

}


/* =========================================================
   MOSTRAR WHITELIST
========================================================= */

function mostrarWhitelist(nombre) {

    ocultarPantallas();

    whitelistScreen
        .classList
        .remove("hidden");

    whitelistUsername.textContent =
        `USER: ${nombre || "UNKNOWN"} // WL PENDING`;

}

/* =========================================================
   COMPROVACION DE USUARIOS VIPS
========================================================= */

async function comprobarVip(nombreUsuario) {

    try {

        const vipRef = doc(db, "vips", "usuariosVips");
        const vipSnap = await getDoc(vipRef);

        const sumaNumeroCard =
            document.querySelector('a[href="sumaNumero.html"]');

        if (!sumaNumeroCard) return;

        if (!vipSnap.exists()) {
            sumaNumeroCard.style.display = "none";
            return;
        }

        const usuario = nombreUsuario.trim().toLowerCase();

        const lista = (vipSnap.data().lista || [])
            .map(nombre => String(nombre).trim().toLowerCase());

        if (lista.includes(usuario)) {
            sumaNumeroCard.style.display = "";
        } else {
            sumaNumeroCard.style.display = "none";
        }

    } catch (error) {

        console.error("ERROR VIP:", error);

        const thermiteCard =
            document.querySelector('a[href="thermite.html"]');

        if (thermiteCard) {
            thermiteCard.style.display = "none";
        }

    }

}


/* =========================================================
   MOSTRAR WEB
========================================================= */

async function mostrarWeb(nombreUsuario) {

    ocultarPantallas();

    mainApp.classList.remove("hidden");

    if (logoutButton) {
        logoutButton.classList.remove("hidden");
    }

    await comprobarVip(nombreUsuario);

}


/* =========================================================
   ACTUALIZAR LOGIN / REGISTRO
========================================================= */

function actualizarModo() {

    limpiarMensaje();

    authPassword.value = "";

    authPasswordRepeat.value = "";


    /* =====================================================
       REGISTRO
    ====================================================== */

    if (registerMode) {

        authTitle.textContent =
            "NEW IDENTITY";

        authSubtitle.textContent =
            "CREA UNA NUEVA IDENTIDAD";

        authSubmit.textContent =
            "CREATE USER";

        authChangeMode.textContent =
            "BACK TO LOGIN";

        repeatPasswordField
            .classList
            .remove("hidden");

        authPassword.autocomplete =
            "new-password";

        authPasswordRepeat.autocomplete =
            "new-password";

    }


    /* =====================================================
       LOGIN
    ====================================================== */

    else {

        authTitle.textContent =
            "IDENTIFICACION";

        authSubtitle.textContent =
            "INTRODUCE TUS CREDENCIALES";

        authSubmit.textContent =
            "LOGIN";

        authChangeMode.textContent =
            "REGISTER";

        repeatPasswordField
            .classList
            .add("hidden");

        authPassword.autocomplete =
            "current-password";

    }

}


/* =========================================================
   ERRORES FIREBASE
========================================================= */

function obtenerErrorFirebase(error) {

    console.error(
        "ERROR FIREBASE:",
        error
    );


    switch (error.code) {

        case "auth/email-already-in-use":

            return "ERROR // USER ALREADY EXISTS";


        case "auth/weak-password":

            return "ERROR // PASSWORD TOO WEAK";


        case "auth/invalid-credential":

            return "ERROR // ACCESS DENIED";


        case "auth/user-not-found":

            return "ERROR // USER NOT FOUND";


        case "auth/wrong-password":

            return "ERROR // ACCESS DENIED";


        case "auth/too-many-requests":

            return "ERROR // TOO MANY ATTEMPTS";


        case "auth/network-request-failed":

            return "ERROR // NETWORK FAILURE";


        case "auth/operation-not-allowed":

            return "ERROR // ENABLE EMAIL PASSWORD";


        case "auth/invalid-email":

            return "ERROR // INVALID USER";


        case "permission-denied":

            return "ERROR // FIRESTORE PERMISSION DENIED";


        default:

            return (
                "ERROR // " +
                (
                    error.code ||
                    error.message ||
                    "UNKNOWN ERROR"
                )
            );

    }

}


/* =========================================================
   VALIDAR USUARIO
========================================================= */

function validarUsuario(nombre) {

    const usuario =
        normalizarUsuario(nombre);


    if (usuario.length < 3) {

        mostrarMensaje(
            "ERROR // USER MINIMUM 3 CHARACTERS"
        );

        return false;

    }


    if (usuario.length > 25) {

        mostrarMensaje(
            "ERROR // USER TOO LONG"
        );

        return false;

    }


    return true;

}


/* =========================================================
   CREAR PERFIL FIRESTORE
========================================================= */

async function crearPerfilFirestore(
    user,
    nombre
) {

    console.log(
        "=================================="
    );

    console.log(
        "INICIANDO CREACIÓN FIRESTORE"
    );

    console.log(
        "UID:",
        user.uid
    );

    console.log(
        "NOMBRE:",
        nombre
    );

    console.log(
        "AUTH ACTUAL:",
        auth.currentUser?.uid
    );


    const referencia =
        doc(
            db,
            "usuarios",
            user.uid
        );


    try {

        await setDoc(
            referencia,
            {
                nombre:
                    nombre,

                admin:
                    false,

                consola: false,

                fechaRegistro:
                    serverTimestamp()
            }
        );


        console.log(
            "FIRESTORE CREADO CORRECTAMENTE"
        );

        console.log(
            "RUTA: usuarios/" +
            user.uid
        );

        console.log(
            "=================================="
        );


        return true;

    }

    catch (error) {

        console.error(
            "=================================="
        );

        console.error(
            "ERROR CREANDO FIRESTORE"
        );

        console.error(
            "CODE:",
            error.code
        );

        console.error(
            "MESSAGE:",
            error.message
        );

        console.error(
            "ERROR COMPLETO:",
            error
        );

        console.error(
            "=================================="
        );


        throw error;

    }

}


/* =========================================================
   REGISTRAR USUARIO
========================================================= */

async function registrar() {

    console.log(
        "FUNCIÓN REGISTRAR"
    );


    if (procesando) {

        return;

    }


    const nombre =
        authUsername
            .value
            .trim();

    const password =
        authPassword.value;

    const passwordRepeat =
        authPasswordRepeat.value;


    /* =====================================================
       VALIDACIONES
    ====================================================== */

    if (
        !nombre ||
        !password ||
        !passwordRepeat
    ) {

        mostrarMensaje(
            "ERROR // COMPLETE ALL FIELDS"
        );

        return;

    }


    if (!validarUsuario(nombre)) {

        return;

    }


    if (password.length < 6) {

        mostrarMensaje(
            "ERROR // PASSWORD MINIMUM 6 CHARACTERS"
        );

        return;

    }


    if (
        password !==
        passwordRepeat
    ) {

        mostrarMensaje(
            "ERROR // PASSWORDS DO NOT MATCH"
        );

        return;

    }


    const email =
        usuarioAEmail(nombre);


    try {

        /* =================================================
           MARCAR REGISTRO EN PROCESO
        ================================================= */

        creandoUsuario = true;


        bloquearBotones(true);


        mostrarMensaje(
            "SYSTEM // CREATING IDENTITY",
            true
        );


        /* =================================================
           CREAR USUARIO AUTH
        ================================================= */

        console.log(
            "CREANDO USUARIO AUTH..."
        );


        const credencial =
            await createUserWithEmailAndPassword(
                auth,
                email,
                password
            );


        console.log(
            "AUTH CREADO:"
        );

        console.log(
            credencial.user.uid
        );


        /* =================================================
           GUARDAR DISPLAY NAME
        ================================================= */

        await updateProfile(
            credencial.user,
            {
                displayName:
                    nombre
            }
        );


        console.log(
            "DISPLAY NAME GUARDADO"
        );


        /* =================================================
           CREAR DOCUMENTO FIRESTORE
        ================================================= */

        await crearPerfilFirestore(
            credencial.user,
            nombre
        );


        /* =================================================
           TERMINAR REGISTRO
        ================================================= */

        creandoUsuario = false;


        console.log(
            "REGISTRO COMPLETADO"
        );


        /* =================================================
           COMPROBAR WHITELIST
        ================================================= */

        await comprobarWhitelist(
            credencial.user
        );

    }

    catch (error) {

        creandoUsuario = false;


        console.error(
            "ERROR REGISTRO:",
            error
        );


        mostrarMensaje(
            obtenerErrorFirebase(error)
        );


        /*
            IMPORTANTE:

            Si Authentication creó la cuenta
            pero Firestore falló, la cuenta
            seguirá existiendo en Authentication.

            En ese caso hay que revisar el error
            de Firestore en la consola.
        */

    }

    finally {

        bloquearBotones(false);

    }

}


/* =========================================================
   LOGIN
========================================================= */

async function login() {

    console.log(
        "FUNCIÓN LOGIN"
    );


    if (procesando) {

        return;

    }


    const nombre =
        authUsername
            .value
            .trim();

    const password =
        authPassword.value;


    if (
        !nombre ||
        !password
    ) {

        mostrarMensaje(
            "ERROR // COMPLETE ALL FIELDS"
        );

        return;

    }


    if (!validarUsuario(nombre)) {

        return;

    }


    const email =
        usuarioAEmail(nombre);


    try {

        bloquearBotones(true);


        mostrarMensaje(
            "SYSTEM // VERIFYING",
            true
        );


        await signInWithEmailAndPassword(
            auth,
            email,
            password
        );


        console.log(
            "LOGIN CORRECTO"
        );

    }

    catch (error) {

        mostrarMensaje(
            obtenerErrorFirebase(error)
        );

    }

    finally {

        bloquearBotones(false);

    }

}


/* =========================================================
   COMPROBAR WHITELIST
========================================================= */

async function comprobarWhitelist(user) {

    console.log(
        "COMPROBANDO WHITELIST"
    );

    console.log(
        "UID:",
        user.uid
    );


    ocultarPantallas();


    try {

        const referencia =
            doc(
                db,
                "usuarios",
                user.uid
            );


        console.log(
            "LEYENDO FIRESTORE..."
        );


        const resultado =
            await getDoc(
                referencia
            );


        /* =================================================
           PERFIL NO EXISTE
        ================================================= */

        if (!resultado.exists()) {

            console.error(
                "PERFIL FIRESTORE NO EXISTE"
            );


            whitelistScreen
                .classList
                .remove("hidden");


            whitelistUsername.textContent =
                "PROFILE NOT FOUND // CONTACT ADMIN";


            return;

        }


        /* =================================================
           OBTENER DATOS
        ================================================= */

        const datos =
            resultado.data();


        console.log(
            "DATOS FIRESTORE:",
            datos
        );


        /* =================================================
           ADMIN TRUE
        ================================================= */

        if (
            datos.admin === true
        ) {

            console.log(
                "ADMIN TRUE"
            );

            console.log(
                "ACCESS GRANTED"
            );

            if (consoleButton) {

                if (datos.consola === true) {

                    consoleButton.classList.remove("hidden");

                } else {

                    consoleButton.classList.add("hidden");

                }

            }

            await mostrarWeb(
                datos.nombre ||
                user.displayName ||
                "UNKNOWN"
            );


            return;

        }


        /* =================================================
           ADMIN FALSE
        ================================================= */

        console.log(
            "ADMIN FALSE"
        );

        console.log(
            "WL PENDING"
        );


        mostrarWhitelist(

            datos.nombre ||

            user.displayName ||

            "UNKNOWN"

        );

    }

    catch (error) {

        console.error(
            "ERROR COMPROBANDO FIRESTORE:",
            error
        );


        ocultarPantallas();


        whitelistScreen
            .classList
            .remove("hidden");


        whitelistUsername.textContent =
            "DATABASE ERROR // ACCESS DENIED";

    }

}


/* =========================================================
   CERRAR SESIÓN
========================================================= */

async function cerrarSesion() {

    console.log(
        "CERRANDO SESIÓN"
    );


    try {

        ocultarPantallas();


        await signOut(auth);


        console.log(
            "SESIÓN CERRADA"
        );

    }

    catch (error) {

        console.error(
            "ERROR CERRANDO SESIÓN:",
            error
        );

    }

}


/* =========================================================
   BOTÓN LOGIN / CREATE USER
========================================================= */

authSubmit.addEventListener(
    "click",
    event => {

        event.preventDefault();


        if (procesando) {

            return;

        }


        if (registerMode) {

            registrar();

        }

        else {

            login();

        }

    }
);


/* =========================================================
   BOTÓN REGISTER
========================================================= */

authChangeMode.addEventListener(
    "click",
    event => {

        event.preventDefault();


        if (procesando) {

            return;

        }


        registerMode =
            !registerMode;


        actualizarModo();

    }
);


/* =========================================================
   ENTER
========================================================= */

authScreen.addEventListener(
    "keydown",
    event => {

        if (
            event.key !== "Enter"
        ) {

            return;

        }


        event.preventDefault();


        if (procesando) {

            return;

        }


        if (registerMode) {

            registrar();

        }

        else {

            login();

        }

    }
);


/* =========================================================
   LOGOUT WEB
========================================================= */

if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        event => {

            event.preventDefault();


            cerrarSesion();

        }
    );

}


/* =========================================================
   LOGOUT WHITELIST
========================================================= */

whitelistLogout.addEventListener(
    "click",
    event => {

        event.preventDefault();


        cerrarSesion();

    }
);


/* =========================================================
   CONTROL DE SESIÓN
========================================================= */

onAuthStateChanged(
    auth,
    async user => {


        console.log(
            "=================================="
        );

        console.log(
            "CAMBIO ESTADO AUTH"
        );

        console.log(
            "USER:",
            user?.uid
        );

        console.log(
            "CREANDO USUARIO:",
            creandoUsuario
        );

        console.log(
            "=================================="
        );


        ocultarPantallas();


        /* =================================================
           USUARIO CONECTADO
        ================================================= */

        if (user) {


            window.usuarioFirebase =
                user;


            /*
                Si estamos en mitad del registro,
                NO intentamos leer Firestore.

                registrar() se encargará de hacerlo
                después de crear el documento.
            */

            if (creandoUsuario) {

                console.log(
                    "REGISTRO EN PROCESO"
                );

                console.log(
                    "ESPERANDO CREACIÓN FIRESTORE"
                );


                return;

            }


            await comprobarWhitelist(
                user
            );

        }


        /* =================================================
           SIN SESIÓN
        ================================================= */

        else {


            window.usuarioFirebase =
                null;


            registerMode =
                false;


            actualizarModo();


            mostrarLogin();

        }

    }
);


/* =========================================================
   INICIAR INTERFAZ
========================================================= */

actualizarModo();


console.log(
    "FIREBASE AUTH INICIADO CORRECTAMENTE"
);

/* =========================================================
   CONTROLAR CONSOLA
========================================================= */

if (consoleButton) {

    consoleButton
        .classList
        .add("hidden");

}

if (consoleButton) {

    consoleButton.addEventListener(
        "click",
        () => {

            window.location.href = "consola.html";

        }
    );

}

