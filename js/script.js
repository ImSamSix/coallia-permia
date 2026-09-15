/* ==========================================================================
   🚀 PROJET : PERMIA - Gestion de la Permance
   👨‍💻 AUTEUR : Sami Charles Hassen Harigua
   📅 DATE DE CRÉATION : 2026
   ⚖️ PROPRIÉTÉ INTELLECTUELLE :
   Ce code est la propriété exclusive de son créateur. 
   Toute copie, modification, distribution ou revente sans autorisation 
   explicite est strictement interdite.
   ========================================================================== */

// ==========================================
// 1. CHARGEMENT DE LA MÉMOIRE (COFFRE-FORT CRYPTÉ)
// ==========================================

const MODE_MAINTENANCE = false;

// Variables par défaut
let inventory = [
    // 10 Marmites XL (IDs 1 à 10)
    { id: 1, category: "marmitexl", name: "Marmite XL n°1", status: "available", jeune: "", pro: "", time: null },
    { id: 2, category: "marmitexl", name: "Marmite XL n°2", status: "available", jeune: "", pro: "", time: null },
    { id: 3, category: "marmitexl", name: "Marmite XL n°3", status: "available", jeune: "", pro: "", time: null },
    { id: 4, category: "marmitexl", name: "Marmite XL n°4", status: "available", jeune: "", pro: "", time: null },
    { id: 5, category: "marmitexl", name: "Marmite XL n°5", status: "available", jeune: "", pro: "", time: null },
    { id: 6, category: "marmitexl", name: "Marmite XL n°6", status: "available", jeune: "", pro: "", time: null },
    { id: 7, category: "marmitexl", name: "Marmite XL n°7", status: "available", jeune: "", pro: "", time: null },
    { id: 8, category: "marmitexl", name: "Marmite XL n°8", status: "available", jeune: "", pro: "", time: null },
    { id: 9, category: "marmitexl", name: "Marmite XL n°9", status: "available", jeune: "", pro: "", time: null },
    { id: 10, category: "marmitexl", name: "Marmite XL n°10", status: "available", jeune: "", pro: "", time: null },

    // 10 Marmites Classiques (IDs 11 à 20)
    { id: 11, category: "marmite", name: "Marmite n°1", status: "available", jeune: "", pro: "", time: null },
    { id: 12, category: "marmite", name: "Marmite n°2", status: "available", jeune: "", pro: "", time: null },
    { id: 13, category: "marmite", name: "Marmite n°3", status: "available", jeune: "", pro: "", time: null },
    { id: 14, category: "marmite", name: "Marmite n°4", status: "available", jeune: "", pro: "", time: null },
    { id: 15, category: "marmite", name: "Marmite n°5", status: "available", jeune: "", pro: "", time: null },
    { id: 16, category: "marmite", name: "Marmite n°6", status: "available", jeune: "", pro: "", time: null },
    { id: 17, category: "marmite", name: "Marmite n°7", status: "available", jeune: "", pro: "", time: null },
    { id: 18, category: "marmite", name: "Marmite n°8", status: "available", jeune: "", pro: "", time: null },
    { id: 19, category: "marmite", name: "Marmite n°9", status: "available", jeune: "", pro: "", time: null },
    { id: 20, category: "marmite", name: "Marmite n°10", status: "available", jeune: "", pro: "", time: null },

    // 10 Bassines (IDs 21 à 30)
    { id: 21, category: "bassine", name: "Bassine n°1", status: "available", jeune: "", pro: "", time: null },
    { id: 22, category: "bassine", name: "Bassine n°2", status: "available", jeune: "", pro: "", time: null },
    { id: 23, category: "bassine", name: "Bassine n°3", status: "available", jeune: "", pro: "", time: null },
    { id: 24, category: "bassine", name: "Bassine n°4", status: "available", jeune: "", pro: "", time: null },
    { id: 25, category: "bassine", name: "Bassine n°5", status: "available", jeune: "", pro: "", time: null },
    { id: 26, category: "bassine", name: "Bassine n°6", status: "available", jeune: "", pro: "", time: null },
    { id: 27, category: "bassine", name: "Bassine n°7", status: "available", jeune: "", pro: "", time: null },
    { id: 28, category: "bassine", name: "Bassine n°8", status: "available", jeune: "", pro: "", time: null },
    { id: 29, category: "bassine", name: "Bassine n°9", status: "available", jeune: "", pro: "", time: null },
    { id: 30, category: "bassine", name: "Bassine n°10", status: "available", jeune: "", pro: "", time: null },

    // 2 Mixeurs (IDs 31 et 32)
    { id: 31, category: "mixeur", name: "Mixeur Plongeant n°1", status: "available", jeune: "", pro: "", time: null },
    { id: 32, category: "mixeur", name: "Mixeur Plongeant n°2", status: "available", jeune: "", pro: "", time: null },

    // 4 Cuiseurs à riz (IDs 33 à 36)
    { id: 33, category: "cuiseurriz", name: "Cuiseur à riz n°1", status: "available", jeune: "", pro: "", time: null },
    { id: 34, category: "cuiseurriz", name: "Cuiseur à riz n°2", status: "available", jeune: "", pro: "", time: null },
    { id: 35, category: "cuiseurriz", name: "Cuiseur à riz n°3", status: "available", jeune: "", pro: "", time: null },
    { id: 36, category: "cuiseurriz", name: "Cuiseur à riz n°4", status: "available", jeune: "", pro: "", time: null }
];

let genericLoans = [];
let medLogs = [];
let transLogs = [];
let frigoLogs = []; // <-- NOUVEAU : La mémoire de l'historique
let frigosData = Array.from({length: 6}, (_, i) => ({
    id: i + 1,
    name: `Frigo ${i + 1}`,
    cad: null,
    hyg: null,
    cont: null,
    time: null,
    pro: null,
    residents: []
}));

let annuaireData = {
    tech: "06 14 12 28 98",
    coordF: "06 19 44 39 36",
    coordM: "06 11 28 61 07",
    chef: "06 10 85 97 04",
    astreinte1: "06 00 00 00 00",
    astreinte2: "06 00 00 00 00"
};

let painLogs = [];
let painQty = 0;

let mediaData = {
    manette: { id: "manettes", name: "Manettes Xbox S", status: "available", jeune: "", pro: "", time: null, lastJeune: "-", lastTime: "-", signature: "" },
    telecommande: { id: "telecommandes", name: "Télécommandes TV", status: "available", jeune: "", pro: "", time: null, lastJeune: "-", lastTime: "-", signature: "" },
    ordinateur1: { id: "ordinateur1", name: "Ordinateur Portable n°1", status: "available", jeune: "", pro: "", time: null, lastJeune: "-", lastTime: "-", signature: "" },
    ordinateur2: { id: "ordinateur2", name: "Ordinateur Portable n°2", status: "available", jeune: "", pro: "", time: null, lastJeune: "-", lastTime: "-", signature: "" }
};

let mecsComptageLogs = []; // Base de sauvegarde des rapports finaux

let mediaLogs = []; // Boîte noire historique pour Power Automate

let mecsJeunesCatalog = [];

// Variables d'état volatiles pour la session de comptage en cours
let mecsSessionEnCours = null;
let mecsIndexActuel = 0;
let touchStartX = 0;
let touchEndX = 0;


const genericCatalog = [
    { id: "g1", name: "🍳 Poêle" },
    { id: "g2", name: "🥘 Casserole" },
    { id: "g3", name: "🔪 Planche à découper" },
    { id: "g4", name: "🍝 Passoire" },
    { id: "g5", name: "🍴 Ustensiles" } // <-- NOUVEL AJOUT !
];

// ==========================================
// 1.5 GESTIONNAIRE DE CLÉ DYNAMIQUE ET DÉCHIFFREMENT
// ==========================================
// 🧂 Sel fixe du coffre. Ne JAMAIS le modifier : il rendrait tous les coffres illisibles.
const SEL_VAULT = "Permia_Vault_2026_Coallia";
const ITERATIONS_VAULT = 120000;

// 🛡️ Dérivation lente : rend le vol du téléphone très coûteux à exploiter
function derriverCleVault(motDePasse) {
    return CryptoJS.PBKDF2(motDePasse, CryptoJS.enc.Utf8.parse(SEL_VAULT), {
        keySize: 256 / 32,
        iterations: ITERATIONS_VAULT,
        hasher: CryptoJS.algo.SHA256
    }).toString();
}

// 🧩 FILET DE SÉCURITÉ : garantit que CryptoJS est bien disponible.
// Après un location.reload() (déconnexion, verrouillage auto), le service worker
// peut servir la page sans que le script du CDN soit rejoué. On le recharge alors
// à la demande, avant tout calcul cryptographique.
let _chargementCrypto = null;
function assurerCryptoJS() {
    if (typeof CryptoJS !== "undefined") return Promise.resolve(true);
    if (_chargementCrypto) return _chargementCrypto;

    _chargementCrypto = new Promise((resolve) => {
        const sources = [
            "crypto-js.min.js", // copie locale (prioritaire, marche hors-ligne)
            "https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.2.0/crypto-js.min.js"
        ];
        let i = 0;
        const essayer = () => {
            if (i >= sources.length) { _chargementCrypto = null; return resolve(false); }
            const s = document.createElement('script');
            s.src = sources[i++];
            s.onload = () => resolve(typeof CryptoJS !== "undefined");
            s.onerror = essayer;
            document.head.appendChild(s);
        };
        essayer();
    });
    return _chargementCrypto;
}

// Clé de chiffrement du coffre (PBKDF2)
function getCleMaitresse() {
    return sessionStorage.getItem('permia_session_key');
}

// Badge envoyé au Worker (formule historique, inchangée)
function getCleAuth() {
    return sessionStorage.getItem('permia_auth_key');
}

function tenterDechiffrement(coffre, cle) {
    try {
        const bytes = CryptoJS.AES.decrypt(coffre, cle);
        const texte = bytes.toString(CryptoJS.enc.Utf8);
        if (!texte) return null;
        return JSON.parse(texte);
    } catch (e) {
        return null;
    }
}

function dechiffrerCoffreLocal() {
    const coffreFort = localStorage.getItem('coallia_secure_vault');
    if (!coffreFort) return false;

    const cleVault = getCleMaitresse();
    if (!cleVault) return false;

    // 1. Tentative avec la clé forte
    let donnees = tenterDechiffrement(coffreFort, cleVault);
    let migrationNecessaire = false;

    // 2. Repli : ancien coffre chiffré avec la clé faible (SHA-256)
    if (!donnees) {
        const cleLegacy = getCleAuth();
        if (cleLegacy) {
            donnees = tenterDechiffrement(coffreFort, cleLegacy);
            if (donnees) migrationNecessaire = true;
        }
    }

    if (!donnees) {
        console.error("🛑 Erreur : Clé invalide ou coffre corrompu.");
        return false;
    }

    mecsComptageLogs = donnees.mecsComptageLogs || [];
    if (donnees.inventory && donnees.inventory.length >= 32) { // 32 = ancien socle, à ne pas relever
        const inventaireParDefaut = inventory;
        inventory = donnees.inventory;

        // 🔄 FUSION : on réinjecte les articles ajoutés depuis la dernière sauvegarde
        //    (ex. nouveaux cuiseurs à riz) sans toucher aux prêts en cours.
        inventaireParDefaut.forEach(ref => {
            if (!inventory.some(i => i.id === ref.id)) {
                inventory.push({ ...ref });
            }
        });
        inventory.sort((a, b) => a.id - b.id);
    }
    genericLoans = donnees.genericLoans || [];
    medLogs = donnees.medLogs || [];
    transLogs = donnees.transLogs || [];
    frigoLogs = donnees.frigoLogs || [];
    painLogs = donnees.painLogs || [];
    mediaLogs = donnees.mediaLogs || [];
    frigosData = donnees.frigosData || frigosData;
    mediaData = donnees.mediaData || mediaData;
    annuaireData = donnees.annuaireData || annuaireData;

    // 🔄 Migration transparente vers le chiffrement renforcé
    if (migrationNecessaire) {
        console.log("🔄 Migration du coffre vers le chiffrement renforcé (PBKDF2)...");
        sauvegarderToutesLesDonnees();
    }

    return true;
}

// Nettoyage de sécurité
localStorage.removeItem('coallia_inventory');
localStorage.removeItem('coallia_generic_loans');
localStorage.removeItem('coallia_med_logs');
localStorage.removeItem('coallia_trans_logs');

let accordions = { marmitexl: false, marmite: false, mixeur: false, bassine: false, cuiseurriz: false };
const catNames = { marmitexl: "🍲 Marmites XL", marmite: "🥘 Marmites", mixeur: "🌪️ Mixeurs", bassine: "🥣 Bassines", cuiseurriz: "🍚 Cuiseurs à riz" };

let residentAccordions = {};
let modePanier = false;
let panierUnique = []; 
let panierGeneric = {}; 
let modePanierRetour = false;
let panierRetour = []; 
let selectedActionType = null; 
let selectedItemId = null; 
let modalQty = 1; 
let html5QrCode = null;
let isScanning = false;

// ==========================================
// 2. THEME & SAUVEGARDE (CRYPTAGE AES)
// ==========================================
function sauvegarderToutesLesDonnees() {
    const dataToSave = {
        inventory: inventory,
        genericLoans: genericLoans,
        medLogs: medLogs,
        transLogs: transLogs,
        frigoLogs: frigoLogs,
        painLogs: painLogs,
        frigosData: frigosData,
        mecsComptageLogs: mecsComptageLogs,
        mediaData: mediaData,
        annuaireData: annuaireData,
        mediaLogs: mediaLogs
    };

    const jsonString = JSON.stringify(dataToSave);
    const cle = getCleMaitresse();
    if (!cle) {
        console.error("🛡️ Sécurité : Sauvegarde bloquée car le coffre est verrouillé.");
        return; 
    }
    const donneesCryptees = CryptoJS.AES.encrypt(jsonString, cle).toString();

    // 💾 Sauvegarde locale (mode hors-ligne)
    // ⚠️ localStorage plafonne à ~5 Mo. Sans ce garde, une saturation
    //    interromprait la fonction AVANT l'envoi cloud, sans aucun signal.
    try {
        localStorage.setItem('coallia_secure_vault', donneesCryptees);
    } catch (err) {
        console.error("🛑 Mémoire locale saturée :", err);

        const badge = document.getElementById('offline-badge');
        if (badge) {
            badge.innerText = "⚠️ Mémoire pleine — sauvegarde locale impossible";
            badge.classList.remove('hidden');
        }
        if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
        // On NE s'arrête pas : l'envoi cloud reste la meilleure chance de conserver les données.
    }

    // ☁️ SAUVEGARDE INSTANTANÉE SUR LE CLOUD (PUSH)
    if (navigator.onLine) {
        const URL_RELAIS = "https://relais-permia.imsamsix.workers.dev";
        fetch(URL_RELAIS, {
            method: "POST",
            headers: { "Content-Type": "application/json", "X-Permia-Key": getCleAuth() },            
            body: JSON.stringify({
                type: "cloud_sync",
                vaultData: donneesCryptees
            })
        }).catch(err => console.log("Sauvegarde Cloud reportée (Hors-ligne)"));
    }

    if (typeof rafraichirBadgeAttente === "function") rafraichirBadgeAttente();
}

function toggleThemeAnimated() {
    const icon = document.getElementById('theme-icon');
    const text = document.getElementById('theme-text');
    
    // 1. Petite vibration et animation de disparition (ça tourne et ça rétrécit)
    if(navigator.vibrate) navigator.vibrate(50);
    if(icon) icon.style.transform = "rotate(-160deg) scale(0.15)";
    
    // 2. On attend la moitié de l'animation pour changer les couleurs et le texte
    setTimeout(() => {
        const isDark = document.body.classList.toggle('dark-mode');
        localStorage.setItem('coallia_theme', isDark ? 'dark' : 'light');
        
        if (icon && text) {
            icon.innerText = isDark ? '☀️' : '🌙';
            text.innerText = isDark ? 'Passer au Mode Clair' : 'Passer au Mode Sombre';
            
            // 3. Animation d'apparition (ça tourne dans l'autre sens et reprend sa taille)
            icon.style.transform = "rotate(200deg) scale(1)";
            setTimeout(() => { icon.style.transform = "rotate(0deg) scale(1)"; }, 380);
        }
    }, 150); // Le timing correspond à la moitié du transition (0.3s) du CSS
}

function initTheme() {
    const isDark = localStorage.getItem('coallia_theme') === 'dark';
    if (isDark) {
        document.body.classList.add('dark-mode');
    }
    
    // Mise à jour de l'icône et du texte du menu au lancement de l'appli
    const icon = document.getElementById('theme-icon');
    const text = document.getElementById('theme-text');
    if (icon && text) {
        icon.innerText = isDark ? '☀️' : '🌙';
        text.innerText = isDark ? 'Passer au Mode Clair' : 'Passer au Mode Sombre';
    }
}

function startClock() {
    setInterval(() => {
        const clockEl = document.getElementById('real-time-clock');
        if (clockEl && !document.getElementById('med-app').classList.contains('hidden')) {
            const now = new Date();
            clockEl.innerText = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        }
    }, 1000);
}

// ==========================================
// 3. AUTHENTIFICATION & NAVIGATION
// ==========================================

// 🎬 SIGNAL D'ÉCHEC D'AUTHENTIFICATION
//    Bulle rouge animée (rebond + oscillation) + halo rouge pulsant sur les champs.
//    Tout se réinitialise dès que l'utilisateur retape quelque chose.
// 🎯 Par défaut, seul le champ code est signalé : c'est le seul qui puisse être "faux".
function echecAuth(message, idsChamps = ['pass-pro']) {
    const errorBubble = document.getElementById('error-bubble');
    const champs = idsChamps
        .map(id => document.getElementById(id))
        .filter(Boolean);

    // 🔴 La bulle : on relance l'animation même sur deux échecs d'affilée
    if (errorBubble) {
        errorBubble.innerText = message;
        errorBubble.classList.remove('hidden', 'show', 'bulle-alerte');
        void errorBubble.offsetWidth; // 🔄 force le navigateur à rejouer l'animation
        errorBubble.classList.add('show', 'bulle-alerte');
    }

    // 🧹 Nettoyage à la première correction de l'utilisateur
    const nettoyer = () => {
        champs.forEach(c => {
            c.classList.remove('champ-erreur');
            c.removeEventListener('input', nettoyer);
        });
        if (errorBubble) {
            errorBubble.classList.remove('show', 'bulle-alerte');
            setTimeout(() => errorBubble.classList.add('hidden'), 300);
        }
    };

    // 🌊 Le halo rouge sur les deux champs
    champs.forEach(champ => {
        champ.classList.remove('champ-erreur');
        void champ.offsetWidth;
        champ.classList.add('champ-erreur');
        champ.addEventListener('input', nettoyer);
    });

    if (navigator.vibrate) navigator.vibrate(200);
}

async function validerConnexionSecurisee() {
    const inputPrenom = document.getElementById('prenom-pro').value.trim();
    const inputPass = document.getElementById('pass-pro').value;
    const errorBubble = document.getElementById('error-bubble');
    const btn = document.getElementById('btn-login');

    if (!inputPass || !inputPrenom) {
        // Ici on marque précisément le ou les champs manquants
        const manquants = [];
        if (!inputPrenom) manquants.push('prenom-pro');
        if (!inputPass) manquants.push('pass-pro');
        echecAuth("⚠️ Veuillez remplir tous les champs", manquants);
        return;
    }

    const originalText = btn.innerText;
    btn.innerText = "⏳ Vérification sécurisée...";
    btn.disabled = true;
    btn.style.opacity = "0.8";

    // 🧩 GARDE : sans module de chiffrement, on sort proprement (bouton rendu)
    const cryptoPret = await assurerCryptoJS();
    if (!cryptoPret) {
        echecAuth("⚠️ Module de sécurité non chargé. Vérifiez la connexion, puis réessayez.");
        btn.innerText = originalText;
        btn.disabled = false;
        btn.style.opacity = "1";
        return;
    }

    // 🎨 Respiration : laisse le navigateur peindre "Vérification sécurisée..."
    // avant le calcul PBKDF2 (120 000 itérations = 1 à 2 s de gel sur mobile)
    await new Promise(r => setTimeout(r, 50));

    // 🔑 Badge serveur : formule historique (le Worker reste inchangé)
    const cleAuth = CryptoJS.SHA256("Permia_Secret_" + inputPass).toString();
    // 🛡️ Clé du coffre : dérivation lente PBKDF2
    const cleVault = derriverCleVault(inputPass);

    try {
        const URL_RELAIS = "https://relais-permia.imsamsix.workers.dev"; 
        const response = await fetch(URL_RELAIS, {
            method: "POST",
            headers: { "Content-Type": "application/json", "X-Permia-Key": cleAuth },
            body: JSON.stringify({ type: "login" }) // Le mot de passe ne voyage plus sur le réseau !
        });

        if (response.ok) {
            // ✅ SUCCÈS : Le serveur a validé le calcul
            const data = await response.json(); // 👑 Extraction du payload
            
            sessionStorage.setItem('permia_session_key', cleVault);
            sessionStorage.setItem('permia_auth_key', cleAuth);
            localStorage.setItem('coallia_pro_prenom', inputPrenom);
            const expirationTime = new Date().getTime() + (8 * 60 * 60 * 1000);
            localStorage.setItem('coallia_session_expire', expirationTime);

            // 👑 Injection immédiate du trajet réel dans l'application
            if (data.mecsCatalog) {
                mecsJeunesCatalog = data.mecsCatalog;
            }

            // ☁️ RÉCUPÉRATION DU COFFRE DISTANT DÈS LA CONNEXION
            // Sans ça, un appareil fraîchement installé s'ouvre vide et peut
            // écraser le coffre de l'équipe à la première saisie.
            try {
                const reponseVault = await fetch(URL_RELAIS + "?t=" + Date.now(), {
                    method: "GET",
                    headers: { "X-Permia-Key": cleAuth }
                });
                const dataVault = await reponseVault.json();

                if (dataVault.vault && dataVault.vault !== "null") {
                    const sauvegardeLocale = localStorage.getItem('coallia_secure_vault');
                    localStorage.setItem('coallia_secure_vault', dataVault.vault);

                    // dechiffrerCoffreLocal gère la clé forte ET la migration legacy
                    if (!dechiffrerCoffreLocal()) {
                        if (sauvegardeLocale) {
                            localStorage.setItem('coallia_secure_vault', sauvegardeLocale);
                        } else {
                            localStorage.removeItem('coallia_secure_vault');
                        }
                        console.warn("⚠️ Coffre distant illisible : mémoire locale conservée.");
                    }
                }
            } catch (e) {
                console.log("📡 Coffre distant non récupéré, la mémoire locale est conservée.");
            }

            // 🛡️ GARDE ANTI-ÉCRASEMENT : si un coffre existe mais refuse de s'ouvrir,
            // c'est que la clé est mauvaise. On refuse l'accès plutôt que d'écraser les données.
            const coffreExiste = !!localStorage.getItem('coallia_secure_vault');
            if (coffreExiste && !dechiffrerCoffreLocal()) {
                sessionStorage.removeItem('permia_session_key');
                sessionStorage.removeItem('permia_auth_key');
                echecAuth("❌ Code incorrect (données protégées).");
                if (typeof jouerSon === "function") jouerSon("error");
                return;
            }

            if (navigator.vibrate) navigator.vibrate([50, 50]);
            document.getElementById('pass-pro').value = ""; 
            openMenu();

        } else if (response.status === 401 || response.status === 403 || response.status === 429) {
            // 🛑 REFUS FERME DU SERVEUR : code faux, accès révoqué, ou trop de tentatives.
            // On NE tente PAS le déverrouillage local : c'est une décision du serveur, pas une panne.
            sessionStorage.removeItem('permia_session_key');
            sessionStorage.removeItem('permia_auth_key');
            echecAuth((response.status === 429)
                ? "⏳ Trop de tentatives. Réessayez dans 15 minutes."
                : "❌ Code incorrect ou accès révoqué.");
            if (typeof jouerSon === "function") jouerSon("error");

        } else {
            // ⚠️ Erreur serveur (500, 502, maintenance...) : ce n'est PAS un refus d'accès.
            // On bascule sur le mode dégradé local, comme pour une panne réseau.
            throw new Error("Serveur indisponible");
        }

    } catch (err) {
        // 📡 LE SERVEUR EST INJOIGNABLE (HORS-LIGNE) OU MAUVAIS CODE
            sessionStorage.setItem('permia_session_key', cleVault);
            sessionStorage.setItem('permia_auth_key', cleAuth);

        if (dechiffrerCoffreLocal()) {
            localStorage.setItem('coallia_pro_prenom', inputPrenom);
            const expirationTime = new Date().getTime() + (8 * 60 * 60 * 1000);
            localStorage.setItem('coallia_session_expire', expirationTime);

            if (navigator.vibrate) navigator.vibrate([50, 50]);
            document.getElementById('pass-pro').value = ""; 
            openMenu();
        } else {
            sessionStorage.removeItem('permia_session_key');
            sessionStorage.removeItem('permia_auth_key');
            echecAuth("❌ Code incorrect ou connexion requise pour initialiser l'appareil.");
            if (typeof jouerSon === "function") jouerSon("error");
        }
    } finally {
        btn.innerText = originalText;
        btn.disabled = false;
        btn.style.opacity = "1";
    }
}

// --- MISE À JOUR DU DASHBOARD DYNAMIQUE ---
function updateDashboardBadges() {
    const now = new Date();
    
    // 1. Calcul des retards matériel (> 24h)
    let retards = 0;
    inventory.filter(i => i.status !== 'available').forEach(item => {
        const diffHours = (now - new Date(item.time)) / 3600000;
        if (diffHours >= 24) retards++;
    });
    
    let matSeen = parseInt(localStorage.getItem('mat_seen_count') || 0);
    if (retards < matSeen) { matSeen = retards; localStorage.setItem('mat_seen_count', matSeen); }
    let unseenMat = retards - matSeen;

    const badgeMat = document.getElementById('badge-materiel');
    if (badgeMat) {
        if (unseenMat > 0) {
            badgeMat.innerText = `${unseenMat} RETARD${unseenMat > 1 ? 'S' : ''}`;
            badgeMat.className = "hub-badge"; 
            badgeMat.classList.remove('hidden');
        } else { badgeMat.classList.add('hidden'); }
    }

    // 2. Calcul des frigos à évaluer
    let frigosAevaluer = 0;
    const UNE_SEMAINE = 7 * 24 * 60 * 60 * 1000;
    frigosData.forEach(f => {
        const isCheck = f.cad && f.hyg && f.cont;
        const isRecent = f.time && ((now.getTime() - f.time) < UNE_SEMAINE);
        if (!isCheck || !isRecent) frigosAevaluer++;
    });

    let frigoSeen = parseInt(localStorage.getItem('frigo_seen_count') || 0);
    if (frigosAevaluer < frigoSeen) { frigoSeen = frigosAevaluer; localStorage.setItem('frigo_seen_count', frigoSeen); }
    let unseenFrigo = frigosAevaluer - frigoSeen;

    const badgeFrigo = document.getElementById('badge-frigo');
    if (badgeFrigo) {
        if (unseenFrigo > 0) {
            badgeFrigo.innerText = `${unseenFrigo} FRIGO${unseenFrigo > 1 ? 'S' : ''}`;
            badgeFrigo.className = "hub-badge warning"; 
            badgeFrigo.classList.remove('hidden');
        } else { badgeFrigo.classList.add('hidden'); }
    }

    // 3. Calcul des transmissions
    let startLimit = new Date(now);
    if (now.getHours() < 16) startLimit.setDate(startLimit.getDate() - 1);
    startLimit.setHours(16, 0, 0, 0);
    
    let transSeen = parseInt(localStorage.getItem('trans_seen_count') || 0);
    
    if (nbTrans < transSeen) { transSeen = nbTrans; localStorage.setItem('trans_seen_count', transSeen); }
    let unseenTrans = nbTrans - transSeen;

    if (badgeTrans) {
        if (unseenTrans > 0) {
            badgeTrans.innerText = `${unseenTrans} NOUVELLE${unseenTrans > 1 ? 'S' : ''}`;
            badgeTrans.className = "hub-badge info"; 
            badgeTrans.classList.remove('hidden');
        } else { badgeTrans.classList.add('hidden'); }
    }
}

function openMenu() {
    document.querySelectorAll('.view').forEach(el => el.classList.add('hidden'));
    document.getElementById('home-menu').classList.remove('hidden');
    
    const prenom = localStorage.getItem('coallia_pro_prenom') || "";
    document.getElementById('display-pro-menu').innerText = "👤 " + prenom;
    
    // 👑 PERSONNALISATION TEMPORELLE (Horaires Réels Coallia)
    const now = new Date();
    const day = now.getDay(); // 0 = Dimanche, 1 = Lundi, 5 = Vendredi, 6 = Samedi
    const time = now.getHours() + (now.getMinutes() / 60); // Ex: 8h30 devient 8.5
    
    let message = "";
    let subMessage = "";

    // 1. Détection du Week-end (Vendredi 21h au Lundi 8h30)
    const isWeekend = (day === 5 && time >= 21) || (day === 6) || (day === 0) || (day === 1 && time < 8.5);

    if (isWeekend) {
        message = `Bon courage ${prenom} 🛡️`;
        subMessage = `L'équipe de veille compte sur vous ce week-end.`;
    } 
    // 2. Détection de la Nuit en semaine (21h à 8h30)
    else if (time >= 21 || time < 8.5) {
        message = `Bonne veille ${prenom} 🌙`;
        subMessage = `Restez vigilant·e cette nuit.`;
    } 
    // 3. Matin (8h30 à 12h30)
    else if (time >= 8.5 && time < 12.5) {
        message = `Bonjour ${prenom} ☕`;
        subMessage = `Bonne permanence du matin !`;
    } 
    // 4. Pause Midi (12h30 à 14h00)
    else if (time >= 12.5 && time < 14) {
        message = `Bon appétit ${prenom} 🍽️`;
        subMessage = `Soufflez un peu avant la reprise de 14h.`;
    } 
    // 5. Après-midi (14h00 à 16h00)
    else if (time >= 14 && time < 16) {
        message = `Bon après-midi ${prenom} 💪`;
        subMessage = `Dernière ligne droite avant la relève.`;
    } 
    // 6. Fin de journée / Soirée (16h00 à 21h00)
    else if (time >= 16 && time < 21) {
        message = `Bonsoir ${prenom} 🌇`;
        subMessage = `Bonne permanence du soir !`;
    }

    // Injection dans le HTML
    const titleEl = document.getElementById('welcome-message');
    if (titleEl) {
        titleEl.innerHTML = `${message}<br><span style="font-size:15px; color:var(--text-gray); font-weight:600;">${subMessage}</span>`;
    }
    
    // Mise à jour des pastilles (Dashbord dynamique)
    updateDashboardBadges();
}

function openMateriel() {
    // On mémorise qu'on a vu les frigos et les retards en cours
    const now = new Date();
    let retards = 0;
    inventory.filter(i => i.status !== 'available').forEach(item => {
        if (((now - new Date(item.time)) / 3600000) >= 24) retards++;
    });
    localStorage.setItem('mat_seen_count', retards);

    let frigosAevaluer = 0;
    frigosData.forEach(f => {
        const isCheck = f.cad && f.hyg && f.cont;
        const isRecent = f.time && ((now.getTime() - f.time) < (7 * 24 * 60 * 60 * 1000));
        if (!isCheck || !isRecent) frigosAevaluer++;
    });
    localStorage.setItem('frigo_seen_count', frigosAevaluer);

    document.getElementById('home-menu').classList.add('hidden');
    document.getElementById('main-app').classList.remove('hidden');

    // 🎯 CORRECTIF : on force l'affichage de l'onglet actif dès l'ouverture.
    //    Sans ça, la grille restait vide jusqu'au premier changement d'onglet.
    const ongletActif = document.querySelector('.tabs-nav .tab-btn.active');
    const tabId = ongletActif ? ongletActif.id.replace('tab-btn-', '') : 'dispo';
    switchTab(tabId);

    // 👑 INITIALISATION DU RENDU FLUIDE AU LANCEMENT
    setTimeout(() => {
        const activeBtn = document.querySelector('.tabs-nav .tab-btn.active');
        const indicator = document.getElementById('tab-indicator');
        if (activeBtn && indicator) {
            let initialLeft = activeBtn.offsetLeft;
            indicator.dataset.lastLeft = initialLeft; // Mémorise la position de départ
            
            // Calcul et fixation des ancrages initiaux
            const parentWidth = activeBtn.parentNode.offsetWidth;
            indicator.style.left = initialLeft + 'px';
            indicator.style.right = (parentWidth - (initialLeft + activeBtn.offsetWidth)) + 'px';
        }
    }, 10);
}

function switchTab(tab) {
    document.getElementById('view-dispo').classList.toggle('hidden', tab !== 'dispo');
    document.getElementById('view-emprunt').classList.toggle('hidden', tab !== 'emprunt');
    document.getElementById('view-frigos').classList.toggle('hidden', tab !== 'frigos');
    
    document.getElementById('tab-btn-dispo').classList.toggle('active', tab === 'dispo');
    document.getElementById('tab-btn-emprunt').classList.toggle('active', tab === 'emprunt');
    document.getElementById('tab-btn-frigos').classList.toggle('active', tab === 'frigos');

    // ♿ On tient l'état accessible à jour en même temps que le visuel
    document.querySelectorAll('.tab-btn').forEach(b => {
        b.setAttribute('aria-selected', b.classList.contains('active') ? 'true' : 'false');
    });

    // 👑 CAPTEUR CINÉTIQUE : CALCUL DE L'ÉTIREMENT DE LA PILULE
    const activeBtn = document.getElementById('tab-btn-' + tab);
    const indicator = document.getElementById('tab-indicator');
    if (activeBtn && indicator) {
        let oldLeft = parseFloat(indicator.dataset.lastLeft || 0);
        let newLeft = activeBtn.offsetLeft;
        
        // Injection instantanée de la classe selon la direction du clic
        if (newLeft > oldLeft) {
            indicator.className = "tab-indicator move-right";
        } else if (newLeft < oldLeft) {
            indicator.className = "tab-indicator move-left";
        }
        
        // Sauvegarde de la nouvelle position pour le prochain voyage
        indicator.dataset.lastLeft = newLeft;
        
        // Mutation dynamique des coordonnées Gauche/Droite
        const parentWidth = activeBtn.parentNode.offsetWidth;
        indicator.style.left = newLeft + 'px';
        indicator.style.right = (parentWidth - (newLeft + activeBtn.offsetWidth)) + 'px';
    }

    const btnScan = document.getElementById('main-scan-btn');
    const btnPhoto = document.getElementById('main-photo-btn');

    // ⚡ AFFICHAGE INSTANTANÉ SELON L'ONGLET
    if (tab === 'frigos') {
        btnScan.classList.add('hidden');
        btnPhoto.classList.remove('hidden');
        renderFrigos(); // Plus de délai !
    } else {
        btnScan.classList.remove('hidden');
        btnPhoto.classList.add('hidden');
    }

    if (tab === 'emprunt') {
        if (modePanier) toggleModePanier();
        const searchInput = document.getElementById('search-emprunt');
        if (searchInput && searchInput.value !== '') searchInput.value = '';
        renderItems(); // Plus de délai !
    }
    
    if (tab === 'dispo') {
        if (modePanierRetour) toggleModePanierRetour();
        residentAccordions = {}; 
        renderItems(); // Plus de délai !
    }
}

function toggleAccordion(cat) { accordions[cat] = !accordions[cat]; renderItems(); }
function toggleResident(jeune) { residentAccordions[jeune] = !residentAccordions[jeune]; renderItems(); }

function ouvrirCGU() {
    document.getElementById('login-screen').classList.add('hidden');
    document.getElementById('cgu-view').classList.remove('hidden');
}

function fermerCGU() {
    document.getElementById('cgu-view').classList.add('hidden');
    document.getElementById('login-screen').classList.remove('hidden');
}

// ==========================================
// 4. LOGIQUE DES PANIERS (MATÉRIEL)
// ==========================================
function toggleModePanier() {
    modePanier = !modePanier;
    panierUnique = [];
    panierGeneric = {};
    const btn = document.getElementById('btn-mode-panier');
    if (modePanier) {
        btn.classList.add('active');
        btn.innerText = "❌ Annuler la sélection";
    } else {
        btn.classList.remove('active');
        btn.innerText = "🛒 Mode Emprunt Groupé";
        document.getElementById('floating-panier').classList.add('hidden');
    }
    renderItems();
}

function toggleModePanierRetour() {
    modePanierRetour = !modePanierRetour;
    panierRetour = [];
    const btn = document.getElementById('btn-mode-panier-retour');
    if (modePanierRetour) {
        btn.classList.add('active');
        btn.innerText = "❌ Annuler la sélection";
    } else {
        btn.classList.remove('active');
        btn.innerText = "📦 Mode Retour Groupé";
        document.getElementById('floating-panier').classList.add('hidden');
    }
    renderItems();
}

function majBarrePanier() {
    const totalUnique = panierUnique.length;
    const totalGeneric = Object.values(panierGeneric).reduce((a, b) => a + b, 0);
    const total = totalUnique + totalGeneric;
    const barre = document.getElementById('floating-panier');
    if (total > 0) {
        barre.classList.remove('hidden');
        document.getElementById('panier-count').innerText = `${total} objet(s) à prêter`;
    } else { barre.classList.add('hidden'); }
}

function majBarrePanierRetour() {
    const total = panierRetour.length;
    const barre = document.getElementById('floating-panier');
    if (total > 0) {
        barre.classList.remove('hidden');
        document.getElementById('panier-count').innerText = `${total} objet(s) à rendre`;
    } else { barre.classList.add('hidden'); }
}

function updatePanierGeneric(genId, delta, event) {
    event.stopPropagation(); 
    if (!panierGeneric[genId]) panierGeneric[genId] = 0;
    panierGeneric[genId] += delta;
    if (panierGeneric[genId] <= 0) delete panierGeneric[genId];
    majBarrePanier(); renderItems();
}

// ==========================================
// 5. GESTION DES CLICS (MATÉRIEL)
// ==========================================
function clicCarteUnique(id) {
    const item = inventory.find(i => i.id == id);
    if (item.status === 'available') {
        if (modePanier) {
            if (panierUnique.includes(id)) panierUnique = panierUnique.filter(i => i !== id);
            else panierUnique.push(id);
            majBarrePanier(); renderItems();
        } else {
            selectedActionType = "unique"; selectedItemId = id; ouvrirModal(item.name, true);
        }
    } else {
        if (modePanierRetour) {
            if (panierRetour.includes(id)) panierRetour = panierRetour.filter(i => i !== id);
            else panierRetour.push(id);
            majBarrePanierRetour(); renderItems();
        } else {
            selectedActionType = "unique"; selectedItemId = id; ouvrirModal(item.name, false);
        }
    }
}

function clicCarteGeneric(genId) {
    if (modePanier) {
        if (!panierGeneric[genId]) panierGeneric[genId] = 1;
        else delete panierGeneric[genId]; 
        majBarrePanier(); renderItems();
    } else {
        selectedActionType = "generic"; selectedItemId = genId; modalQty = 1; 
        document.getElementById('modal-qty-display').innerText = modalQty;
        ouvrirModal(genericCatalog.find(g => g.id === genId).name, true, true); 
    }
}

function clicRetourGeneric(loanId) {
    if (modePanierRetour) {
        if (panierRetour.includes(loanId)) panierRetour = panierRetour.filter(id => id !== loanId);
        else panierRetour.push(loanId);
        majBarrePanierRetour(); renderItems();
    } else {
        selectedActionType = "return_generic"; selectedItemId = loanId;
        ouvrirModal(genericLoans.find(l => l.loanId == loanId).name, false);
    }
}

// ==========================================
// 6. MODALS ET VALIDATION (MATÉRIEL)
// ==========================================
function ouvrirModal(nomMateriel, isDispo, showQty = false) {
    document.getElementById('action-modal').classList.remove('hidden');
    document.getElementById('nom-jeune').classList.remove('input-error');
    document.getElementById('action-error').classList.add('hidden');

    if (isDispo) {
        document.getElementById('modal-title').innerText = "Emprunter";
        document.getElementById('modal-desc').innerText = `Prêter "${nomMateriel}" à :`;
        document.getElementById('input-container').classList.remove('hidden');
        document.getElementById('nom-jeune').value = "";
        document.getElementById('qty-container').classList.toggle('hidden', !showQty);
    } else {
        document.getElementById('modal-title').innerText = "Retour Matériel";
        document.getElementById('modal-desc').innerText = `Confirmer le retour de "${nomMateriel}" ?`;
        document.getElementById('input-container').classList.add('hidden');
    }
}

function ouvrirModalPanier() {
    if (modePanier) {
        selectedActionType = "panier";
        const total = panierUnique.length + Object.values(panierGeneric).reduce((a, b) => a + b, 0);
        ouvrirModal(`${total} objets sélectionnés`, true, false);
    } else if (modePanierRetour) {
        selectedActionType = "panier_retour";
        ouvrirModal(`${panierRetour.length} objets à rendre`, false, false);
    }
}

function changeModalQty(delta) {
    if (modalQty + delta >= 1) {
        modalQty += delta;
        document.getElementById('modal-qty-display').innerText = modalQty;
    }
}

function validerAction() {
    const nom = document.getElementById('nom-jeune').value.trim();
    const pro = localStorage.getItem('coallia_pro_prenom');
    
    if (selectedActionType !== "return_generic" && selectedActionType !== "panier_retour") {
        const item = selectedActionType === "unique" ? inventory.find(i => i.id == selectedItemId) : null;
        if ((selectedActionType === "generic" || selectedActionType === "panier" || (item && item.status === 'available'))) {
            if (!nom) {
                document.getElementById('nom-jeune').classList.add('input-error');
                document.getElementById('action-error').classList.remove('hidden');
                return;
            }
        }
    }

    const timestamp = new Date();

    if (selectedActionType === "panier") {
        panierUnique.forEach(id => {
            let i = inventory.find(x => x.id == id);
            if (i) { i.status = "borrowed"; i.jeune = nom; i.pro = pro; i.time = timestamp; }
        });
        for (let genId in panierGeneric) {
            let gen = genericCatalog.find(g => g.id === genId);
            genericLoans.push({ loanId: String(Date.now() + Math.random()), genericId: genId, name: gen.name, qty: panierGeneric[genId], jeune: nom, pro: pro, time: timestamp });
        }
        residentAccordions[nom.toUpperCase()] = true; 
        toggleModePanier();

    } else if (selectedActionType === "panier_retour") {
        panierRetour.forEach(id => {
            let i = inventory.find(x => x.id == id);
            if (i) { i.status = "available"; i.jeune = ""; i.pro = ""; i.time = null; } 
            else { genericLoans = genericLoans.filter(l => l.loanId != id); }
        });
        toggleModePanierRetour();

    } else if (selectedActionType === "generic") {
        let gen = genericCatalog.find(g => g.id === selectedItemId);
        genericLoans.push({ loanId: String(Date.now() + Math.random()), genericId: selectedItemId, name: gen.name, qty: modalQty, jeune: nom, pro: pro, time: timestamp });
        residentAccordions[nom.toUpperCase()] = true; 

    } else if (selectedActionType === "return_generic") {
        genericLoans = genericLoans.filter(l => l.loanId != selectedItemId);

    } else if (selectedActionType === "unique") {
        let item = inventory.find(i => i.id == selectedItemId);
        if (item && item.status === "available") {
            item.status = "borrowed"; item.jeune = nom; item.pro = pro; item.time = timestamp;
            residentAccordions[nom.toUpperCase()] = true; 
        } else if (item) {
            item.status = "available"; item.jeune = ""; item.pro = ""; item.time = null;
        }
    }

    sauvegarderToutesLesDonnees();
    fermerModals();
    renderItems();
}

// ==========================================
// 7. AFFICHAGE DU MATÉRIEL
// ==========================================
function renderItems() {
    const zoneDispo = document.getElementById('list-dispo');
    const zoneEmprunt = document.getElementById('list-emprunt');
    zoneDispo.innerHTML = ""; zoneEmprunt.innerHTML = "";

    for (let catKey in catNames) {
        let items = inventory.filter(i => i.category === catKey);
        let dispos = items.filter(i => i.status === 'available');
        let accHeader = document.createElement('div');
        accHeader.className = "accordion-header";
        accHeader.innerHTML = `<span>${catNames[catKey]} (${dispos.length}/${items.length})</span> <span>${accordions[catKey] ? '▲' : '▼'}</span>`;
        accHeader.onclick = () => toggleAccordion(catKey);
        zoneDispo.appendChild(accHeader);

        if (accordions[catKey]) {
            let accContent = document.createElement('div');
            accContent.className = "accordion-content open";
            dispos.forEach(item => {
                const isSel = modePanier && panierUnique.includes(item.id);
                let card = document.createElement('div');
                card.className = `item-card available ${isSel ? 'selected-panier' : ''}`;
                card.onclick = () => clicCarteUnique(item.id);
                card.innerHTML = `<div class="status-line"></div><div class="card-body"><div class="info"><h3>${item.name}</h3></div><div class="dot-indicator"></div></div>`;
                accContent.appendChild(card);
            });
            if(dispos.length === 0) accContent.innerHTML = `<p style="color:var(--text-gray); font-size:13px; margin:5px 0;">Tout est emprunté.</p>`;
            zoneDispo.appendChild(accContent);
        }
    }

    let titreGeneric = document.createElement('h3');
    titreGeneric.className = "section-title";
    titreGeneric.innerText = "🍳 Petit Matériel (Libre)";
    zoneDispo.appendChild(titreGeneric);

    let gridGeneric = document.createElement('div');
    gridGeneric.className = "items-grid";

    genericCatalog.forEach(gen => {
        const qtyInPanier = panierGeneric[gen.id] || 0;
        const isSel = modePanier && qtyInPanier > 0;
        let card = document.createElement('div');
        card.className = `item-card generic ${isSel ? 'selected-panier' : ''}`;
        card.onclick = () => clicCarteGeneric(gen.id);

        let actionHTML = `<p class="status-text" style="color:var(--coallia-blue)">Illimité</p>`;
        if (isSel) {
            actionHTML = `
                <div class="qty-controls" onclick="event.stopPropagation()">
                    <button class="qty-btn" onclick="updatePanierGeneric('${gen.id}', -1, event)">-</button>
                    <span>${qtyInPanier}</span>
                    <button class="qty-btn" onclick="updatePanierGeneric('${gen.id}', 1, event)">+</button>
                </div>
            `;
        }
        card.innerHTML = `<div class="status-line"></div><div class="card-body"><div class="info"><h3>${gen.name}</h3></div>${actionHTML}</div>`;
        gridGeneric.appendChild(card);
    });
    zoneDispo.appendChild(gridGeneric);


    const creerCarteEmprunt = (idAction, name, statusClass, isOverdue, jeune, pro, time, isGenericAction) => {
        const isSelRetour = modePanierRetour && panierRetour.includes(idAction);
        let card = document.createElement('div');
        card.className = `item-card ${statusClass} ${isOverdue ? 'overdue' : ''} ${isSelRetour ? 'selected-panier' : ''}`;
        card.onclick = () => isGenericAction ? clicRetourGeneric(idAction) : clicCarteUnique(idAction);
        
        const heure = new Date(time).toLocaleTimeString('fr-FR', {hour:'2-digit', minute:'2-digit'});
        card.innerHTML = `
            <div class="status-line"></div>
            <div class="card-body">
                <div class="info">
                    <h3>${name}</h3>
                    <p class="status-text">${isOverdue ? "RETARD ⚠️ (+24h)" : "En cours de prêt"}</p>
                </div>
                <div class="dot-indicator"></div>
            </div>
            <div class="card-footer">
                <div class="row"><span>👤 Jeune :</span> <b>${securiserTexte(jeune)}</b></div>
                <div class="row"><span>🔑 Professionnel ·le:</span> <b>${securiserTexte(pro)}</b></div>
                <div class="row"><span>🕒 Heure de prêt :</span> <b>${heure}</b></div>
            </div>
        `;
        return card; 
    };

    let groupedLoans = {}; 
    const now = new Date();

    inventory.filter(i => i.status !== 'available').forEach(item => {
        let nomJeune = item.jeune.trim().toUpperCase();
        if (!groupedLoans[nomJeune]) groupedLoans[nomJeune] = [];
        groupedLoans[nomJeune].push({ type: 'unique', data: item });
    });

    genericLoans.forEach(loan => {
        let nomJeune = loan.jeune.trim().toUpperCase();
        if (!groupedLoans[nomJeune]) groupedLoans[nomJeune] = [];
        groupedLoans[nomJeune].push({ type: 'generic', data: loan });
    });

    const residents = Object.keys(groupedLoans);

    if (residents.length === 0) {
        zoneEmprunt.innerHTML = `<p style="text-align:center; color:var(--text-gray); margin-top:30px; font-weight:600;">Aucun matériel en cours de prêt.</p>`;
    } else {
        // 🔍 FILTRAGE DE RECHERCHE INTELLIGENTE
        const searchInput = document.getElementById('search-emprunt');
        const searchTerm = searchInput ? searchInput.value.trim().toUpperCase() : "";
        
        // On ne garde que les résidents dont le nom contient ce qui est tapé
        const filteredResidents = residents.filter(jeune => jeune.includes(searchTerm));

        if (filteredResidents.length === 0) {
            zoneEmprunt.innerHTML = `<p style="text-align:center; color:var(--text-gray); margin-top:30px; font-weight:600;">Aucun résultat pour "${securiserTexte(searchInput.value)}".</p>`;
        } else {
            filteredResidents.forEach(jeune => {
                // Pour la recherche : on ouvre l'accordéon automatiquement si on fait une recherche précise
                const isOpen = residentAccordions[jeune] === true || searchTerm.length > 1;
                
                let title = document.createElement('div');
                title.className = "resident-title";
                title.onclick = () => toggleResident(jeune);
                title.innerHTML = `<span>📦 MATÉRIEL DE : <b>${securiserTexte(jeune)}</b></span> <span>${isOpen ? '▲' : '▼'}</span>`;
                zoneEmprunt.appendChild(title);
                
                if (isOpen) {
                    let gridCartes = document.createElement('div');
                    gridCartes.className = "items-grid";

                    groupedLoans[jeune].forEach(emprunt => {
                        const isGeneric = emprunt.type === 'generic';
                        const item = emprunt.data;
                        const diffHours = (now - new Date(item.time)) / 3600000;
                        const isOverdue = diffHours >= 24;
                        const itemName = isGeneric ? `${item.name} (x${item.qty})` : item.name;
                        const actionId = isGeneric ? item.loanId : item.id;
                        
                        let carteDOM = creerCarteEmprunt(actionId, itemName, "borrowed", isOverdue, item.jeune, item.pro, item.time, isGeneric);
                        gridCartes.appendChild(carteDOM);
                    });
                    zoneEmprunt.appendChild(gridCartes);
                }
            });
        }
    }
}


// ==========================================
// 8. LOGIQUE MÉDICAMENTS
// ==========================================
function openMedicaments() {
    document.getElementById('home-menu').classList.add('hidden');
    document.getElementById('med-app').classList.remove('hidden');
}

function checkMedAutre() {
    const val = document.getElementById('med-type').value;
    const containerAutre = document.getElementById('med-type-autre-container');
    const inputAutre = document.getElementById('med-type-autre');
    
    if (val === "Autre") { 
        containerAutre.classList.remove('hidden'); 
    } else { 
        containerAutre.classList.add('hidden'); 
        inputAutre.value = ""; 
        inputAutre.style.height = "54px"; // Réinitialise la hauteur
    }
}

function checkMotifAutre() {
    const val = document.getElementById('med-motif').value;
    const containerAutre = document.getElementById('med-motif-autre-container');
    const inputAutre = document.getElementById('med-motif-autre');
    
    if (val === "Autre") { 
        containerAutre.classList.remove('hidden'); 
    } else { 
        containerAutre.classList.add('hidden'); 
        inputAutre.value = ""; 
        inputAutre.style.height = "54px"; // Réinitialise la hauteur
    }
}

function effacerMedAutre() {
    const textarea = document.getElementById('med-type-autre');
    textarea.value = '';
    textarea.style.height = '54px';
    textarea.focus();
}

function effacerMotifAutre() {
    const textarea = document.getElementById('med-motif-autre');
    textarea.value = '';
    textarea.style.height = '54px';
    textarea.focus();
}

function validerMedicament() {
    const educateur = localStorage.getItem('coallia_pro_prenom');
    const nomJeune = document.getElementById('med-nom-jeune').value.trim();

    let typeMed = document.getElementById('med-type').value;
    let symptome = document.getElementById('med-motif').value;

    const inputMedAutre = document.getElementById('med-type-autre').value.trim();
    const inputSymptomeAutre = document.getElementById('med-motif-autre').value.trim();

    if (typeMed === "Autre") typeMed = inputMedAutre;
    if (symptome === "Autre") symptome = inputSymptomeAutre;

    document.getElementById('med-nom-jeune').classList.remove('input-error');
    document.getElementById('med-type').classList.remove('input-error');
    document.getElementById('med-motif').classList.remove('input-error');
    
    let error = false;
    if (!nomJeune) { 
        document.getElementById('med-nom-jeune').classList.add('input-error'); 
        error = true; 
    }
    if (!typeMed) { 
        document.getElementById('med-type').classList.add('input-error'); // <-- Ligne ajoutée
        error = true; 
    }
    if (!symptome) { 
        document.getElementById('med-motif').classList.add('input-error'); // <-- Ligne ajoutée
        error = true; 
    }

    if (error) {
        const errorBubble = document.getElementById('med-error-bubble');
        errorBubble.classList.remove('hidden');
        
        if(navigator.vibrate) navigator.vibrate([200]); // Petite vibration d'erreur comme pour les transmissions
        
        setTimeout(() => errorBubble.classList.add('hidden'), 3000);
        return; 
    }

    const typeMedClean = typeMed.toLowerCase();
    const nomJeuneClean = nomJeune.toLowerCase();

    // 🧹 Nettoyage des logs
    medLogs = medLogs.filter(log => log.resident && log.resident.trim() !== "");

    // --- 🛡️ VÉRIFICATION DOLIPRANE (6H) ---
    if (typeMedClean.includes('doliprane') || typeMedClean.includes('paracétamol') || typeMedClean.includes('paracetamol')) {
        const prisesJeune = medLogs.filter(log => 
            log.resident.toLowerCase() === nomJeuneClean && 
            (log.medicament.toLowerCase().includes('doliprane') || log.medicament.toLowerCase().includes('paracétamol') || log.medicament.toLowerCase().includes('paracetamol'))
        );

        if (prisesJeune.length > 0) {
            const dernierePrise = prisesJeune[prisesJeune.length - 1]; 
            const timeDernierePrise = new Date(dernierePrise.timestamp);
            const diffHeures = (new Date() - timeDernierePrise) / (1000 * 60 * 60);

            if (diffHeures < 6) {
                const nextTime = new Date(timeDernierePrise.getTime() + (6 * 60 * 60 * 1000));
                const heurePossible = nextTime.toLocaleTimeString('fr-FR', {hour: '2-digit', minute: '2-digit'});
                
                document.getElementById('med-alert-text').innerHTML = `
                    <b>${nomJeune}</b> a déjà pris du Doliprane/Paracétamol récemment.<br><br>
                    Prochaine prise autorisée à :<br>
                    <span style="display:inline-block; margin-top:15px; font-size: 26px; font-weight: 800; color: var(--text-dark); background: var(--input-bg); padding: 10px 20px; border-radius: 12px;">
                        ${heurePossible}
                    </span>
                `;
                
                document.getElementById('med-alert-modal').classList.remove('hidden');
                return; 
            }
        }
    }

    // --- 💾 ENREGISTREMENT ---
    const timestamp = new Date();
    const heureExacte = timestamp.toLocaleTimeString('fr-FR', {hour:'2-digit', minute:'2-digit', second:'2-digit'});
    const date = timestamp.toLocaleDateString('fr-FR');

    const dataToExport = {
        timestamp: timestamp.getTime(), 
        date: date,
        heure: heureExacte,
        educateur: educateur,
        resident: nomJeune,
        medicament: typeMed,
        symptome: symptome,
        synced: false 
    };
    
    medLogs.push(dataToExport);
    sauvegarderToutesLesDonnees();
    synchroniserDonnees();

    // --- ✨ RÉINITIALISATION DE L'INTERFACE ---
    document.getElementById('med-nom-jeune').value = "";
    document.getElementById('med-type').value = "";
    document.getElementById('med-motif').value = "";
    checkMedAutre(); 
    checkMotifAutre(); 

    document.getElementById('modal-recorded-time').innerText = "à " + heureExacte;
    document.getElementById('med-success-modal').classList.remove('hidden');
    
    setTimeout(() => {
        document.getElementById('med-success-modal').classList.add('hidden');
        openMenu(); 
    }, 2500); 
}

// ==========================================
// 10. SCANNER CAMÉRA
// ==========================================
function ouvrirScanner() {
    document.getElementById('scanner-modal').classList.remove('hidden');
    isScanning = true; 
    html5QrCode = new Html5Qrcode("reader");
    html5QrCode.start(
        { facingMode: "environment" },
        {
            fps: 10,
            // 🎯 La zone analysée épouse le viseur affiché (62 % du plus petit côté)
            qrbox: (largeurVue, hauteurVue) => {
                const cote = Math.floor(Math.min(largeurVue, hauteurVue) * 0.62);
                return { width: cote, height: cote };
            }
        },
        onScanSuccess
    ).then(() => {
        // 🔦 On n'affiche le bouton que si l'appareil dispose réellement d'une lampe
        setTimeout(verifierDisponibiliteTorche, 600);
    }).catch(err => {
        alert("Impossible d'accéder à la caméra."); fermerScanner();
    });
}

// ==========================================
// 🔦 ÉCLAIRAGE DU SCANNER
//    Utile pour les QR codes collés dans les placards, la nuit.
// ==========================================
let torcheActive = false;

function pisteVideoScanner() {
    const video = document.querySelector('#reader video');
    if (!video || !video.srcObject) return null;
    const pistes = video.srcObject.getVideoTracks();
    return pistes && pistes.length ? pistes[0] : null;
}

function verifierDisponibiliteTorche() {
    const btn = document.getElementById('btn-torche');
    if (!btn) return;
    try {
        const piste = pisteVideoScanner();
        const capacites = piste && piste.getCapabilities ? piste.getCapabilities() : {};
        if (capacites && capacites.torch) {
            btn.classList.remove('hidden');
        } else {
            btn.classList.add('hidden');
        }
    } catch (e) {
        btn.classList.add('hidden');
    }
}

async function basculerTorche() {
    const btn = document.getElementById('btn-torche');
    const label = document.getElementById('btn-torche-label');
    try {
        const piste = pisteVideoScanner();
        if (!piste) return;

        torcheActive = !torcheActive;
        await piste.applyConstraints({ advanced: [{ torch: torcheActive }] });

        btn.classList.toggle('active', torcheActive);
        if (label) label.innerText = torcheActive ? "Éclairage allumé" : "Éclairage";
        if (navigator.vibrate) navigator.vibrate(30);
    } catch (e) {
        console.warn("🔦 Éclairage indisponible :", e);
        torcheActive = false;
        if (btn) btn.classList.add('hidden');
    }
}

function reinitialiserTorche() {
    torcheActive = false;
    const btn = document.getElementById('btn-torche');
    const label = document.getElementById('btn-torche-label');
    if (btn) { btn.classList.remove('active'); btn.classList.add('hidden'); }
    if (label) label.innerText = "Éclairage";
}

function onScanSuccess(decodedText) {
    if (!isScanning) return;
    isScanning = false; 
    reinitialiserTorche();
    document.getElementById('scanner-modal').classList.add('hidden');
    if (html5QrCode) html5QrCode.stop().then(() => analyserCodeProprement(decodedText)).catch(err => analyserCodeProprement(decodedText));
    else analyserCodeProprement(decodedText);
}

function fermerScanner() {
    isScanning = false;
    reinitialiserTorche();
    document.getElementById('scanner-modal').classList.add('hidden');
    if (html5QrCode) html5QrCode.stop().catch(e => console.error(e));
}

function analyserCodeProprement(texte) {
    let idTrouve = null;
    let txt = texte.trim();
    if (!isNaN(txt) && txt.length < 5) idTrouve = parseInt(txt);
    else {
        try {
            if (!txt.startsWith("http")) txt = "https://" + txt;
            let param = new URL(txt).searchParams.get("scan");
            if (param) idTrouve = parseInt(param);
            else if (txt.includes("scan=")) idTrouve = parseInt(txt.split("scan=")[1]);
        } catch (e) {
            if (txt.includes("scan=")) idTrouve = parseInt(txt.split("scan=")[1]);
        }
    }

    // 📳 + 🔊 GESTION DES VIBRATIONS ET DES SONS
    if (idTrouve && inventory.find(i => i.id == idTrouve)) {
        // ✅ SUCCÈS : Son "Bip" + Double vibration
        jouerSon("success");
        if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
        
        setTimeout(() => clicCarteUnique(idTrouve), 200);
    } else {
        // ❌ ERREUR : Son grave + Longue vibration
        jouerSon("error");
        if (navigator.vibrate) navigator.vibrate([400]);
        
        // On affiche la belle modale personnalisée au lieu de l'alerte du navigateur
        document.getElementById('qr-error-text').innerText = texte;
        document.getElementById('qr-error-modal').classList.remove('hidden');
    }
}


// ==========================================
// 🔊 GÉNÉRATEUR DE SONS (Web Audio API)
// ==========================================
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function jouerSon(type) {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    if (type === "success") {
        // Un "Bip" aigu et rapide pour le succès
        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); 
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime); // Volume à 10%
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.1); 
    } else {
        // Un "Bzzzt" grave et plus long pour l'erreur
        oscillator.type = "sawtooth";
        oscillator.frequency.setValueAtTime(150, audioCtx.currentTime); 
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.4); 
    }
}

// ==========================================
// 11. FONCTION VOIR/CACHER MOT DE PASSE
// ==========================================
function togglePasswordVisibility() {
    const passInput = document.getElementById('pass-pro');
    const toggleIcon = document.getElementById('toggle-password');
    if (passInput.type === "password") {
        passInput.type = "text";
        toggleIcon.innerText = "🙉"; 
    } else {
        passInput.type = "password";
        toggleIcon.innerText = "🙈"; 
    }
}

// ==========================================
// 12. UTILITAIRES
// ==========================================

function securiserTexte(texte) {
    if (!texte) return "";
    const div = document.createElement('div');
    div.textContent = texte;
    return div.innerHTML;
}
function ouvrirLogout() { document.getElementById('logout-modal').classList.remove('hidden'); }
function fermerModals() { document.querySelectorAll('.modal-overlay').forEach(m => m.classList.add('hidden')); }
function confirmerDeconnexion() { 
    localStorage.removeItem('coallia_pro_prenom'); 
    localStorage.removeItem('coallia_session_expire');
    sessionStorage.removeItem('permia_session_key');
    sessionStorage.removeItem('permia_auth_key');
    if (typeof purgerToutAutosave === "function") purgerToutAutosave();
    location.reload(); 
}

// ==========================================
// 🔒 VERROUILLAGE AUTOMATIQUE (téléphone partagé)
// ==========================================
const DELAI_INACTIVITE_MS = 15 * 60 * 1000; // 15 minutes sans action
let dernierContact = Date.now();

function signalerActivite() {
    dernierContact = Date.now();
}

function verrouillerApp(motif) {
    if (!getCleMaitresse()) return; // déjà verrouillé

    // 1. On sauvegarde AVANT de perdre la clé
    try { sauvegarderToutesLesDonnees(); } catch (e) { console.error(e); }

    // 2. On efface les traces de session
    localStorage.removeItem('coallia_pro_prenom');
    localStorage.removeItem('coallia_session_expire');
    sessionStorage.removeItem('permia_session_key');
    sessionStorage.removeItem('permia_auth_key');
    if (typeof purgerToutAutosave === "function") purgerToutAutosave();

    console.log("🔒 Verrouillage automatique :", motif);
    location.reload();
}

function verifierSession() {
    if (!getCleMaitresse()) return;

    const expire = parseInt(localStorage.getItem('coallia_session_expire') || "0");

    if (expire && Date.now() > expire) {
        verrouillerApp("session de 8h expirée");
        return;
    }
    if (Date.now() - dernierContact > DELAI_INACTIVITE_MS) {
        verrouillerApp("inactivité prolongée");
    }
}

function ouvrirPainModal() {
    painQty = 0;
    updatePainDisplay();
    
    const obsInput = document.getElementById('pain-obs');
    if (obsInput) {
        obsInput.value = "";
        obsInput.style.height = "54px";
    }
    document.getElementById('pain-modal').classList.remove('hidden');
}

function changePainQty(delta) {
    if (painQty + delta >= 0) {
        painQty += delta;
        updatePainDisplay();
    }
}

function updatePainDisplay() {
    const displayEl = document.getElementById('pain-qty-display');
    if (!displayEl) return;
    
    displayEl.innerText = painQty;
    
    // Application stricte de tes règles de couleur
    if (painQty === 0) {
        displayEl.style.backgroundColor = "var(--success)"; // Vert
    } else if (painQty >= 1 && painQty <= 5) {
        displayEl.style.backgroundColor = "var(--warning)"; // Orange
    } else {
        displayEl.style.backgroundColor = "var(--danger)";  // Rouge
    }
}

function validerPain() {
    const pro = localStorage.getItem('coallia_pro_prenom');
    const timestamp = new Date();
    const heureExacte = timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

    // 👑 LA LIGNE CORRECTRICE : On récupère l'observation depuis le HTML
    const obsText = document.getElementById('pain-obs') ? document.getElementById('pain-obs').value.trim() : "";

    const newLog = {
        timestamp: timestamp.getTime(),
        date: timestamp.toLocaleDateString('fr-FR'),
        heure: heureExacte,
        educateur: pro,
        quantite_restante: painQty,
        observations: obsText, // Maintenant obsText est bien défini !
        synced: false
    };

    painLogs.push(newLog);
    sauvegarderToutesLesDonnees();
    synchroniserDonnees();

    fermerModals(); // La pop-up se referme immédiatement

    // Déclenchement de la notification verte de confirmation
    document.getElementById('modal-recorded-time').innerText = "à " + heureExacte;
    document.getElementById('med-success-modal').classList.remove('hidden');
    
    setTimeout(() => {
        document.getElementById('med-success-modal').classList.add('hidden');
    }, 2200);
}

let painIntervalId = null; // Stocke l'identifiant du compteur de temps

function startPainInterval(delta) {
    if (painIntervalId) return; // Sécurité : évite de lancer plusieurs compteurs en même temps
    
    // 1. On applique le premier changement immédiatement au clic
    changePainQty(delta);
    
    // 2. On lance la boucle automatique tant que le doigt reste posé (toutes les 150 millisecondes)
    painIntervalId = setInterval(() => {
        // Sécurité : On bloque l'augmentation automatique si on dépasse 50 pains
        if (delta === 1 && painQty >= 50) {
            stopPainInterval();
            return;
        }
        changePainQty(delta);
    }, 150); 
}

function stopPainInterval() {
    if (painIntervalId) {
        clearInterval(painIntervalId); // On détruit le compteur de temps
        painIntervalId = null;
    }
}

function effacerObsPain() {
    const textarea = document.getElementById('pain-obs');
    if (textarea) {
        textarea.value = '';
        textarea.style.height = '54px';
        textarea.focus();
    }
}

// ==========================================
// 13. GESTION DE LA SYNCHRONISATION (100% INVISIBLE)
// ==========================================
async function synchroniserDonnees() {
    // 🛡️ GARDE : si le coffre est verrouillé, on n'envoie RIEN au serveur
    const cleSync = getCleMaitresse();
    if (!cleSync) {
        console.warn("🛡️ Synchronisation annulée : coffre verrouillé.");
        return;
    }

    const URL_RELAIS = "https://relais-permia.imsamsix.workers.dev";
    let changementEffectue = false; // 👑 NOUVEAU : On traque s'il y a du nouveau
    
    // 1. Envoi Médicaments
    const medLogsAEnvoyer = medLogs.filter(log => !log.synced);
    for (let log of medLogsAEnvoyer) {
        try {
            await fetch(URL_RELAIS, {
                method: "POST",
                headers: { "Content-Type": "application/json", "X-Permia-Key": getCleAuth() },
                body: JSON.stringify({ type: "medicament", ...log })
            });
            log.synced = true;
            changementEffectue = true;
        } catch (e) { break; }
    }

    // 3. Envoi Suivi Frigos
    const frigoLogsAEnvoyer = frigoLogs.filter(log => !log.synced);
    for (let log of frigoLogsAEnvoyer) {
        try {
            await fetch(URL_RELAIS, {
                method: "POST",
                headers: { "Content-Type": "application/json", "X-Permia-Key": getCleAuth() },
                body: JSON.stringify({
                    type: "frigo_eval",
                    date: log.date, heure: log.heure,
                    educateur: log.educateur, frigoId: log.frigoId,
                    nomFrigo: log.nomFrigo, cadenas: log.cadenas,
                    hygiene: log.hygiene, contenu: log.contenu,
                    observations: log.observations
                })
            });
            log.synced = true;
            changementEffectue = true;
        } catch (e) { break; }
    }

    // 4. Envoi Suivi Pain (Boîte Noire)
    const painLogsAEnvoyer = painLogs.filter(log => !log.synced);
    for (let log of painLogsAEnvoyer) {
        try {
            await fetch(URL_RELAIS, {
                method: "POST",
                headers: { "Content-Type": "application/json", "X-Permia-Key": getCleAuth() },
                body: JSON.stringify({
                    type: "pain",
                    educateur: log.educateur,
                    date: log.date,
                    heure: log.heure,
                    quantite_restante: log.quantite_restante,
                    observations: log.observations
                })
            });
            log.synced = true;
            changementEffectue = true;
        } catch (e) { break; }
    }

    // 5. Envoi Bilan Comptage MECS (Boîte Noire) - CORRIGÉ
    const mecsLogsAEnvoyer = mecsComptageLogs.filter(log => !log.synced);
    for (let log of mecsLogsAEnvoyer) {
        try {
            await fetch(URL_RELAIS, {
                method: "POST",
                headers: { "Content-Type": "application/json", "X-Permia-Key": getCleAuth() },
                body: JSON.stringify({ ...log, type: "comptage_mecs" })
            });
            log.synced = true;
            // 🧹 Le PDF a été transmis : on le retire du coffre pour ne pas saturer l'appareil
            delete log.pdfBase64;
            delete log.nomFichier;
            changementEffectue = true;
        } catch (e) { break; }
    }

    // 6. Envoi Historique Multimédia (Power Automate)
    const mediaLogsAEnvoyer = mediaLogs.filter(log => !log.synced);
    for (let log of mediaLogsAEnvoyer) {
        try {
            await fetch(URL_RELAIS, {
                method: "POST",
                headers: { "Content-Type": "application/json", "X-Permia-Key": getCleAuth() },
                body: JSON.stringify({ type: "multimedia_log", ...log })
            });
            log.synced = true;
            changementEffectue = true;
        } catch (e) { break; }
    }
    
    // 👑 CORRECTION CRITIQUE : On n'écrase le Cloud QUE si on a envoyé un nouveau truc
    if (changementEffectue) {
        sauvegarderToutesLesDonnees();
    }
}

// ==========================================
// 14. LANCEMENT AUTOMATIQUE & CLOUD SYNC
// ==========================================
window.onload = async () => {
    initTheme();

    // 👑 ENREGISTREMENT DU SERVICE WORKER (PWA Autonome pour le hors-ligne total)
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js')
            .then(() => console.log("🛡️ Permia : Service Worker actif (Mode hors-ligne sécurisé)"))
            .catch(err => console.error("🛑 Permia : Échec SW", err));
    }

    if (MODE_MAINTENANCE) {
        document.querySelectorAll('.view').forEach(el => el.classList.add('hidden')); 
        document.getElementById('maintenance-app').classList.remove('hidden'); 
        setTimeout(() => { document.getElementById('splash-screen').style.opacity = '0'; }, 500);
        setTimeout(() => { document.getElementById('splash-screen').style.display = 'none'; }, 1000);
        return; 
    }

    startClock();
    initialiserAutosave();

    // 🛡️ VÉRIFICATION DE LA SÉCURITÉ AU DÉMARRAGE
    const prenom = localStorage.getItem('coallia_pro_prenom');
    const expire = localStorage.getItem('coallia_session_expire');
    const cleSession = getCleMaitresse();
    const now = new Date().getTime();

    // Si la session est valide ET que la clé temporaire est toujours en mémoire (rafraîchissement de page)
    if (prenom && expire && now < parseInt(expire) && cleSession) {
        
        // 1. Déchiffrement local
        dechiffrerCoffreLocal();
        purgerDonneesAnciennes();

        // 2. Synchronisation Cloud (Sécurisée)
        if (navigator.onLine) {
            try {
                const URL_RELAIS = "https://relais-permia.imsamsix.workers.dev?t=" + now;
                const reponse = await fetch(URL_RELAIS, { 
                method: "GET",
                headers: { "X-Permia-Key": getCleAuth() }
                });

                const data = await reponse.json();

                if (data.mecsCatalog) {
                    mecsJeunesCatalog = data.mecsCatalog;
                }

                if (data.vault && data.vault !== "null") {
                    // On garde une copie de secours avant d'adopter le coffre distant
                    const sauvegardeLocale = localStorage.getItem('coallia_secure_vault');
                    localStorage.setItem('coallia_secure_vault', data.vault);

                    // dechiffrerCoffreLocal gère la clé forte ET la migration automatique
                    if (!dechiffrerCoffreLocal()) {
                        if (sauvegardeLocale) {
                            localStorage.setItem('coallia_secure_vault', sauvegardeLocale);
                        } else {
                            localStorage.removeItem('coallia_secure_vault');
                        }
                        console.warn("⚠️ Coffre distant illisible : mémoire locale conservée.");
                    }
                }
            } catch (e) {
                console.log("📡 Mode Hors-ligne : Utilisation de la mémoire locale.");
            }
            synchroniserDonnees();
        }

        openMenu();


    } else {
        // 🛑 L'utilisateur a fermé l'onglet ou la session a expiré : Verrouillage total
        localStorage.removeItem('coallia_pro_prenom');
        localStorage.removeItem('coallia_session_expire');
        sessionStorage.removeItem('permia_session_key'); // Nettoyage absolu
        sessionStorage.removeItem('permia_auth_key');
        if (typeof purgerToutAutosave === "function") purgerToutAutosave(); // 🛡️ Brouillons en clair effacés
    }

    // 🔒 SURVEILLANCE DU VERROUILLAGE — hors du if/else, donc active
    // aussi bien après une connexion manuelle qu'après un rechargement de page.
    signalerActivite();
    setInterval(verifierSession, 30000);

    // 📤 Compteur d'éléments en attente (hors du if/else : actif après connexion manuelle aussi)
    rafraichirBadgeAttente();
    setInterval(rafraichirBadgeAttente, 10000);

    // 🔄 Boucle de synchronisation — hors du if/else, sinon elle ne démarre jamais
    //    après une connexion par le formulaire.
    setInterval(() => { synchroniserDonnees(); }, 60000);

    // Détection de l'activité réelle du professionnel
    ['click', 'touchstart', 'keydown'].forEach(evt => {
        document.addEventListener(evt, signalerActivite, { passive: true });
    });

    // Contrôle immédiat au retour dans l'app (sortie de veille, changement d'onglet)
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
            verifierSession();
            if (getCleMaitresse() && navigator.onLine) synchroniserDonnees();
        }
    });

    // Gestion du badge hors-ligne
    const offlineBadge = document.getElementById('offline-badge');
    if (!navigator.onLine && offlineBadge) offlineBadge.classList.remove('hidden');

    window.addEventListener('offline', () => {
        if (offlineBadge) {
            offlineBadge.style.background = "var(--danger)";
            offlineBadge.innerHTML = "<span>☁️</span> Mode Hors-ligne";
            offlineBadge.classList.remove('hidden');
            if (navigator.vibrate) navigator.vibrate([200, 100, 200]); 
        }
    });

    window.addEventListener('online', () => {
        if (getCleMaitresse()) synchroniserDonnees();
        if (offlineBadge) {
            offlineBadge.style.background = "var(--success)";
            offlineBadge.innerHTML = "<span>✅</span> Connexion rétablie ! Synchronisation...";
            if (navigator.vibrate) navigator.vibrate([50, 50]);
            setTimeout(() => { offlineBadge.classList.add('hidden'); }, 3000);
        }
    });

    // ==========================================================================
    // 👑 CHORÉGRAPHIE LUXE : Écran Splash & Transition Enchaînée Premium
    // ==========================================================================

    // 1. À 2200ms : Le logo a été bien visible. On lance le fondu du Splash ET l'émergence de la carte en même temps !
    setTimeout(() => {
        const splash = document.getElementById('splash-screen');
        if (splash) splash.classList.add('hidden-splash'); // Lancement du fondu de sortie
        
        // 2. Simultanément, si la session est à initialiser, on prépare la carte en arrière-plan
        if (!(prenom && expire && now < parseInt(expire) && cleSession)) {
            const loginScreen = document.getElementById('login-screen');
            if (loginScreen) {
                loginScreen.classList.remove('hidden');
                
                // Micro-délai de 30ms pour forcer le navigateur à calculer le layout avant l'animation
                setTimeout(() => {
                    const card = loginScreen.querySelector('.auth-card');
                    if (card) card.classList.add('auth-card-entrance'); // Envolée cinétique
                }, 30);
            }
        }
    }, 1700); 
};

// ==========================================
// 15. COMMANDE SECRÈTE : LONG PRESS RESET (5s)
// ==========================================
let resetTimer;

function startResetTimer() {
    resetTimer = setTimeout(() => {
        purgerDonneesSecretement();
    }, 5000); 
}

function stopResetTimer() {
    clearTimeout(resetTimer);
}

function purgerDonneesSecretement() {
    // 🛡️ GARDE : cette purge est irréversible et se propage au cloud.
    //    Sur un téléphone partagé, un appui long involontaire ne doit jamais
    //    pouvoir effacer un registre réglementaire sans confirmation.
    if (medLogs.length === 0) {
        console.log("🤫 Purge demandée mais le registre est déjà vide.");
        return;
    }

    demanderConfirmation(
        "Effacer le registre médicaments ?",
        medLogs.length + " entrée(s) seront supprimées définitivement.\n"
        + "Cette action est irréversible et sera propagée au cloud.",
        executerPurgeMedicaments
    );
}

function executerPurgeMedicaments() {
    medLogs = []; 
    
    sauvegarderToutesLesDonnees();
    
    const errorBubble = document.getElementById('med-error-bubble');
    if (errorBubble) {
        errorBubble.innerText = "✨ Historique médicaments purgé";
        errorBubble.style.backgroundColor = "var(--success)";
        errorBubble.classList.remove('hidden');
        
        if (navigator.vibrate) navigator.vibrate([100, 50, 100]);

        setTimeout(() => {
            errorBubble.classList.add('hidden');
            setTimeout(() => {
                errorBubble.innerText = "⚠️ Veuillez remplir tous les champs obligatoires";
                errorBubble.style.backgroundColor = "var(--danger)";
            }, 300);
        }, 3000);
    }
    
    console.log("🤫 Nettoyage des logs médicaments effectué. Inventaire préservé.");
}

// ==========================================
// 16. RÉCAPITULATIF (TRANSMISSIONS & RÉUNIONS)
// ==========================================
function genererRecap() {
    let totalItems = 0;
    let grouped = {};
    const now = new Date();

    // 1. On rassemble le matériel
    inventory.filter(i => i.status === 'borrowed').forEach(item => {
        let nomJeune = item.jeune.trim().toUpperCase();
        if (!grouped[nomJeune]) grouped[nomJeune] = [];
        grouped[nomJeune].push({ name: item.name, time: item.time, pro: item.pro });
        totalItems++;
    });
    genericLoans.forEach(loan => {
        let nomJeune = loan.jeune.trim().toUpperCase();
        if (!grouped[nomJeune]) grouped[nomJeune] = [];
        grouped[nomJeune].push({ name: `${loan.name} (x${loan.qty})`, time: loan.time, pro: loan.pro });
        totalItems += loan.qty;
    });

    if (totalItems === 0) {
        document.getElementById('recap-empty-modal').classList.remove('hidden');
        if (navigator.vibrate) navigator.vibrate([50, 50]);
        if (typeof jouerSon === "function") jouerSon("success"); 
        return; 
    }

    const dateAujourdhui = now.toLocaleDateString('fr-FR');
    const heureAujourdhui = now.toLocaleTimeString('fr-FR', {hour:'2-digit', minute:'2-digit'});

    // 3. On génère un beau HTML structuré
    let htmlText = ``;

    for (let jeune in grouped) {
        htmlText += `
        <div style="margin-bottom: 15px; page-break-inside: avoid; font-family: 'Inter', sans-serif; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
            <div style="background: #0055a4; color: white; padding: 10px 15px; border-radius: 8px 8px 0 0; font-weight: bold; font-size: 13px; text-transform: uppercase;">
                👤 ${jeune}
            </div>
            <div style="background: #ffffff; border: 1px solid #e0e0e0; border-top: none; padding: 12px; border-radius: 0 0 8px 8px;">
                <ul style="margin: 0; padding-left: 20px; color: #333; font-size: 13px; line-height: 1.6;">`;
        
        grouped[jeune].forEach(emprunt => {
            const diffHours = (now - new Date(emprunt.time)) / 3600000;
            const isOverdue = diffHours >= 24;
            const alertTag = isOverdue ? `<span style="background: #ffebee; color: #d32f2f; font-weight: bold; border: 1px solid #d32f2f; padding: 2px 6px; border-radius: 4px; font-size: 10px; margin-right: 6px;">⚠️ RETARD</span>` : "";
            const datePret = new Date(emprunt.time).toLocaleDateString('fr-FR', {day:'2-digit', month:'2-digit'});
            const heurePret = new Date(emprunt.time).toLocaleTimeString('fr-FR', {hour:'2-digit', minute:'2-digit'});
            
            htmlText += `<li style="margin-bottom: 6px;">${alertTag}<b style="color: #222;">${emprunt.name}</b> <br><span style="color: #888; font-size: 11px; margin-left: 2px;">Prêté le ${datePret} à ${heurePret} par ${emprunt.pro}</span></li>`;
        });
        
        htmlText += `</ul></div></div>`;
    }

    htmlText += `<div style="text-align: right; font-weight: bold; font-size: 15px; color: #111; margin-top: 20px; border-top: 2px solid #0055a4; padding-top: 12px;">
        📦 Total : ${totalItems} objet(s) emprunté(s)
    </div>`;

    document.getElementById('recap-content').innerHTML = htmlText;
    document.getElementById('recap-modal').classList.remove('hidden');
}

// ==========================================
// 17. SIGNATURE CRÉATEUR (Easter Egg 5 Clics)
// ==========================================

function afficherBanniereAmour() {

    if (document.getElementById('easter-banner')) return;

    const banner = document.createElement('div');
    banner.id = "easter-banner";
    banner.innerText = "💙 V•C•D•N•S 💙";
    banner.style.position = "fixed";
    banner.style.top = "20px";
    banner.style.left = "50%";
    banner.style.transform = "translateX(-50%)";
    banner.style.background = "linear-gradient(135deg, #ff2d55 0%, #ff3b30 100%)";
    banner.style.color = "white";
    banner.style.padding = "12px 24px";
    banner.style.borderRadius = "20px";
    banner.style.fontWeight = "800";
    banner.style.fontSize = "15px";
    banner.style.boxShadow = "0 8px 20px rgba(255, 45, 85, 0.4)";
    banner.style.zIndex = "999999";
    banner.style.whiteSpace = "nowrap";
    banner.style.animation = "slideDownBanner 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)";

    document.body.appendChild(banner);

    if (typeof jouerSon === "function") jouerSon("success");

    setTimeout(() => {
        banner.style.animation = "slideUpBanner 0.5s ease-in forwards";
        setTimeout(() => banner.remove(), 500);
    }, 4000);
}

function creerPluieDeCoeurs() {
    const nbCoeurs = 40; 
    for (let i = 0; i < nbCoeurs; i++) {
        setTimeout(() => {
            const coeur = document.createElement('div');
            coeur.innerHTML = "❤️";
            coeur.className = "coeur-tombant";
            coeur.style.left = Math.random() * 100 + "vw";
            coeur.style.fontSize = (Math.random() * 20 + 15) + "px";
            coeur.style.animationDuration = (Math.random() * 2 + 2) + "s";
            document.body.appendChild(coeur);

            setTimeout(() => { coeur.remove(); }, 5000);
        }, i * 80); 
    }
}

// --- Zone de texte intelligente ---
function autoResize(textarea) {
    textarea.style.height = 'auto'; // Réinitialise la hauteur
    textarea.style.height = (textarea.scrollHeight) + 'px'; // Ajuste au texte
}

function effacerDesc() {
    const textarea = document.getElementById('trans-desc');
    textarea.value = '';
    textarea.style.height = '80px'; // Hauteur de base
    textarea.focus();
}

let idTransmissionASupprimer = null;

// --- LOGIQUE PHOTO FRIGOS ---
function declencherCamera() {
    document.getElementById('input-camera-cache').click();
}

// Variable pour stocker la photo compressée
let photoBase64Temp = "";

// Bouton "Reprendre une photo"
function reprendrePhotoSig() {
    document.getElementById('input-camera-cache').click();
}

// Gestionnaire de la caméra
document.getElementById('input-camera-cache').addEventListener('change', function(e) {
    if (e.target.files && e.target.files[0]) {
        if(navigator.vibrate) navigator.vibrate(50);
        
        const file = e.target.files[0];
        const reader = new FileReader();
        
        reader.onload = function(event) {
            const img = new Image();
            img.onload = function() {
                // Compression de l'image (MAX 1000px)
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 1000;
                let scaleSize = 1;
                if (img.width > MAX_WIDTH) {
                    scaleSize = MAX_WIDTH / img.width;
                }
                canvas.width = img.width * scaleSize;
                canvas.height = img.height * scaleSize;
                
                const ctx = canvas.getContext('2d');

                ctx.fillStyle = "white";
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                
                photoBase64Temp = canvas.toDataURL('image/jpeg', 0.7);
                
                // Mettre à jour le design de l'aperçu
                document.getElementById('photo-preview').style.backgroundImage = `url(${photoBase64Temp})`;
                document.getElementById('photo-preview').style.display = 'block';
                document.getElementById('btn-reprendre-photo').style.display = 'none';
                
                // On affiche la croix (en mode flex pour bien centrer le ✕)
                document.getElementById('btn-effacer-photo').style.display = 'flex';
                
                // On enlève les pointillés et l'éventuelle bordure rouge d'erreur
                document.getElementById('sig-photo-container').style.border = 'none';

                // Ouvrir la modale automatiquement
                document.getElementById('signalement-modal').classList.remove('hidden');
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
        
        e.target.value = ''; // Réinitialise l'input
    }
});

// Effacer la photo de l'aperçu
function effacerPhotoSig() {
    photoBase64Temp = "";
    document.getElementById('photo-preview').style.backgroundImage = 'none';
    document.getElementById('photo-preview').style.display = 'none';
    document.getElementById('btn-effacer-photo').style.display = 'none';
    document.getElementById('btn-reprendre-photo').style.display = 'block';
    document.getElementById('sig-photo-container').style.border = '2px dashed var(--coallia-blue)';
}

// Effacer le texte de la description
function effacerDescSig() {
    const textarea = document.getElementById('sig-desc');
    textarea.value = '';
    textarea.style.height = '80px'; // Hauteur de base corrigée
    textarea.focus();
}

// Envoyer le paquet au serveur
async function envoyerSignalement() {
    const frigoSelect = document.getElementById('sig-frigo-select');
    const descInput = document.getElementById('sig-desc');
    const photoContainer = document.getElementById('sig-photo-container');
    const errorBubble = document.getElementById('sig-error-bubble');
    
    const frigo = frigoSelect.value;
    const desc = descInput.value.trim();
    const proName = localStorage.getItem('coallia_pro_prenom') || 'Inconnu';
    
    // 1. Réinitialisation des erreurs visuelles
    frigoSelect.classList.remove('input-error');
    descInput.classList.remove('input-error');
    if (!photoBase64Temp) photoContainer.style.border = '2px dashed var(--coallia-blue)';

    let hasError = false;

    // 2. Vérifications avec bordures rouges
    if (!photoBase64Temp) {
        photoContainer.style.border = '2px dashed var(--danger)';
        hasError = true;
    }
    if (!frigo) {
        frigoSelect.classList.add('input-error');
        hasError = true;
    }
    if (!desc) {
        descInput.classList.add('input-error');
        hasError = true;
    }

    // 3. Affichage de la bulle si erreur
    if (hasError) {
        errorBubble.innerText = "⚠️ Veuillez remplir tous les champs et joindre une photo.";
        errorBubble.classList.remove('hidden');
        if(navigator.vibrate) navigator.vibrate([200]); 
        setTimeout(() => errorBubble.classList.add('hidden'), 3000);
        return;
    }

    const now = new Date();
    const btn = document.getElementById('btn-envoyer-sig');
    btn.innerText = "⏳ Envoi en cours...";
    btn.disabled = true;

    const base64Data = photoBase64Temp.split(',')[1];

    const payload = {
        type: "frigo_signalement",
        date: now.toLocaleDateString('fr-FR'),
        heure: now.toLocaleTimeString('fr-FR', {hour:'2-digit', minute:'2-digit'}),
        educateur: proName,
        nomFrigo: frigo,
        description: desc,
        photoBase64: base64Data
    };

    try {
        const URL_RELAIS = "https://relais-permia.imsamsix.workers.dev";
        const reponse = await fetch(URL_RELAIS, {
            method: "POST",
            headers: { "Content-Type": "application/json", "X-Permia-Key": getCleAuth() },
            body: JSON.stringify(payload)
        });

        if(reponse.ok) {
            fermerModals();
            
            effacerPhotoSig();
            frigoSelect.value = "";
            effacerDescSig();
            
            if(navigator.vibrate) navigator.vibrate([100, 50, 100]);
            if (typeof jouerSon === "function") jouerSon("success");
            
            document.getElementById('sig-success-modal').classList.remove('hidden');
            
            setTimeout(() => {
                document.getElementById('sig-success-modal').classList.add('hidden');
            }, 2500);

        } else {
            errorBubble.innerText = "❌ Erreur serveur. L'image est peut-être trop lourde.";
            errorBubble.classList.remove('hidden');
            setTimeout(() => errorBubble.classList.add('hidden'), 3000);
        }
    } catch(e) {
        errorBubble.innerText = "❌ Connexion perdue. Impossible d'envoyer.";
        errorBubble.classList.remove('hidden');
        setTimeout(() => errorBubble.classList.add('hidden'), 3000);
    }
    
    btn.innerText = "Envoyer";
    btn.disabled = false;
}


// ==========================================
// 19. GESTION DES FRIGOS (DASHBOARD & ÉVALUATION)
// ==========================================

function renderFrigos() {
    const container = document.getElementById('list-frigos');
    if (!container) return;
    container.innerHTML = "";

    // NOUVEAU : On prépare le calcul pour le délai d'une semaine (en millisecondes)
    const now = new Date();
    const UNE_SEMAINE = 7 * 24 * 60 * 60 * 1000;

    frigosData.forEach(f => {
        // Est-ce que le frigo a toutes les données ?
        const isCheck = f.cad && f.hyg && f.cont;
        
        // NOUVEAU : Est-ce que l'évaluation date de moins de 7 jours ?
        const isRecent = f.time && ((now.getTime() - f.time) < UNE_SEMAINE);

        // NOUVEAU : La couleur de la ligne (Bleu si complet ET récent, sinon Orange)
        const statusColor = (isCheck && isRecent) ? 'var(--coallia-blue)' : 'var(--warning)';
        
        // Assigner les bons emojis selon l'état enregistré
        const emojiCad = f.cad === 'ok' ? '🔒' : (f.cad === 'open' ? '🔓' : (f.cad === 'lost' ? '❌' : '❓'));
        const emojiHyg = f.hyg === 'clean' ? '✨' : (f.hyg === 'med' ? '⚠️' : (f.hyg === 'dirty' ? '☣️' : '❓'));
        const emojiCont = f.cont === 'ok' ? '✅' : (f.cont === 'sort' ? '🏷️' : '❓');
        
        // Formater la date du dernier contrôle
        const lastTime = f.time ? new Date(f.time).toLocaleDateString('fr-FR', {day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit'}) : "Jamais évalué";
        const lastPro = f.pro ? f.pro : "-";

        // Création de la carte avec un design vertical et centré
        let card = document.createElement('div');
        card.className = "item-card";
        card.style.marginBottom = "20px";
        
        // NOUVEAU DESIGN ÉPURÉ
        card.innerHTML = `
            <div class="status-line" style="background: ${statusColor}; height: 5px;"></div>
            
            <div class="card-body" style="padding: 25px 20px; display: flex; flex-direction: column; align-items: stretch;">
                
                <div style="text-align: center; margin-bottom: 20px;">
                    <h3 style="margin: 0 0 10px 0; font-size: 22px; color: var(--text-dark); font-weight: 800; letter-spacing: 1px; text-transform: uppercase;">${f.name}</h3>
                    <button onclick="voirJeunesFrigo(${f.id})" style="background: var(--bg-color); border: 1px solid var(--border-color); color: var(--text-dark); padding: 8px 16px; font-size: 13px; border-radius: 20px; font-weight: 600; cursor: pointer; transition: 0.2s;">👥 Voir les jeunes</button>
                </div>
                
                <div style="display: flex; justify-content: space-evenly; background: var(--input-bg); padding: 18px 5px; border-radius: 18px; margin-bottom: 25px;">
                    <div style="text-align: center;">
                        <div style="font-size: 28px; margin-bottom: 6px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));">${emojiCad}</div>
                        <div style="font-size: 10px; color: var(--text-gray); font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">Cadenas</div>
                    </div>
                    <div style="text-align: center;">
                        <div style="font-size: 28px; margin-bottom: 6px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));">${emojiHyg}</div>
                        <div style="font-size: 10px; color: var(--text-gray); font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">Hygiène</div>
                    </div>
                    <div style="text-align: center;">
                        <div style="font-size: 28px; margin-bottom: 6px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));">${emojiCont}</div>
                        <div style="font-size: 10px; color: var(--text-gray); font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">Contenu</div>
                    </div>
                </div>

                <button class="btn-primary" style="width: 100%; padding: 16px; font-size: 15px; border-radius: 14px; font-weight: 700; box-shadow: 0 4px 15px rgba(0,85,164,0.2);" onclick="ouvrirEvalFrigo(${f.id})">Nouvelle Évaluation</button>
            </div>
            
            <div class="card-footer" style="background: var(--footer-bg); padding: 14px 20px; font-size: 11px; color: var(--text-gray); display: flex; justify-content: space-between; border-top: 1px solid var(--border-color);">
                <span>Le <b style="color: var(--text-dark);">${lastTime}</b></span>
                <span>Par <b style="color: var(--text-dark);">${lastPro}</b></span>
            </div>
        `;
        container.appendChild(card);
    });
}

// Variables temporaires pour le formulaire d'évaluation
let frigoEnCoursEval = null;
let evalTemp = { cad: null, hyg: null, cont: null };

function voirJeunesFrigo(id) {
    document.getElementById('jeunes-frigo-title').innerText = "Frigo " + id + " - Jeunes";
    document.getElementById('liste-jeunes-frigo').innerHTML = "<i>La liste exacte des jeunes affectés à ce frigo sera ajoutée prochainement selon ta répartition.</i>";
    document.getElementById('jeunes-frigo-modal').classList.remove('hidden');
}

function ouvrirEvalFrigo(id) {
    frigoEnCoursEval = id;
    evalTemp = { cad: null, hyg: null, cont: null };
    document.getElementById('eval-frigo-title').innerText = "Évaluer Frigo " + id;
    
    // Nettoyage visuel de la précédente ouverture
    document.querySelectorAll('.btn-eval').forEach(b => b.classList.remove('selected'));
    const errorBubble = document.getElementById('frigo-error-bubble');
    if (errorBubble) errorBubble.classList.add('hidden');
    ['cad-container', 'hyg-container', 'cont-container'].forEach(cid => {
        const el = document.getElementById(cid);
        if(el) {
            el.style.borderColor = "transparent";
            el.style.backgroundColor = "transparent";
        }
    });
    
    const obsInput = document.getElementById('eval-frigo-obs');
    if(obsInput) {
        obsInput.value = "";
        obsInput.style.height = "54px";
    }
    
    document.getElementById('eval-frigo-modal').classList.remove('hidden');
}

function selectEval(cat, val) {
    evalTemp[cat] = val;
    // Mettre en surbrillance le bouton cliqué et éteindre les autres de la même catégorie
    document.querySelectorAll(`[id^="${cat}-"]`).forEach(b => b.classList.remove('selected'));
    document.getElementById(`${cat}-${val}`).classList.add('selected');
}

function validerEvalFrigo() {
    // 1. Réinitialiser les erreurs visuelles
    const containers = ['cad-container', 'hyg-container', 'cont-container'];
    containers.forEach(id => {
        const el = document.getElementById(id);
        if(el) {
            el.style.borderColor = "transparent";
            el.style.backgroundColor = "transparent";
        }
    });

    // 2. Vérifier s'il manque des critères (et allumer la ligne concernée)
    let hasError = false;
    
    if (!evalTemp.cad) {
        document.getElementById('cad-container').style.borderColor = "var(--danger)";
        document.getElementById('cad-container').style.backgroundColor = "rgba(255, 59, 48, 0.1)";
        hasError = true;
    }
    if (!evalTemp.hyg) {
        document.getElementById('hyg-container').style.borderColor = "var(--danger)";
        document.getElementById('hyg-container').style.backgroundColor = "rgba(255, 59, 48, 0.1)";
        hasError = true;
    }
    if (!evalTemp.cont) {
        document.getElementById('cont-container').style.borderColor = "var(--danger)";
        document.getElementById('cont-container').style.backgroundColor = "rgba(255, 59, 48, 0.1)";
        hasError = true;
    }

    // 3. Afficher l'alerte, vibrer et bloquer l'envoi
    if (hasError) {
        const errorBubble = document.getElementById('frigo-error-bubble');
        if (errorBubble) errorBubble.classList.remove('hidden');
        
        if(navigator.vibrate) navigator.vibrate(200); // Bzzzt d'erreur
        if(typeof jouerSon === "function") jouerSon("error"); // Bruit d'erreur
        
        setTimeout(() => {
            if (errorBubble) errorBubble.classList.add('hidden');
            containers.forEach(id => {
                const el = document.getElementById(id);
                if(el) {
                    el.style.borderColor = "transparent";
                    el.style.backgroundColor = "transparent";
                }
            });
        }, 3000);
        return; // On arrête tout si un champ manque !
    }

    // 4. Si tout est bon, on enregistre (Ton code initial pour la sauvegarde)
    const now = new Date();
    const proName = localStorage.getItem('coallia_pro_prenom') || 'Inconnu';
    const obsText = document.getElementById('eval-frigo-obs') ? document.getElementById('eval-frigo-obs').value.trim() : "";

    let f = frigosData.find(x => x.id === frigoEnCoursEval);
    if (f) {
        f.cad = evalTemp.cad;
        f.hyg = evalTemp.hyg;
        f.cont = evalTemp.cont;
        f.time = now.getTime();
        f.pro = proName;
    }

    const labelsCad = { 'ok': '🔒 Présent', 'open': '🔓 Ouvert', 'lost': '❌ Cassé' };
    const labelsHyg = { 'clean': '✨ Propre', 'med': '⚠️ Moyen', 'dirty': '☣️ Sale' };
    const labelsCont = { 'ok': '✅ R.A.S', 'sort': '🏷️ Tri à faire' };

    frigoLogs.push({
        idLog: now.getTime(),
        date: now.toLocaleDateString('fr-FR'),
        heure: now.toLocaleTimeString('fr-FR', {hour:'2-digit', minute:'2-digit'}),
        educateur: proName,
        frigoId: f.id,
        nomFrigo: f.name,
        cadenas: labelsCad[evalTemp.cad] || evalTemp.cad,
        hygiene: labelsHyg[evalTemp.hyg] || evalTemp.hyg,
        contenu: labelsCont[evalTemp.cont] || evalTemp.cont,
        observations: obsText,
        synced: false
    });

    sauvegarderToutesLesDonnees();
    if (typeof synchroniserDonnees === "function") synchroniserDonnees();
    
    renderFrigos();
    fermerModals();

    if(navigator.vibrate) navigator.vibrate([50, 50]);
}

function effacerObsFrigo() {
    const textarea = document.getElementById('eval-frigo-obs');
    textarea.value = '';
    textarea.style.height = '54px';
    textarea.focus();
}

// ==========================================
// 20. MODE ADMIN FRIGOS (SECRET)
// ==========================================

let frigoPressTimer;
const btnFrigoTab = document.getElementById('tab-btn-frigos');

// On ajoute une sécurité "if (btnFrigoTab)" pour éviter que l'app ne plante
if (btnFrigoTab) {
    btnFrigoTab.addEventListener('mousedown', startFrigoTimer);
    btnFrigoTab.addEventListener('touchstart', startFrigoTimer);
    btnFrigoTab.addEventListener('mouseup', cancelFrigoTimer);
    btnFrigoTab.addEventListener('mouseleave', cancelFrigoTimer);
    btnFrigoTab.addEventListener('touchend', cancelFrigoTimer);
}

function startFrigoTimer() {
    frigoPressTimer = setTimeout(() => {
        ouvrirAdminFrigos();
    }, 5000); 
}

function cancelFrigoTimer() {
    clearTimeout(frigoPressTimer);
}

function ouvrirAdminFrigos() {
    if(navigator.vibrate) navigator.vibrate([50, 50, 50]);
    
    // On remet le sélecteur à zéro ("Sélectionner un frigo...")
    document.getElementById('admin-frigo-select').value = "";
    
    // On remet la bulle de texte à sa taille de base
    const inputName = document.getElementById('new-resident-name');
    inputName.value = "";
    inputName.style.height = "54px";
    
    renderAdminList();
    document.getElementById('admin-frigo-modal').classList.remove('hidden');
}

// Affichage des étiquettes dans le mode Admin
function renderAdminList() {
    const selectVal = document.getElementById('admin-frigo-select').value;
    const container = document.getElementById('admin-resident-list');
    container.innerHTML = "";
    
    // Si aucun frigo n'est sélectionné
    if (!selectVal) {
        container.innerHTML = `<span style="color:var(--text-gray); font-size:13px; font-style:italic; width:100%; text-align:center;">Veuillez d'abord sélectionner un frigo.</span>`;
        return;
    }

    const frigoId = parseInt(selectVal);
    
    if (!frigosData[frigoId-1].residents) frigosData[frigoId-1].residents = [];
    const liste = frigosData[frigoId-1].residents;

    if (liste.length === 0) {
        container.innerHTML = `<span style="color:var(--text-gray); font-size:13px; font-style:italic; width:100%; text-align:center;">Aucun jeune assigné à ce frigo.</span>`;
        return;
    }

    // Création des tags avec un beau design qui gère les noms longs
    liste.forEach((nom, index) => {
        const tag = document.createElement('div');
        // On ajoute 'max-width: 100%' au conteneur du tag
        tag.style.cssText = "background: var(--card-color); border: 1px solid var(--border-color); padding: 8px 12px; border-radius: 20px; font-size: 14px; color: var(--text-dark); display: flex; align-items: center; gap: 8px; font-weight: 600; box-shadow: 0 2px 5px rgba(0,0,0,0.05); max-width: 100%;";

        // On enveloppe le nom dans un span qui gère le retour à la ligne intelligent
        const nameSpan = document.createElement('span');
        nameSpan.style.cssText = "flex: 1; word-break: break-word; overflow-wrap: break-word; hyphens: auto;";
        nameSpan.textContent = nom;

        // La petite croix ne doit pas rétrécir
        const closeSpan = document.createElement('span');
        closeSpan.onclick = () => supprimerResidentAdmin(frigoId, index);
        closeSpan.style.cssText = "cursor: pointer; color: var(--danger); font-weight: 800; font-size: 16px; margin-left: 4px; flex-shrink: 0;";
        closeSpan.textContent = "✕";

        tag.appendChild(nameSpan);
        tag.appendChild(closeSpan);

        container.appendChild(tag);
    });
}

// Ajouter un résident
function ajouterResidentAdmin() {
    const selectVal = document.getElementById('admin-frigo-select').value;
    const input = document.getElementById('new-resident-name');
    const nom = input.value.trim();

    // Sécurité : il faut choisir un frigo
    if (!selectVal) {
        document.getElementById('admin-frigo-select').style.border = "1px solid var(--danger)";
        setTimeout(() => document.getElementById('admin-frigo-select').style.border = "1px solid transparent", 2000);
        if(navigator.vibrate) navigator.vibrate(200);
        return;
    }

    const frigoId = parseInt(selectVal);

    if (nom) {
        if (!frigosData[frigoId-1].residents) frigosData[frigoId-1].residents = [];
        frigosData[frigoId-1].residents.push(nom);
        
        sauvegarderToutesLesDonnees();
        renderAdminList();
        
        // Vider le champ et le remettre à la bonne taille
        input.value = ""; 
        input.style.height = "54px";
        input.focus();
    }
}

// Supprimer un résident
function supprimerResidentAdmin(frigoId, index) {
    frigosData[frigoId-1].residents.splice(index, 1);
    sauvegarderToutesLesDonnees();
    renderAdminList();
}


// --- MISE À JOUR DE L'AFFICHAGE PUBLIC ---

function voirJeunesFrigo(id) {
    document.getElementById('jeunes-frigo-title').innerText = "Frigo " + id + " - Jeunes";
    const container = document.getElementById('liste-jeunes-frigo');
    
    // Sécurité si données anciennes
    if (!frigosData[id-1].residents) frigosData[id-1].residents = [];
    
    const liste = frigosData[id-1].residents;

    if (liste.length === 0) {
        container.innerHTML = "<i style='color: var(--text-gray); display: block; text-align: center;'>Aucun jeune n'est assigné à ce frigo pour le moment.</i>";
    } else {
        // On crée une jolie liste à puces AVEC gestion des noms très longs
        let html = "<ul style='padding-left: 20px; margin: 0; padding-right: 5px;'>";
        liste.forEach(nom => {
            // L'ajout de word-break et overflow-wrap empêche le texte de sortir de la bulle
            html += `<li style="margin-bottom: 8px; word-break: break-word; overflow-wrap: break-word; hyphens: auto; line-height: 1.4;">${nom}</li>`;
        });
        html += "</ul>";
        container.innerHTML = html;
    }
    
    document.getElementById('jeunes-frigo-modal').classList.remove('hidden');
}

// ==========================================
// 21. MENU PRO & ANNUAIRE D'URGENCE
// ==========================================
let easterEggClicks = 0;
let easterEggTimer;

// 1. Le bouton "Menu Pro" redevient un bouton normal
function ouvrirMenuPro() {
    document.getElementById('pro-menu-modal').classList.remove('hidden');
}

// 2. 👑 La nouvelle fonction secrète pour le message de bienvenue
function clicEasterEggAccueil() {
    easterEggClicks++;
    clearTimeout(easterEggTimer);
    
    // Si on arrête de cliquer pendant 2 secondes, ça retombe à zéro
    easterEggTimer = setTimeout(() => { easterEggClicks = 0; }, 2000);

    if (easterEggClicks === 5) {
        afficherBanniereAmour();
        creerPluieDeCoeurs();
        if(navigator.vibrate) navigator.vibrate([100, 50, 100, 50, 200]);
        easterEggClicks = 0;
    }
}

function ouvrirAnnuaire() {
    fermerModals(); // Ferme le menu Pro
    document.getElementById('annuaire-modal').classList.remove('hidden');
}

function retourMenuPro() {
    fermerModals(); // Ferme l'annuaire
    document.getElementById('pro-menu-modal').classList.remove('hidden');
}

// --- LOGIQUE D'APPUI LONG ET ÉDITION ANNUAIRE ---
let contactTimer;
let isContactLongPress = false;
let currentEditRole = "";

function startContactTimer(role) {
    isContactLongPress = false;
    contactTimer = setTimeout(() => {
        isContactLongPress = true; // Empêche l'appel classique de se lancer
        if(navigator.vibrate) navigator.vibrate([50, 50, 50]);
        ouvrirEditContact(role);
    }, 5000); // 5 secondes
}

function cancelContactTimer() {
    clearTimeout(contactTimer);
}

function appelerContact(role) {
    if (isContactLongPress) return; // Si on a fait un appui long, on annule l'appel

    const numero = annuaireData[role];
    if (!numero || numero.trim() === "") {
        alert("⚠️ Aucun numéro n'est enregistré pour ce contact. Restez appuyé 5s pour l'ajouter.");
        return;
    }
    // Lance l'appel téléphonique nativement
    window.location.href = "tel:" + numero;
}

function ouvrirEditContact(role) {
    currentEditRole = role;
    let titre = "";
    if(role === 'tech') titre = "Agent Technique";
    if(role === 'coordF') titre = "Coordinatrice";
    if(role === 'coordM') titre = "Coordinateur";
    if(role === 'chef') titre = "Chef de service";
    if(role === 'astreinte1') titre = "Astreinte N°1";
    if(role === 'astreinte2') titre = "Astreinte N°2";

    // Prépare la fenêtre
    document.getElementById('edit-contact-title').innerText = "Modifier : " + titre;
    document.getElementById('edit-contact-input').value = annuaireData[role] || "";
    
    // Bascule des fenêtres
    document.getElementById('annuaire-modal').classList.add('hidden');
    document.getElementById('edit-contact-modal').classList.remove('hidden');
}

function validerEditContact() {
    const newNum = document.getElementById('edit-contact-input').value.trim();
    
    // Sauvegarde en mémoire et dans le coffre crypté
    annuaireData[currentEditRole] = newNum;
    sauvegarderToutesLesDonnees();
    
    // Retour à l'annuaire
    document.getElementById('edit-contact-modal').classList.add('hidden');
    document.getElementById('annuaire-modal').classList.remove('hidden');
    
    if(navigator.vibrate) navigator.vibrate([100, 50, 100]);
    if(typeof jouerSon === "function") jouerSon("success"); // Fait le petit bruit de validation si la fonction existe !
}

// ==========================================
// 22. DEMANDE D'INTERVENTION (RELIE A L'APP HABITAT)
// ==========================================

const URL_CLOUDFLARE_DI = 'https://relais-habita.imsamsix.workers.dev';

function ouvrirDemandeIntervention() {
    fermerModals(); // Ferme le menu Mon Espace
    
    // On récupère le prénom stocké dans la session
    const proConnecte = localStorage.getItem('coallia_pro_prenom');
    
    // Si on trouve un prénom, on pré-remplit le champ du formulaire
    if (proConnecte) {
        const inputPrenom = document.getElementById('di-prenom');
        if (inputPrenom) inputPrenom.value = proConnecte;
    }
    
    document.getElementById('di-modal').classList.remove('hidden');
}

async function envoyerDI() {
    // 0. LISTE DE TOUS LES CHAMPS OBLIGATOIRES (11 champs au total, étage inclus !)
    const mandatoryFields = [
        'di-nom', 'di-prenom', 'di-tel', 
        'di-bat', 'di-etage', 'di-apt', 
        'di-metier', 'di-desc', 
        'di-ori', 'di-cau', 
        'di-autorisation'
    ];

    // Réinitialiser les styles d'erreur d'un précédent essai
    mandatoryFields.forEach(id => {
        const el = document.getElementById(id);
        if(el) {
            el.style.borderColor = "var(--border-color)";
            el.style.backgroundColor = "var(--input-bg)";
        }
    });

    // 1. On récupère toutes les valeurs
    const payload = {
        "type": "DI",
        "batiment": document.getElementById('di-bat').value.trim(),
        "etage": document.getElementById('di-etage').value.trim(),
        "appartement": document.getElementById('di-apt').value.trim(),
        "chambre": "",
        "jeune": "",
        "sol": "",
        "rangement": "",
        "literie": "",
        "poubelle": "",
        "sol_commune": "",
        "sdb_commune": "",
        "wc_commune": "",
        "details": "",
        "nom": document.getElementById('di-nom').value.trim(),
        "prenom": document.getElementById('di-prenom').value.trim(),
        "tel": document.getElementById('di-tel').value.trim(),
        "metier": document.getElementById('di-metier').value || "",
        "description": document.getElementById('di-desc').value.trim(),
        "autorisation": document.getElementById('di-autorisation').value || "",
        "tel_resident": document.getElementById('di-num-res').value.trim(),
        "origine": document.getElementById('di-ori').value || "",
        "cause": document.getElementById('di-cau').value || "",
        "lieu": "",
        "image": ""
    };

    // 2. LOGIQUE DE VALIDATION GLOBALE
    let hasError = false;
    
    // On vérifie que CHAQUE champ a bien une valeur
    const fieldsToCheck = [
        { id: 'di-nom', value: payload.nom },
        { id: 'di-prenom', value: payload.prenom },
        { id: 'di-tel', value: payload.tel },
        { id: 'di-bat', value: payload.batiment },
        { id: 'di-etage', value: payload.etage }, // <-- L'étage est bien là !
        { id: 'di-apt', value: payload.appartement },
        { id: 'di-metier', value: payload.metier },
        { id: 'di-desc', value: payload.description },
        { id: 'di-ori', value: payload.origine },
        { id: 'di-cau', value: payload.cause },
        { id: 'di-autorisation', value: payload.autorisation }
    ];

    fieldsToCheck.forEach(item => {
        if (!item.value) {
            hasError = true;
            const element = document.getElementById(item.id);
            if(element) {
                // Allume la case en rouge
                element.style.borderColor = "var(--danger)";
                element.style.backgroundColor = "#fff5f5";
            }
        }
    });

    if (hasError) {
        if(navigator.vibrate) navigator.vibrate(200);
        if(typeof jouerSon === "function") jouerSon("error"); 
        
        // On remet les styles normaux après 3 secondes
        setTimeout(() => {
            mandatoryFields.forEach(id => {
                const el = document.getElementById(id);
                if(el) {
                    el.style.borderColor = "var(--border-color)";
                    el.style.backgroundColor = "var(--input-bg)";
                }
            });
        }, 3000);
        return; // On stoppe l'envoi si TOUT n'est pas rempli
    }

    const btn = document.getElementById('btn-envoyer-di');
    const originalText = btn.innerHTML;
    btn.innerHTML = "⏳ Envoi...";
    btn.disabled = true;

    // 3. L'envoi vers ton relais Cloudflare Habitat
    try {
        const response = await fetch(URL_CLOUDFLARE_DI, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'X-Permia-Bypass': 'Permia_Connect_To_Habita_2026!'
            },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            btn.innerHTML = "✅ Envoyé";
            btn.style.backgroundColor = "var(--success)";
            if(navigator.vibrate) navigator.vibrate([100, 50, 100]);
            if(typeof jouerSon === "function") jouerSon("success");
            
            // On ferme et on réinitialise TOTALEMENT le formulaire
            setTimeout(() => {
                purgerAutosave('di');
                document.getElementById('di-modal').classList.add('hidden');
                btn.innerHTML = originalText;
                btn.style.backgroundColor = "var(--coallia-blue)";
                btn.disabled = false;
                
                document.getElementById('di-nom').value = '';
                document.getElementById('di-tel').value = '';
                document.getElementById('di-bat').value = '';
                document.getElementById('di-etage').value = '';
                document.getElementById('di-apt').value = '';
                document.getElementById('di-desc').value = '';
                document.getElementById('di-desc').style.height = '58px'; 
                document.getElementById('di-metier').value = '';
                document.getElementById('di-ori').value = '';
                document.getElementById('di-cau').value = '';
                document.getElementById('di-autorisation').value = '';
                document.getElementById('di-num-res').value = '';
                document.getElementById('di-num-res').classList.add('hidden');
            }, 2000);
        } else {
            throw new Error('Erreur Serveur');
        }
    } catch (error) {
        alert("❌ Impossible d'envoyer (Vérifiez votre connexion).");
        btn.innerHTML = originalText;
        btn.disabled = false;
        if(typeof jouerSon === "function") jouerSon("error");
    }
}

// ==========================================
// 23. COMMANDE SECRÈTE : RESET ÉVALUATIONS FRIGOS (5s)
// ==========================================
let resetFrigoEvalTimer;

function startResetFrigoEvalTimer() {
    resetFrigoEvalTimer = setTimeout(() => {
        purgerEvaluationsFrigos();
    }, 5000); // 5 secondes
}

function stopResetFrigoEvalTimer() {
    clearTimeout(resetFrigoEvalTimer);
}

function purgerEvaluationsFrigos() {
    // 🛡️ GARDE : la remise à zéro est irréversible et se propage au cloud.
    //    Sur un téléphone partagé, un appui long involontaire ne doit jamais
    //    effacer des contrôles sanitaires sans confirmation.
    const nbEvalues = frigosData.filter(f => f.cad || f.hyg || f.cont).length;

    if (nbEvalues === 0) {
        console.log("🤫 Purge demandée mais aucun frigo n'est évalué.");
        return;
    }

    demanderConfirmation(
        "Remettre à zéro les évaluations ?",
        nbEvalues + " frigo(s) évalué(s) repasseront en état inconnu.\n"
        + "Les listes de jeunes rattachés seront conservées.",
        executerPurgeFrigos
    );
}

function executerPurgeFrigos() {
    // On réinitialise uniquement les critères d'évaluation
    // Les listes de résidents (f.residents) restent intactes !
    frigosData.forEach(f => {
        f.cad = null;
        f.hyg = null;
        f.cont = null;
        f.time = null;
        f.pro = null;
    });

    sauvegarderToutesLesDonnees();
    renderFrigos(); // Recharge l'affichage instantanément

    // Effets visuels et sonores de succès
    if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
    if (typeof jouerSon === "function") jouerSon("success");

    // Animation de la bulle pour confirmer
    const badge = document.getElementById('badge-etat-frigos');
    if (badge) {
        const originalText = "📊 État actuel des frigos";
        badge.innerText = "✨ Évaluations purgées !";
        badge.style.background = "var(--success)";
        badge.style.color = "white";

        // Retour à la normale après 3 secondes
        setTimeout(() => {
            badge.innerText = originalText;
            badge.style.background = "var(--card-color)";
            badge.style.color = "var(--text-dark)";
        }, 3000);
    }
    
    console.log("🤫 Nettoyage des évaluations frigos effectué.");
}

// ==========================================
// 24. AUTOSAVE DES FORMULAIRES
// ==========================================

const champsASauvegarder = [
    // Champs des Transmissions
    'trans-type', 'trans-titre', 'trans-desc',
    // Champs des Demandes d'Intervention (DI)
    'di-nom', 'di-prenom', 'di-tel', 'di-bat', 'di-etage', 
    'di-apt', 'di-metier', 'di-desc', 'di-ori', 'di-cau', 'di-autorisation'
];

function initialiserAutosave() {
    champsASauvegarder.forEach(id => {
        const champ = document.getElementById(id);
        if (champ) {
            // 1. Restauration au démarrage si une sauvegarde existe
            const sauvegarde = localStorage.getItem('autosave_' + id);
            if (sauvegarde) {
                champ.value = sauvegarde;
                // Si c'est une zone de texte, on ajuste sa hauteur automatiquement
                if (champ.tagName.toLowerCase() === 'textarea' && typeof autoResize === 'function') {
                    autoResize(champ);
                }
            }

            // 2. Sauvegarde à chaque fois que l'utilisateur tape ou change une valeur
            champ.addEventListener('input', () => {
                localStorage.setItem('autosave_' + id, champ.value);
            });
            champ.addEventListener('change', () => {
                localStorage.setItem('autosave_' + id, champ.value);
            });
        }
    });
}

// Fonction pour vider la mémoire une fois le message envoyé
function purgerAutosave(typeFormulaire) {
    let champsAVider = [];
    if (typeFormulaire === 'trans') {
        champsAVider = ['trans-type', 'trans-titre', 'trans-desc'];
    } else if (typeFormulaire === 'di') {
        champsAVider = ['di-nom', 'di-prenom', 'di-tel', 'di-bat', 'di-etage', 'di-apt', 'di-metier', 'di-desc', 'di-ori', 'di-cau', 'di-autorisation'];
    }

    champsAVider.forEach(id => {
        localStorage.removeItem('autosave_' + id);
    });
}

// 🛡️ SÉCURITÉ RGPD : Efface TOUS les brouillons en clair du localStorage
function purgerToutAutosave() {
    champsASauvegarder.forEach(id => {
        localStorage.removeItem('autosave_' + id);
    });
}

// ==========================================
// 25. GÉNÉRATION DE RAPPORTS PDF
// ==========================================
function telechargerPDF(type, options) {
    // 🤫 Mode silencieux : on génère le PDF sans le télécharger ni toucher au bouton.
    //    Utilisé à la clôture du comptage pour l'envoyer à Power Automate.
    const silencieux = !!(options && options.silencieux);

    const btnId = type === 'comptage' ? 'btn-pdf-comptage' : 'btn-pdf-mat';
    const btn = document.getElementById(btnId);
    const originalText = btn ? btn.innerText : "";
    if (!silencieux && btn) {
        btn.innerText = "⏳ Création du document...";
        btn.disabled = true;
    }

    // 1. Récupération des données formatées
    let contenuHTML = "";
    let titreDoc = "";
    const maintenant = new Date();
    const dateAujourdhui = maintenant.toLocaleDateString('fr-FR');
    const heureAujourdhui = maintenant.toLocaleTimeString('fr-FR', {hour:'2-digit', minute:'2-digit'});

    // 📄 Identité documentaire par type de rapport
        const META_DOC = {
        materiel: { titre: "Bilan du matériel prêté", sous: "État des emprunts en cours" },
        comptage: { titre: "Relevé de présence",      sous: "Comptage réglementaire des résidents" }
    };
    const meta = META_DOC[type] || { titre: "Rapport de permanence", sous: "" };

    // Référence unique : PRM-AAAAMMJJ-HHMM
    const p2 = (n) => String(n).padStart(2, '0');
    const refDoc = `PRM-${maintenant.getFullYear()}${p2(maintenant.getMonth() + 1)}${p2(maintenant.getDate())}`
                 + `-${p2(maintenant.getHours())}${p2(maintenant.getMinutes())}`;
    const auteurDoc = localStorage.getItem('coallia_pro_prenom') || "—";

    if (type === 'materiel') {
            contenuHTML = document.getElementById('recap-content').innerHTML;
            titreDoc = "Bilan_Materiel_" + dateAujourdhui.replace(/\//g, '-');
            
        } else if (type === 'comptage') {
            if (!mecsComptageLogs || mecsComptageLogs.length === 0) return;
            const dernierLog = mecsComptageLogs[mecsComptageLogs.length - 1];
            
            let absentsHTML = "";
            if (!dernierLog.listeAbsents || dernierLog.listeAbsents.length === 0) {
                absentsHTML = `<div style="text-align:center; color:#2e7d32; font-weight:600; font-size:13.5px; padding:15px; background:#e8f5e9; border-radius:10px;">✨ Aucun absent lors de ce contrôle. L'établissement était complet.</div>`;
            } else {
                dernierLog.listeAbsents.forEach(ab => {
                    const estMineur = ab.isMajor === false;
                    const cardBg = estMineur ? "#fff5f5" : "#f8f9fa";
                    const borderLeft = estMineur ? "border-left: 5px solid #d32f2f;" : "border-left: 5px solid #757575;";
                    const alertTag = estMineur ? "<span style='font-size:9px; font-weight:800; color:#d32f2f; background:rgba(211,47,47,0.1); padding:2px 6px; border-radius:5px; margin-left:8px; font-family:sans-serif;'>🚨 MINEUR</span>" : "";

                    // 🎯 FIX STRUCTUREL TABLEAU : Remplace le Flex pour fermer parfaitement les bordures à droite
                    absentsHTML += `
                        <table style="width: 100%; background:${cardBg}; border:1px solid #e0e0e0; ${borderLeft} padding: 12px; border-radius: 10px; margin-bottom: 8px; border-collapse: separate; box-sizing: border-box; font-family:'Helvetica Neue', Arial, sans-serif;">
                            <tr>
                                <td style="text-align: left; vertical-align: middle;">
                                    <span style="color:#111; font-size:13.5px; font-weight:700;">${ab.prenom} ${ab.nom} ${alertTag}</span><br>
                                    <span style="font-size:11px; color:#666; font-weight:700; margin-top:2px; display:inline-block;">🚪 ${ab.chambre}</span>
                                </td>
                                <td style="text-align: right; vertical-align: middle; padding-right: 2px;">
                                    <span style="font-size:11px; background:#ffffff; padding:5px 12px; border-radius:6px; border:1px solid #e0e0e0; color:#d32f2f; font-weight:800; text-transform:uppercase; display:inline-block; white-space:nowrap;">${ab.motif}</span>
                                </td>
                            </tr>
                        </table>
                    `;
                });
            }

            contenuHTML = `
                <div style="border:1px solid #c3d6ee; border-radius:12px; overflow:hidden; margin-bottom:24px;">
                <table style="width:100%; border-collapse:separate; border-spacing:0; font-family:'Helvetica Neue', Arial, sans-serif;">
                    <tr>
                        <td colspan="4" style="padding:7px 14px; background:#0055a4; border-radius:11px 11px 0 0;">
                            <span style="font-size:9px; color:#ffffff; font-weight:800; letter-spacing:1.5px; text-transform:uppercase;">Tournée de contrôle</span>
                        </td>
                    </tr>
                    <tr style="background:#f2f7fd;">
                        <td style="padding:12px 14px; width:24%; border-right:1px solid #d8e4f3; vertical-align:top; border-radius:0 0 0 11px;">
                            <div style="font-size:8.5px; color:#6b7f9c; font-weight:800; letter-spacing:0.8px; text-transform:uppercase; margin-bottom:4px;">Date</div>
                            <div style="font-size:12px; color:#0d1b2f; font-weight:700;">${dernierLog.date}</div>
                        </td>
                        <td style="padding:12px 14px; width:24%; border-right:1px solid #d8e4f3; vertical-align:top;">
                            <div style="font-size:8.5px; color:#6b7f9c; font-weight:800; letter-spacing:0.8px; text-transform:uppercase; margin-bottom:4px;">Créneau</div>
                            <div style="font-size:12px; color:#0d1b2f; font-weight:700;">${dernierLog.heureDebut} — ${dernierLog.heureFin || '--:--'}</div>
                        </td>
                        <td style="padding:12px 14px; width:26%; border-right:1px solid #d8e4f3; vertical-align:top;">
                            <div style="font-size:8.5px; color:#6b7f9c; font-weight:800; letter-spacing:0.8px; text-transform:uppercase; margin-bottom:4px;">Session</div>
                            <div style="font-size:12px; color:#0d1b2f; font-weight:700;">${dernierLog.type}</div>
                        </td>
                        <td style="padding:12px 14px; width:26%; vertical-align:top; border-radius:0 0 11px 0;">
                            <div style="font-size:8.5px; color:#6b7f9c; font-weight:800; letter-spacing:0.8px; text-transform:uppercase; margin-bottom:4px;">Contrôle effectué par</div>
                            <div style="font-size:12px; color:#0d1b2f; font-weight:700;">${dernierLog.professionnel}</div>
                        </td>
                    </tr>
                </table>
                </div>
                
                <div style="border: 1px solid #e0e0e0; background: #ffffff; padding: 18px; border-radius: 12px; margin-bottom: 25px; font-family: 'Helvetica Neue', Arial, sans-serif;">
                    <div style="display:flex; justify-content:space-between; margin-bottom:10px; font-weight:800; font-size:14.5px; border-bottom:1px dashed #e0e0e0; padding-bottom:6px;"><span>Total Jeunes du Foyer :</span><b style="color:#0055a4;">${dernierLog.totalJeunes}</b></div>
                    <div style="display:flex; justify-content:space-between; margin-bottom:5px; font-size:13px; font-weight:600;"><span>🟢 Présents :</span><b style="color:#2e7d32;">${dernierLog.presents}</b></div>
                    <div style="display:flex; justify-content:space-between; margin-bottom:15px; font-size:13px; font-weight:600;"><span>🔴 Absents :</span><b style="color:#d32f2f;">${dernierLog.absents}</b></div>
                    
                    <table style="width:100%; border-collapse:collapse; margin-top:10px;">
                        <tr>
                            <td style="width:50%; padding-right:6px;">
                                <div style="background:#f8f9fa; border:1px solid #e0e0e0; padding:10px; border-radius:8px; text-align:center;">
                                    <div style="font-weight:800; font-size:12px; margin-bottom:3px; color:#222;">👶 MINEURS</div>
                                    <div style="font-size:11.5px; color:#555; font-weight:600;">Présents : <span style="color:#2e7d32; font-weight:700;">${dernierLog.breakdown?.mineurs?.presents || 0}</span> │ Absents : <span style="color:#d32f2f; font-weight:700;">${dernierLog.breakdown?.mineurs?.absents || 0}</span></div>
                                </div>
                            </td>
                            <td style="width:50%; padding-left:6px;">
                                <div style="background:#f8f9fa; border:1px solid #e0e0e0; padding:10px; border-radius:8px; text-align:center;">
                                    <div style="font-weight:800; font-size:12px; margin-bottom:3px; color:#222;">🧑 MAJEURS</div>
                                    <div style="font-size:11.5px; color:#555; font-weight:600;">Présents : <span style="color:#2e7d32; font-weight:700;">${dernierLog.breakdown?.majeurs?.presents || 0}</span> │ Absents : <span style="color:#d32f2f; font-weight:700;">${dernierLog.breakdown?.majeurs?.absents || 0}</span></div>
                                </div>
                            </td>
                        </tr>
                    </table>
                </div>

                <h4 style="text-align: center; font-size: 13.5px; color: #111; border-bottom: 2px solid #0055a4; padding-bottom: 5px; margin-bottom: 12px; text-transform: uppercase; font-weight: 800; letter-spacing:0.3px; font-family:'Helvetica Neue', Arial, sans-serif;">🚨 Détail des signalements d'absence</h4>
                <div style="width:100%;">${absentsHTML}</div>
            `;
            titreDoc = "Appel_Foyer_MECS_" + dateAujourdhui.replace(/\//g, '-');
        }

    // 2. Création de la page A4 (Largeur ajustée à 680px pour éviter la coupure droite)
    const elementTemp = document.createElement('div');
    elementTemp.innerHTML = `
        <div style="padding: 16px 28px 24px 28px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1a1f2b; background: #fff; width: 680px; max-width: 680px; box-sizing: border-box;">

            <!-- EN-TÊTE : logo à gauche, identité de la structure à droite -->
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 14px;">
                <tr>
                    <td style="vertical-align: middle; text-align: left;">
                        <img src="img/logo-coallia.png" style="height: 44px; display: block;">
                    </td>
                    <td style="vertical-align: middle; text-align: right;">
                        <div style="font-size: 12px; font-weight: 800; color: #1a1f2b; letter-spacing: 1.4px; text-transform: uppercase;">Coallia Guillaudot</div>
                        <div style="font-size: 10.5px; color: #7c8699; font-weight: 600; margin-top: 2px;">Espace Permanence</div>
                    </td>
                </tr>
            </table>

            <!-- FILET TRICOLORE -->
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                <tr>
                    <td style="height: 3px; background: #6B3FA0; width: 30%;"></td>
                    <td style="height: 3px; background: #0055a4; width: 44%;"></td>
                    <td style="height: 3px; background: #A8175A; width: 26%;"></td>
                </tr>
            </table>

            <!-- TITRE DU DOCUMENT -->
            <div style="margin-bottom: 16px;">
                <div style="font-size: 9.5px; font-weight: 800; color: #A8175A; letter-spacing: 1.6px; text-transform: uppercase; margin-bottom: 5px;">Document de permanence</div>
                <h1 style="margin: 0; font-size: 23px; font-weight: 800; color: #1a1f2b; letter-spacing: -0.3px;">${meta.titre}</h1>
                ${meta.sous ? `<div style="font-size: 12px; color: #7c8699; margin-top: 4px; font-weight: 500;">${meta.sous}</div>` : ``}
            </div>

            <!-- BANDEAU DE MÉTADONNÉES -->
            <table style="width: 100%; border-collapse: collapse; background: #f5f7fb; border-radius: 8px; margin-bottom: 24px;">
                <tr>
                    <td style="padding: 11px 14px; width: 33.33%; border-right: 1px solid #e3e8f0;">
                        <div style="font-size: 8.5px; color: #8a93a5; font-weight: 800; letter-spacing: 0.8px; text-transform: uppercase; margin-bottom: 3px;">Édité le</div>
                        <div style="font-size: 11.5px; color: #1a1f2b; font-weight: 700;">${dateAujourdhui} à ${heureAujourdhui}</div>
                    </td>
                    <td style="padding: 11px 14px; width: 33.33%; border-right: 1px solid #e3e8f0;">
                        <div style="font-size: 8.5px; color: #8a93a5; font-weight: 800; letter-spacing: 0.8px; text-transform: uppercase; margin-bottom: 3px;">Édité par</div>
                        <div style="font-size: 11.5px; color: #1a1f2b; font-weight: 700;">${auteurDoc}</div>
                    </td>
                    <td style="padding: 11px 14px; width: 33.33%;">
                        <div style="font-size: 8.5px; color: #8a93a5; font-weight: 800; letter-spacing: 0.8px; text-transform: uppercase; margin-bottom: 3px;">Référence</div>
                        <div style="font-size: 11.5px; color: #1a1f2b; font-weight: 700; font-family: 'Courier New', monospace;">${refDoc}</div>
                    </td>
                </tr>
            </table>

            <!-- CORPS DU RAPPORT -->
            <div style="font-size: 13px; width: 100%; line-height: 1.55;">
                ${contenuHTML}
            </div>
        </div>
    `;

    // 3. Configuration du PDF (On laisse 25mm de vide en bas pour le pied de page)
    const opt = {
        margin:       [10, 10, 25, 10], 
        filename:     titreDoc + '.pdf',
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true, logging: false },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    // 4. Génération avec injection du Footer en bas de CHAQUE page !
    const tache = html2pdf().set(opt).from(elementTemp).toPdf().get('pdf').then(function (pdf) {
        const totalPages = pdf.internal.getNumberOfPages();
        
        for (let i = 1; i <= totalPages; i++) {
            pdf.setPage(i);
            pdf.setFontSize(8);
            pdf.setTextColor(150, 150, 150); // Gris clair pro
            
            // Ligne subtile au dessus du footer
            const y = pdf.internal.pageSize.getHeight() - 12; // À 12mm du bord bas
            pdf.setDrawColor(220, 220, 220);
            const largeurPage = pdf.internal.pageSize.getWidth();

            // Filet fin sur toute la largeur utile
            pdf.setDrawColor(224, 228, 236);
            pdf.setLineWidth(0.3);
            pdf.line(15, y - 4, largeurPage - 15, y - 4);

            // Gauche : référence du document
            pdf.setFontSize(7.5);
            pdf.setTextColor(140, 148, 162);
            pdf.text(refDoc, 15, y);

            // Centre : mention de confidentialité
            const mention = "Document interne — Coallia Guillaudot";
            pdf.text(mention, (largeurPage - pdf.getTextWidth(mention)) / 2, y);

            // Droite : pagination
            const pagination = i + " / " + totalPages;
            pdf.text(pagination, largeurPage - 15 - pdf.getTextWidth(pagination), y);
        }
    });

    // 🤫 En mode silencieux : on renvoie le document encodé, sans téléchargement
    if (silencieux) {
        return tache.outputPdf('datauristring');
    }

    return tache.save().then(() => {
        // Succès !
        btn.innerText = "✅ PDF Téléchargé";
        btn.style.backgroundColor = "var(--success)";
        if(navigator.vibrate) navigator.vibrate([100, 50, 100]);
        if(typeof jouerSon === "function") jouerSon("success");
        
        setTimeout(() => {
            btn.innerText = originalText;
            
            // 🎨 Tous les boutons d'export reviennent au bleu Coallia
            btn.style.backgroundColor = "var(--coallia-blue)";
            
            btn.disabled = false;
        }, 3000);
    });
}

// ==========================================
// 26. SKELETON SCREENS (EFFET GOOGLE/YOUTUBE)
// ==========================================
function injecterSkeleton(containerId, type = 'card', count = 3) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    let html = '<div class="skeleton-wrapper">';
    for(let i = 0; i < count; i++) {
        if (type === 'card') {
            // Fausse carte Matériel / Frigo
            html += `
            <div class="skeleton-card">
                <div class="skeleton-block skeleton-title"></div>
                <div class="skeleton-block skeleton-text"></div>
                <div class="skeleton-block skeleton-text short"></div>
            </div>`;
        } else if (type === 'timeline') {
            // Fausse carte Timeline (avec le trait sur le côté)
            html += `
            <div class="skeleton-card" style="border-radius: 18px; margin-left: 15px; padding: 15px;">
                <div class="skeleton-block skeleton-text short" style="margin-bottom: 15px; height: 12px; width: 30%;"></div>
                <div class="skeleton-block skeleton-title" style="width: 70%;"></div>
                <div class="skeleton-block skeleton-text"></div>
            </div>`;
        }
    }
    html += '</div>';
    container.innerHTML = html;
}

// ==========================================
// 27. NETTOYAGE AUTOMATIQUE (ALLÉGER L'APP)
// ==========================================
function purgerDonneesAnciennes() {
    const QUATRE_JOURS_MS = 4 * 24 * 60 * 60 * 1000;
    const now = Date.now();

    // 1. On garde uniquement les transmissions des 4 derniers jours
    const transAvant = transLogs.length;
    transLogs = transLogs.filter(log => log.synced === false || (now - log.timestamp) <= QUATRE_JOURS_MS);

    // 2. On garde les médicaments 4 jours (largement suffisant pour le Doliprane)
    const medAvant = medLogs.length;
    medLogs = medLogs.filter(log => log.synced === false || (now - log.timestamp) <= QUATRE_JOURS_MS);

    // 3. 🛡️ MINIMISATION RGPD : les autres journaux nominatifs suivent la même règle.
    //    ⚠️ Chaque journal a son propre champ de date : timestamp / idLog / timestampDebut.
    //    En l'absence de date exploitable, on CONSERVE l'entrée (jamais de suppression à l'aveugle).
    function dateDuLog(log) {
        return log.timestamp || log.idLog || log.timestampDebut || null;
    }
    function estRecent(log) {
        // 🛡️ On ne purge JAMAIS une entrée qui n'a pas atteint les registres
        //    institutionnels : sinon une panne réseau prolongée la ferait
        //    disparaître définitivement.
        if (log.synced === false) return true;

        const d = dateDuLog(log);
        if (!d) return true; // date inconnue → on garde par sécurité
        return (now - d) <= QUATRE_JOURS_MS;
    }

    const frigoAvant = frigoLogs.length;
    frigoLogs = frigoLogs.filter(estRecent);

    const painAvant = painLogs.length;
    painLogs = painLogs.filter(estRecent);

    const mediaAvant = mediaLogs.length;
    mediaLogs = mediaLogs.filter(estRecent);

    const mecsAvant = mecsComptageLogs.length;
    mecsComptageLogs = mecsComptageLogs.filter(estRecent);

    // Si le nettoyeur a effacé des choses, on met la sauvegarde secrète à jour
    const totalAvant = transAvant + medAvant + frigoAvant + painAvant + mediaAvant + mecsAvant;
    const totalApres = transLogs.length + medLogs.length + frigoLogs.length
                     + painLogs.length + mediaLogs.length + mecsComptageLogs.length;

    if (totalAvant !== totalApres) {
        console.log(`🧹 Nettoyage auto : ${totalAvant - totalApres} entrées purgées (4 jours).`);
        sauvegarderToutesLesDonnees();
    }
}

// --- INTERFACE COMMANDE COMPTAGE ---
function openComptageMenu() {
    document.getElementById('home-menu').classList.add('hidden');
    document.getElementById('comptage-app').classList.remove('hidden');
    
    // 🛡️ SÉCURITÉ : On force l'affichage du menu de configuration et on cache les stats
    document.getElementById('comptage-setup-screen').classList.remove('hidden');
    document.getElementById('comptage-workspace').classList.add('hidden');
    document.getElementById('comptage-report-screen').classList.add('hidden');
    document.getElementById('comptage-last-view').classList.add('hidden');
    
    // On remet le bouton du haut en mode "Accueil" par défaut
    const backBtn = document.getElementById('comptage-back-btn');
    if (backBtn) {
        backBtn.innerText = "← Accueil";
        backBtn.onclick = retourSaisieComptage;
    }
}

function retourSaisieComptage() {
    document.getElementById('comptage-app').classList.add('hidden');
    document.getElementById('home-menu').classList.remove('hidden');
    updateDashboardBadges();
}

// Lancement d'une session de pointage
function lancerComptageMecs() {
    const typeSelect = document.getElementById('comptage-type-select');
    const errorBubble = document.getElementById('comptage-error-bubble');
    const typeComptage = typeSelect.value;

    // 👑 RÉINITIALISATION SYSTÉMATIQUE DES STYLES D'ERREUR
    typeSelect.classList.remove('input-error');
    if (errorBubble) errorBubble.classList.add('hidden');

    // 👑 RECOUVREMENT DE SÉCURITÉ : Interdiction de lancer la tournée à vide
    if (!typeComptage) {
        typeSelect.classList.add('input-error'); // Applique le halo rouge natif de style.css
        
        if (errorBubble) errorBubble.classList.remove('hidden');
        if (navigator.vibrate) navigator.vibrate(35);
        if (typeof jouerSon === "function") jouerSon("error"); // Bip sonore d'erreur

        // Restauration automatique de l'interface après 3 secondes
        setTimeout(() => {
            if (errorBubble) errorBubble.classList.add('hidden');
            typeSelect.classList.remove('input-error');
        }, 3000);
        return; // Bloque l'exécution de la suite du script
    }

    const pro = localStorage.getItem('coallia_pro_prenom') || 'Inconnu';
    const maintenant = new Date();

    // Initialisation du modèle de données de session
    mecsSessionEnCours = {
        date: maintenant.toLocaleDateString('fr-FR'),
        heureDebut: maintenant.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        timestampDebut: maintenant.getTime(),
        professionnel: pro,
        type: typeComptage,
        totalJeunes: mecsJeunesCatalog.length,
        presents: 0,
        absents: 0,
        breakdown: {
            mineurs: { presents: 0, absents: 0 },
            majeurs: { presents: 0, absents: 0 }
        },
        listeAbsents: []
    };

    mecsIndexActuel = 0;
    
    document.getElementById('comptage-setup-screen').classList.add('hidden');
    document.getElementById('comptage-workspace').classList.remove('hidden');

    const backBtn = document.getElementById('comptage-back-btn');
if (backBtn) {
    backBtn.innerText = "← Retour";
    backBtn.onclick = verifierAnnulationComptage;
}
    
    majDashboardComptage();
    genererCarteJeuneMecs();
}

// Mise à jour de l'affichage de progression et des métriques
function majDashboardComptage() {
    const total = mecsSessionEnCours.totalJeunes;
    const verifies = mecsIndexActuel;
    const restants = total - verifies;

    document.getElementById('dash-verifies').innerText = verifies;
    document.getElementById('dash-restants').innerText = restants;
    document.getElementById('dash-presents').innerText = mecsSessionEnCours.presents;
    document.getElementById('dash-absents').innerText = mecsSessionEnCours.absents;

    document.getElementById('dash-min-p').innerText = mecsSessionEnCours.breakdown.mineurs.presents;
    document.getElementById('dash-min-a').innerText = mecsSessionEnCours.breakdown.mineurs.absents;
    document.getElementById('dash-maj-p').innerText = mecsSessionEnCours.breakdown.majeurs.presents;
    document.getElementById('dash-maj-a').innerText = mecsSessionEnCours.breakdown.majeurs.absents;

    document.getElementById('comptage-progression-text').innerText = `Avancement : ${verifies} / ${total}`;
}

// Générateur dynamique HTML de la carte Tinder avec support Drag & Swipe fluide
function genererCarteJeuneMecs() {
    const holder = document.getElementById('comptage-card-holder');
    holder.innerHTML = "";

    if (mecsIndexActuel >= mecsJeunesCatalog.length) {
        afficherRapportFinalMecs();
        return;
    }

    const jeune = mecsJeunesCatalog[mecsIndexActuel];
    const tagStatut = jeune.isMajor ? "🧑 MAJEUR" : "👶 MINEUR";
    const colorStatut = jeune.isMajor ? "var(--coallia-blue)" : "var(--warning)";

    // 👑 EXTRACTION ET SÉPARATION CHIRURGICALE DU TRAJET (Bâtiment │ Appartement │ Chambre)
    const chambreParts = jeune.chambre.split('│');
    const batimentLabel = chambreParts[0] ? chambreParts[0].trim() : '';
    const detailsLabel = chambreParts[1] ? chambreParts[1].trim() : '';

    let aptLabel = '';
    let chLabel = detailsLabel;

    // Si la ligne contient un appartement (Bâtiments C et D), on sépare l'Apt de la Chambre
    if (detailsLabel.includes('-')) {
        const subParts = detailsLabel.split('-');
        aptLabel = subParts[0] ? subParts[0].trim() : '';
        chLabel = subParts[1] ? subParts[1].trim() : '';
    }

    const card = document.createElement('div');
    card.id = "tinder-card-actuelle";
    
    card.style.cssText = "width:100%; background:var(--card-color); border-radius:24px; box-shadow:0 10px 30px rgba(0,0,0,0.06); border:1px solid var(--border-color); padding:25px; text-align:center; display:flex; flex-direction:column; justify-content:center; align-items:center; height:340px; position:absolute; z-index:2; transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.2), opacity 0.2s; touch-action:none;";

    // 👑 CONSTRUCTION DYNAMIQUE DES BULLES (Harmonisation Apple-Style : toutes en gris et écriture sombre)
    let bullesHTML = `
        <div style="background: var(--input-bg); color: var(--text-dark); font-weight: 700; font-size: 12px; padding: 8px 12px; border-radius: 12px; border: 1px solid var(--border-color); white-space: nowrap; display: flex; align-items: center; justify-content: center;">
            ${batimentLabel}
        </div>
    `;

    if (aptLabel) {
        bullesHTML += `
            <div style="background: var(--input-bg); color: var(--text-dark); font-weight: 700; font-size: 12px; padding: 8px 12px; border-radius: 12px; border: 1px solid var(--border-color); white-space: nowrap; display: flex; align-items: center; justify-content: center;">
                🏢 ${aptLabel}
            </div>
        `;
    }

    bullesHTML += `
        <div style="background: var(--input-bg); color: var(--text-dark); font-weight: 700; font-size: 12px; padding: 8px 12px; border-radius: 12px; border: 1px solid var(--border-color); white-space: nowrap; display: flex; align-items: center; justify-content: center;">
            🚪 ${chLabel}
        </div>
    `;

    card.innerHTML = `
        <div style="width:100px; height:100px; border-radius:50%; background:rgba(0,85,164,0.06); border:3px solid var(--coallia-blue); display:flex; align-items:center; justify-content:center; font-size:32px; font-weight:800; color:var(--coallia-blue); margin-bottom:20px; box-shadow:0 4px 10px rgba(0,0,0,0.03);">${jeune.initiales}</div>
        <h2 style="font-size:22px; font-weight:800; margin:0 0 5px 0; color:var(--text-dark);">${jeune.prenom} ${jeune.nom}</h2>
        <p style="margin:0 0 15px 0; font-size:15px; color:var(--text-gray); font-weight:600;">${jeune.age} ans</p>
        <span style="font-size:11px; font-weight:800; padding:6px 14px; border-radius:20px; color:white; background:${colorStatut}; margin-bottom:20px;">${tagStatut}</span>
        
        <!-- 👑 TRIPLE BADGE PARFAITEMENT SÉPARÉ : Même hauteur, même arrondi, même typographie -->
        <div style="display: flex; gap: 6px; justify-content: center; width: 100%; box-sizing: border-box; flex-wrap: nowrap;">
            ${bullesHTML}
        </div>
    `;

    // Gestion du Drag (mouvement de la carte sous le doigt)
    card.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
        // On coupe la transition pendant que le doigt bouge pour coller au mouvement
        card.style.transition = "none";
    }, {passive: true});

    card.addEventListener('touchmove', (e) => {
        const currentX = e.changedTouches[0].screenX;
        const deltaX = currentX - touchStartX;
        const rotation = deltaX * 0.08; // Calcule une rotation légère proportionnelle au mouvement

        // Applique le déplacement et la rotation en temps réel
        card.style.transform = `translateX(${deltaX}px) rotate(${rotation}deg)`;
    }, {passive: true});

    card.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        const diff = touchEndX - touchStartX;
        
        // Rétablit la transition pour l'éjection ou le retour au centre
        card.style.transition = "transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.2), opacity 0.2s";

        if (diff > 80) { 
            // Swipe à Droite -> Présent
            card.classList.add('swipe-right-animation');
            setTimeout(() => enregistrerPresenceMecs(true), 250); 
        } else if (diff < -80) { 
            // Swipe à Gauche -> Absent
            card.classList.add('swipe-left-animation');
            setTimeout(() => enregistrerPresenceMecs(false), 250); 
        } else {
            // Pas assez déplacé -> Retour élastique au centre parfait
            card.style.transform = "translateX(0px) rotate(0deg)";
        }
    }, {passive: true});

    holder.appendChild(card);
}

// Intercepteur pour appliquer l'animation d'éjection lors du clic sur les boutons du bas
function animerEtValiderBouton(isPresent) {
    const card = document.getElementById('tinder-card-actuelle');
    if (card) {
        // Force la transition d'éjection animée
        card.style.transition = "transform 0.35s cubic-bezier(0.215, 0.610, 0.355, 1), opacity 0.2s";
        card.classList.add(isPresent ? 'swipe-right-animation' : 'swipe-left-animation');
    }
    // Laisse le temps à l'animation de se faire avant d'enregistrer la donnée
    setTimeout(() => {
        enregistrerPresenceMecs(isPresent);
    }, 200);
}

// Traitement des données après action Présent / Absent
function enregistrerPresenceMecs(isPresent) {
    const jeune = mecsJeunesCatalog[mecsIndexActuel];

    // 🛡️ GARDE : catalogue vide, session non démarrée ou double-tap en fin de liste
    if (!jeune || !mecsSessionEnCours) {
        console.warn("⚠️ Comptage : aucun jeune à traiter (index " + mecsIndexActuel + ").");
        if (typeof genererCarteJeuneMecs === "function") genererCarteJeuneMecs();
        return;
    }

    if (isPresent) {
        mecsSessionEnCours.presents++;
        if (jeune.isMajor) mecsSessionEnCours.breakdown.majeurs.presents++;
        else mecsSessionEnCours.breakdown.mineurs.presents++;
        
        if (navigator.vibrate) navigator.vibrate(30);
        
        mecsIndexActuel++;
        majDashboardComptage();
        genererCarteJeuneMecs();
    } else {
        // 👑 DECOUPAGE ET EXTRACTION DES DONNÉES DU TRAJET
        const subtitleEl = document.getElementById('absence-modal-subtitle');
        const chambreParts = jeune.chambre.split('│');
        const batimentLabel = chambreParts[0] ? chambreParts[0].trim() : '';
        const detailsLabel = chambreParts[1] ? chambreParts[1].trim() : '';

        let aptLabel = '';
        let chLabel = detailsLabel;

        if (detailsLabel.includes('-')) {
            const subParts = detailsLabel.split('-');
            aptLabel = subParts[0] ? subParts[0].trim() : '';
            chLabel = subParts[1] ? subParts[1].trim() : '';
        }

        // 👑 CORRECTION ESTHÉTIQUE : Construction des mini-badges gris identiques à la carte principale
        let miniBullesHTML = `
            <div style="background: var(--input-bg); color: var(--text-dark); font-weight: 700; font-size: 11px; padding: 6px 10px; border-radius: 8px; border: 1px solid var(--border-color); white-space: nowrap;">
                ${batimentLabel}
            </div>
        `;

        if (aptLabel) {
            miniBullesHTML += `
                <div style="background: var(--input-bg); color: var(--text-dark); font-weight: 700; font-size: 11px; padding: 6px 10px; border-radius: 8px; border: 1px solid var(--border-color); white-space: nowrap;">
                    🏢 ${aptLabel}
                </div>
            `;
        }

        miniBullesHTML += `
            <div style="background: var(--input-bg); color: var(--text-dark); font-weight: 700; font-size: 11px; padding: 6px 10px; border-radius: 8px; border: 1px solid var(--border-color); white-space: nowrap;">
                🚪 ${chLabel}
            </div>
        `;

        // Injection du rendu épuré (Nom en valeur + alignement horizontal des capsules)
        if (subtitleEl) {
            subtitleEl.innerHTML = `
                <div style="font-size: 16px; font-weight: 800; color: var(--text-dark); margin-bottom: 12px; letter-spacing: -0.3px;">
                    ${jeune.prenom} ${jeune.nom}
                </div>
                <div style="display: flex; gap: 5px; justify-content: center; width: 100%; flex-wrap: nowrap; margin-bottom: 5px;">
                    ${miniBullesHTML}
                </div>
            `;
        }
        
        // Affichage des conteneurs de la modale
        document.getElementById('absence-grid-container').classList.remove('hidden'); //
        document.getElementById('absence-autre-container').classList.add('hidden'); //
        document.getElementById('comptage-absence-modal').classList.remove('hidden'); //
    }
}

// Validation du motif d'absence (Zéro confirmation intermédiaire)
function validerMotifAbsenceMecs(motif) {
    const jeune = mecsJeunesCatalog[mecsIndexActuel];
    
    mecsSessionEnCours.absents++;
    if (jeune.isMajor) mecsSessionEnCours.breakdown.majeurs.absents++;
    else mecsSessionEnCours.breakdown.mineurs.absents++;

    mecsSessionEnCours.listeAbsents.push({
        prenom: jeune.prenom,
        nom: jeune.nom,
        chambre: jeune.chambre,
        motif: motif,
        isMajor: jeune.isMajor // 👑 AJOUT CRITIQUE : Sauvegarde le statut pour l'affichage différencié
    });

    if (navigator.vibrate) navigator.vibrate([60, 40]);
    
    document.getElementById('comptage-absence-modal').classList.add('hidden');
    
    mecsIndexActuel++;
    majDashboardComptage();
    genererCarteJeuneMecs();
}

// Écran final : Rendu global du bilan de pointage
function afficherRapportFinalMecs() {
    document.getElementById('comptage-workspace').classList.add('hidden');
    document.getElementById('comptage-report-screen').classList.remove('hidden');

    const maintenant = new Date();
    const heureFin = maintenant.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    const dureeMin = Math.round((maintenant.getTime() - mecsSessionEnCours.timestampDebut) / 60000);

    mecsSessionEnCours.heureFin = heureFin;
    mecsSessionEnCours.duree = dureeMin <= 0 ? "Moins d'une minute" : `${dureeMin} min`;

    // Métadonnées d'en-tête
    document.getElementById('report-meta').innerHTML = `
        Tournée effectuée le <b>${mecsSessionEnCours.date}</b> de <b>${mecsSessionEnCours.heureDebut}</b> à <b>${heureFin}</b><br>
        Par : <b>${securiserTexte(mecsSessionEnCours.professionnel)}</b> · Session : <b>${securiserTexte(mecsSessionEnCours.type)}</b>
    `;

    // Statistiques sous forme de tableau épuré
    // Rendu des statistiques de fin de tournée
    document.getElementById('report-stats-html').innerHTML = `
        <div style="display:flex; justify-content:space-between; margin-bottom:10px; font-weight:700;"><span>Total Jeunes du Foyer :</span><b style="color:var(--text-dark);">${mecsSessionEnCours.totalJeunes}</b></div>
        <div style="display:flex; justify-content:space-between; margin-bottom:5px; font-size:13px;"><span>🟢 Total Présents :</span><b style="color:var(--success);">${mecsSessionEnCours.presents}</b></div>
        <div style="display:flex; justify-content:space-between; margin-bottom:15px; font-size:13px;"><span>🔴 Total Absents :</span><b style="color:var(--danger);">${mecsSessionEnCours.absents}</b></div>
        
        <!-- 👑 NOUVEAU LAYOUT: Bulles verticales de fin de tournée -->
        <div style="border-top:1px solid var(--border-color); padding-top:15px; display:flex; flex-direction:column; gap:10px; width:100%;">
            <div style="background:var(--card-color); border:1px solid var(--border-color); padding:12px; border-radius:14px; text-align:center; display:flex; flex-direction:column; align-items:center; justify-content:center; width:100%;">
                <div style="font-weight:800; font-size:14px; margin-bottom:4px; color:var(--text-dark);">👶 Mineurs</div>
                <div style="font-size:12.5px; color:var(--text-gray); font-weight:600;">
                    Présents : <span style="color:var(--success); font-weight:700;">${mecsSessionEnCours.breakdown.mineurs.presents}</span> │ Absents : <span style="color:var(--danger); font-weight:700;">${mecsSessionEnCours.breakdown.mineurs.absents}</span>
                </div>
            </div>
            <div style="background:var(--card-color); border:1px solid var(--border-color); padding:12px; border-radius:14px; text-align:center; display:flex; flex-direction:column; align-items:center; justify-content:center; width:100%;">
                <div style="font-weight:800; font-size:14px; margin-bottom:4px; color:var(--text-dark);">🧑 Majeurs</div>
                <div style="font-size:12.5px; color:var(--text-gray); font-weight:600;">
                    Présents : <span style="color:var(--success); font-weight:700;">${mecsSessionEnCours.breakdown.majeurs.presents}</span> │ Absents : <span style="color:var(--danger); font-weight:700;">${mecsSessionEnCours.breakdown.majeurs.absents}</span>
                </div>
            </div>
        </div>
    `;

    // Injection de la liste nominative des absents
    const listHolder = document.getElementById('report-absents-list');
    listHolder.innerHTML = "";

    if (mecsSessionEnCours.listeAbsents.length === 0) {
        listHolder.innerHTML = `<div style="text-align:center; color:var(--success); font-weight:600; font-size:13px; padding:10px;">✨ Aucun absent. L'établissement est complet.</div>`;
    } else {
        // 👑 RECTIFICATION : Moteur de rendu identique avec distinction visuelle des mineurs
    mecsSessionEnCours.listeAbsents.forEach(ab => {
        const row = document.createElement('div');
        
        const estMineur = ab.isMajor === false;
        const cardBg = estMineur ? "rgba(255, 59, 48, 0.05)" : "var(--input-bg)";
        const cardBorder = estMineur ? "1px solid rgba(255, 59, 48, 0.15)" : "1px solid transparent";
        const borderLeft = estMineur ? "border-left: 5px solid var(--danger);" : "";
        const alertTag = estMineur ? "<span style='font-size:10px; font-weight:800; color:var(--danger); background:rgba(255,59,48,0.1); padding:2px 7px; border-radius:6px; margin-left:8px; vertical-align:middle; letter-spacing:0.5px;'>🚨 MINEUR</span>" : "";

        row.style.cssText = `background:${cardBg}; border:${cardBorder}; ${borderLeft} padding:12px; border-radius:12px; font-size:13px; display:flex; justify-content:space-between; align-items:center; font-weight:600;`;
        row.innerHTML = `
            <div style="text-align:left;">
                <span style="color:var(--text-dark);">${ab.prenom} ${ab.nom} ${alertTag}</span><br>
                <span style="font-size:11px; color:var(--text-gray); font-weight:700;">🚪 ${ab.chambre}</span>
            </div>
            <div style="font-size:11px; background:var(--card-color); padding:5px 10px; border-radius:8px; border:1px solid var(--border-color); color:var(--danger); font-weight:700;">${ab.motif}</div>
        `;
        listHolder.appendChild(row);
    });
    }
}

// 👑 LOGIQUE DE CLÔTURE : Sauvegarde le rapport de tournée dans le coffre crypté et synchronise le Cloud
async function cloreComptageMecs() {
    if (!mecsSessionEnCours) return;

    // Ajoute la session actuelle à l'historique global
    mecsComptageLogs.push(mecsSessionEnCours);

    // 📄 Génération du relevé PDF, joint au log pour envoi automatique
    try {
        const dataUri = await telechargerPDF('comptage', { silencieux: true });
        const base64 = (dataUri || "").split(',')[1];

        // Garde-fou : au-delà de ~2 Mo, on n'encombre pas le coffre local
        if (base64 && base64.length < 2000000) {
            const d = new Date();
            const p2 = (n) => String(n).padStart(2, '0');
            mecsSessionEnCours.pdfBase64 = base64;
            mecsSessionEnCours.nomFichier =
                "Releve_Presence_" + d.getFullYear() + p2(d.getMonth() + 1) + p2(d.getDate())
                + "_" + p2(d.getHours()) + p2(d.getMinutes()) + ".pdf";
        } else {
            console.warn("📄 PDF trop volumineux, envoi des données seules.");
        }
    } catch (e) {
        console.warn("📄 Génération du PDF impossible, envoi des données seules :", e);
    }

    // Sauvegardes et synchronisation cloud invisible
    sauvegarderToutesLesDonnees();
    synchroniserDonnees();
    
    // Retours haptiques et sonores premium de validation
    if (typeof jouerSon === "function") jouerSon("success");
    if (navigator.vibrate) navigator.vibrate([50, 50]);
    
    // Redirection fluide vers l'écran d'accueil du comptage
    retourSaisieComptage();
}

// --- EXTRACTION ET VISUALISATION DU DERNIER APPEL (PRISE DE SERVICE) ---
function voirDernierComptage() {
    if (!mecsComptageLogs || mecsComptageLogs.length === 0) {
        if (navigator.vibrate) navigator.vibrate(100); // Micro-vibration de signalement
        if (typeof jouerSon === "function") jouerSon("error"); // Bip d'avertissement sonore
        
        document.getElementById('comptage-empty-modal').classList.remove('hidden');
        return;
    }

    const dernierLog = mecsComptageLogs[mecsComptageLogs.length - 1];

    document.getElementById('comptage-setup-screen').classList.add('hidden');
    document.getElementById('comptage-last-view').classList.remove('hidden');

    const backBtn = document.getElementById('comptage-back-btn');
    if (backBtn) {
        backBtn.innerText = "← Retour";
        backBtn.onclick = retourSetupDepuisLast;
    }

    document.getElementById('last-view-meta').innerHTML = `
        Tournée du <b>${dernierLog.date}</b> de <b>${dernierLog.heureDebut}</b> à <b>${dernierLog.heureFin || '--:--'}</b><br>
        Par : <b>${securiserTexte(dernierLog.professionnel)}</b> · Session : <b>${securiserTexte(dernierLog.type)}</b>
    `;

    document.getElementById('last-view-stats-html').innerHTML = `
        <div style="display:flex; justify-content:space-between; margin-bottom:10px; font-weight:700;"><span>Total Jeunes du Foyer :</span><b style="color:var(--text-dark);">${dernierLog.totalJeunes}</b></div>
        <div style="display:flex; justify-content:space-between; margin-bottom:5px; font-size:13px;"><span>🟢 Présents :</span><b style="color:var(--success);">${dernierLog.presents}</b></div>
        <div style="display:flex; justify-content:space-between; margin-bottom:15px; font-size:13px;"><span>🔴 Absents :</span><b style="color:var(--danger);">${dernierLog.absents}</b></div>
        
        <div style="border-top:1px solid var(--border-color); padding-top:15px; display:flex; flex-direction:column; gap:10px; width:100%;">
            <div style="background:var(--card-color); border:1px solid var(--border-color); padding:12px; border-radius:14px; text-align:center; display:flex; flex-direction:column; align-items:center; justify-content:center; width:100%;">
                <div style="font-weight:800; font-size:14px; margin-bottom:4px; color:var(--text-dark);">👶 Mineurs</div>
                <div style="font-size:12.5px; color:var(--text-gray); font-weight:600;">
                    Présents : <span style="color:var(--success); font-weight:700;">${dernierLog.breakdown?.mineurs?.presents || 0}</span> │ Absents : <span style="color:var(--danger); font-weight:700;">${dernierLog.breakdown?.mineurs?.absents || 0}</span>
                </div>
            </div>
            <div style="background:var(--card-color); border:1px solid var(--border-color); padding:12px; border-radius:14px; text-align:center; display:flex; flex-direction:column; align-items:center; justify-content:center; width:100%;">
                <div style="font-weight:800; font-size:14px; margin-bottom:4px; color:var(--text-dark);">🧑 Majeurs</div>
                <div style="font-size:12.5px; color:var(--text-gray); font-weight:600;">
                    Présents : <span style="color:var(--success); font-weight:700;">${dernierLog.breakdown?.majeurs?.presents || 0}</span> │ Absents : <span style="color:var(--danger); font-weight:700;">${dernierLog.breakdown?.majeurs?.absents || 0}</span>
                </div>
            </div>
        </div>
    `;

    const listHolder = document.getElementById('last-view-absents-list');
    listHolder.innerHTML = "";

    if (!dernierLog.listeAbsents || dernierLog.listeAbsents.length === 0) {
        listHolder.innerHTML = `<div style="text-align:center; color:var(--success); font-weight:600; font-size:13px; padding:10px;">✨ Aucun absent lors de ce contrôle. L'établissement était complet.</div>`;
    } else {
        dernierLog.listeAbsents.forEach(ab => {
            const row = document.createElement('div');
            const estMineur = ab.isMajor === false;
            const cardBg = estMineur ? "rgba(255, 59, 48, 0.05)" : "var(--input-bg)";
            const cardBorder = estMineur ? "1px solid rgba(255, 59, 48, 0.15)" : "1px solid transparent";
            const borderLeft = estMineur ? "border-left: 5px solid var(--danger);" : "";
            const alertTag = estMineur ? "<span style='font-size:10px; font-weight:800; color:var(--danger); background:rgba(255,59,48,0.1); padding:2px 7px; border-radius:6px; margin-left:8px; vertical-align:middle; letter-spacing:0.5px;'>🚨 MINEUR</span>" : "";

            row.style.cssText = `background:${cardBg}; border:${cardBorder}; ${borderLeft} padding:12px; border-radius:12px; font-size:13px; display:flex; justify-content:space-between; align-items:center; font-weight:600;`;
            row.innerHTML = `
                <div style="text-align:left;">
                    <span style="color:var(--text-dark);">${ab.prenom} ${ab.nom} ${alertTag}</span><br>
                    <span style="font-size:11px; color:var(--text-gray); font-weight:700;">🚪 ${ab.chambre}</span>
                </div>
                <div style="font-size:11px; background:var(--card-color); padding:5px 10px; border-radius:8px; border:1px solid var(--border-color); color:var(--danger); font-weight:700;">${ab.motif}</div>
            `;
            listHolder.appendChild(row);
        });
    }
}

function retourSetupDepuisLast() {
    document.getElementById('comptage-last-view').classList.add('hidden');
    document.getElementById('comptage-setup-screen').classList.remove('hidden');

    const backBtn = document.getElementById('comptage-back-btn');
    if (backBtn) {
        // 👑 AJUSTEMENT : On remet le libellé officiel de sortie de module
        backBtn.innerText = "← Accueil"; 
        backBtn.onclick = retourSaisieComptage;
    }
}

function verifierAnnulationComptage() {
    const workspaceHidden = document.getElementById('comptage-workspace').classList.contains('hidden');
    if (workspaceHidden) {
        retourSaisieComptage();
    } else {
        if (navigator.vibrate) navigator.vibrate(150);
        if (typeof jouerSon === "function") jouerSon("error");
        document.getElementById('comptage-cancel-modal').classList.remove('hidden');
    }
}

function confirmerAbandonTournee() {
    fermerModals();
    mecsSessionEnCours = null;
    mecsIndexActuel = 0;
    document.getElementById('comptage-workspace').classList.add('hidden');
    document.getElementById('comptage-setup-screen').classList.remove('hidden');
    
    // 👑 LA RECTIFICATION ICI : Le bouton redevient une sortie vers l'accueil général
    const backBtn = document.getElementById('comptage-back-btn');
    if (backBtn) {
        backBtn.innerText = "← Accueil";
        backBtn.onclick = retourSaisieComptage; // Quitte le module comptage
    }
}

// --- LOGIQUE ÉCRAN COMPTAGE : ALTERNATIVE AUTRE MOTIF ---

function ouvrirAbsenceAutreSaisie() {
    document.getElementById('absence-grid-container').classList.add('hidden');
    document.getElementById('absence-autre-container').classList.remove('hidden');
    
    document.getElementById('absence-modal-back-btn').classList.add('hidden');
    
    const textarea = document.getElementById('absence-autre-obs');
    const errorBubble = document.getElementById('absence-error-bubble');
    
    // 👑 RECTIFICATION SÉCURITÉ : Nettoyage des alertes précédentes à l'ouverture
    if (errorBubble) errorBubble.classList.add('hidden');
    if (textarea) {
        textarea.value = "";
        textarea.style.height = "54px";
        textarea.classList.remove('input-error'); // Enlève l'ancien halo rouge
        setTimeout(() => textarea.focus(), 50);
    }
}

function fermerAbsenceAutreSaisie() {
    document.getElementById('absence-autre-container').classList.add('hidden');
    document.getElementById('absence-grid-container').classList.remove('hidden');
    
    // 👑 RECTIFICATION : Réaffiche le bouton de retour supérieur
    document.getElementById('absence-modal-back-btn').classList.remove('hidden');
}

function validerAbsenceAutreMecs() {
    const input = document.getElementById('absence-autre-obs');
    const errorBubble = document.getElementById('absence-error-bubble');
    const raisonPersonnalisee = input ? input.value.trim() : "";
    
    // Réinitialisation préventive
    if (input) input.classList.remove('input-error');
    if (errorBubble) errorBubble.classList.add('hidden');
    
    // 👑 INTERCEPTION DE SÉCURITÉ : Bulle d'erreur, vibreur à 200ms et bip sonore
    if (!raisonPersonnalisee) {
        if (input) input.classList.add('input-error'); // Ajoute le halo rouge natif de style.css
        if (errorBubble) errorBubble.classList.remove('hidden');
        
        if (navigator.vibrate) navigator.vibrate(200); // Vibreur haptique standard de 200ms
        if (typeof jouerSon === "function") jouerSon("error"); // Bruit d'avertissement sonore
        
        // Nettoyage automatique au bout de 3 secondes pour préserver la lisibilité
        setTimeout(() => {
            if (errorBubble) errorBubble.classList.add('hidden');
            if (input) input.classList.remove('input-error');
        }, 3000);
        return;
    }
    
    // Transmet la saisie texte directement au moteur de log global[cite: 2]
    validerMotifAbsenceMecs(raisonPersonnalisee);
}

// 👑 LOGIQUE DE SECOURS : Ferme la modale et ré-ancre la carte Tinder au centre parfait
function annulerAbsenceMecs() {
    fermerModals();
    genererCarteJeuneMecs(); // Réinitialise et replace la carte du jeune en cours
}

// ==========================================================================
// 🎮 GESTIONNAIRE DES PRÊTS MULTIMÉDIA (XBOX & TV) AVEC SIGNATURE TACTILE
// ==========================================================================

let activeMediaKey = null; 
let isDrawing = false;
let sigCanvas = null;
let sigCtx = null;

function openMediaApp() {
    document.getElementById('home-menu').classList.add('hidden');
    document.getElementById('media-app').classList.remove('hidden');
    renderMediaItems();
}

function renderMediaItems() {
    const container = document.getElementById('media-list');
    if (!container) return;
    container.innerHTML = "";

    for (let key in mediaData) {
        const item = mediaData[key];
        const isAvail = item.status === 'available';
        const statusColor = isAvail ? 'var(--success)' : 'var(--warning)';
        
        const actionButtonHTML = isAvail
            ? `<button class="media-btn media-btn-preter" onclick="ouvrirModalPretMedia('${key}')">Prêter</button>`
            : `<button class="media-btn media-btn-retour" onclick="validerRetourMedia('${key}')">Confirmer le retour</button>`;

        const footerHTML = isAvail
            ? `<div class="media-pied">
                   <span class="media-pied-lbl">Dernier emprunt</span>
                   <span class="media-pied-val">${securiserTexte(item.lastJeune)} · ${item.lastTime}</span>
               </div>`
            : `<div class="media-pied media-pied-actif">
                   <div class="media-pied-ligne">
                       <span class="media-pied-lbl">Emprunteur</span>
                       <span class="media-pied-val">${securiserTexte(item.jeune)}</span>
                   </div>
                   <div class="media-pied-ligne">
                       <span class="media-pied-lbl">Remis par</span>
                       <span class="media-pied-val">${securiserTexte(item.pro)}</span>
                   </div>
                   <div class="media-signature">
                       <span class="media-pied-lbl">Signature</span>
                       <img src="${item.signature}" alt="Signature de l'emprunteur">
                   </div>
               </div>`;

        let card = document.createElement('div');
        card.className = "item-card media-carte" + (isAvail ? "" : " media-carte-prete");
        card.innerHTML = `
            <div class="media-corps">
                <div class="media-entete">
                    <h3 class="media-nom">${item.name}</h3>
                    <span class="media-etat">
                        <span class="media-point"></span>${isAvail ? "Disponible" : "En prêt"}
                    </span>
                </div>
                ${actionButtonHTML}
            </div>
            ${footerHTML}
        `;
        container.appendChild(card);
    }
}

function ouvrirModalPretMedia(key) {
    activeMediaKey = key;
    document.getElementById('media-modal-desc').innerText = `Prêt de : ${mediaData[key].name}`;
    
    // Réinitialisation des styles d'erreur à l'ouverture
    document.getElementById('media-jeune-name').value = "";
    document.getElementById('media-jeune-name').classList.remove('input-error');
    
    const sigContainer = document.getElementById('media-signature-container');
    if (sigContainer) sigContainer.classList.remove('input-error'); // 👑 Nettoyage du halo signature
    
    document.getElementById('media-error-bubble').classList.add('hidden');
    document.getElementById('media-modal').classList.remove('hidden');
    
    initSignatureCanvas();
}

function initSignatureCanvas() {
    sigCanvas = document.getElementById('signature-pad');
    if (!sigCanvas) return;
    sigCtx = sigCanvas.getContext('2d');
    
    // 🖋️ À L'ÉCRAN : le tracé suit le thème (confort visuel).
    //    À L'ENREGISTREMENT : il sera recoloré en sombre sur blanc (voir la capture).
    const isDark = document.body.classList.contains('dark-mode');
    sigCtx.strokeStyle = isDark ? "#ffffff" : "#1c1c1e";

    // Zone de signature clairement délimitée dans les deux thèmes
    sigCanvas.style.backgroundColor = isDark ? "#1c1c1e" : "#fbfbfd";
    sigCanvas.style.border = isDark ? "2px dashed #48484a" : "2px dashed #c7c7cc";
    sigCanvas.style.borderRadius = "12px";

    sigCtx.lineWidth = 3;
    sigCtx.lineCap = "round";
    sigCtx.lineJoin = "round";
    
    clearSignatureCanvas();

    // Événements tactiles Android
    sigCanvas.addEventListener('touchstart', (e) => {
        isDrawing = true;
        const pos = getCanvasTouchPos(e);
        sigCtx.beginPath();
        sigCtx.moveTo(pos.x, pos.y);
    }, { passive: false });

    sigCanvas.addEventListener('touchmove', (e) => {
        if (!isDrawing) return;
        e.preventDefault(); 
        const pos = getCanvasTouchPos(e);
        sigCtx.lineTo(pos.x, pos.y);
        sigCtx.stroke();
    }, { passive: false });

    window.addEventListener('touchend', () => { isDrawing = false; });
    
    // Événements souris (PC)
    sigCanvas.addEventListener('mousedown', (e) => {
        isDrawing = true;
        sigCtx.beginPath();
        sigCtx.moveTo(e.offsetX, e.clientY - sigCanvas.getBoundingClientRect().top);
    });
    sigCanvas.addEventListener('mousemove', (e) => {
        if (!isDrawing) return;
        sigCtx.lineTo(e.offsetX, e.clientY - sigCanvas.getBoundingClientRect().top);
        sigCtx.stroke();
    });
    window.addEventListener('mouseup', () => { isDrawing = false; });
}

function getCanvasTouchPos(touchEvent) {
    const rect = sigCanvas.getBoundingClientRect();
    return {
        x: touchEvent.touches[0].clientX - rect.left,
        y: touchEvent.touches[0].clientY - rect.top
    };
}

function clearSignatureCanvas() {
    if (!sigCanvas || !sigCtx) return;
    // 👑 CONFIGURATION ALPHA : On utilise clearRect pour effacer de manière transparente, laissant le fond gris CSS s'afficher naturellement
    sigCtx.clearRect(0, 0, sigCanvas.width, sigCanvas.height);
}

// Vérification de la présence d'un dessin sur le pad
function isCanvasBlank() {
    // Vérification de la couche transparente pour valider la présence d'une signature
    const blank = document.createElement('canvas');
    blank.width = sigCanvas.width;
    blank.height = sigCanvas.height;
    return sigCanvas.toDataURL() === blank.toDataURL();
}

function validerPretMedia() {
    const inputNom = document.getElementById('media-jeune-name');
    const sigContainer = document.getElementById('media-signature-container');
    const errorBubble = document.getElementById('media-error-bubble');
    const nom = inputNom.value.trim();
    const pro = localStorage.getItem('coallia_pro_prenom') || 'Inconnu';

    // Réinitialisation des états d'erreur
    if (inputNom) inputNom.classList.remove('input-error');
    if (sigContainer) sigContainer.classList.remove('input-error');
    if (errorBubble) errorBubble.classList.add('hidden');

    // 👑 INTERCEPTION UNIFIÉE : Halo rouge sur le nom et/ou sur le pavé tactile de signature
    if (!nom || isCanvasBlank()) {
        if (!nom) inputNom.classList.add('input-error');
        if (isCanvasBlank() && sigContainer) sigContainer.classList.add('input-error'); // 👑 Allume la signature en rouge
        
        if (errorBubble) errorBubble.classList.remove('hidden');
        if (navigator.vibrate) navigator.vibrate(200);
        if (typeof jouerSon === "function") jouerSon("error");
        return;
    }

    const now = new Date();

    // 💾 Enregistrement exclusif dans le module Multimédia
    let item = mediaData[activeMediaKey];
    item.status = "borrowed";
    item.jeune = nom;
    item.pro = pro;
    item.time = now.getTime();
    // 🖋️ NORMALISATION DE LA PIÈCE JUSTIFICATIVE
    //    Le tracé peut être blanc (mode sombre) ou noir (mode clair) à l'écran.
    //    On le recolore systématiquement en sombre sur fond blanc, pour que la
    //    signature archivée soit lisible partout : app, PDF, Excel, impression.
    const canvasAplati = document.createElement('canvas');
    canvasAplati.width = sigCanvas.width;
    canvasAplati.height = sigCanvas.height;
    const ctxAplati = canvasAplati.getContext('2d');

    // 1. On copie le tracé (seuls les pixels dessinés sont opaques)
    ctxAplati.drawImage(sigCanvas, 0, 0);

    // 2. On repeint tous les pixels du tracé en sombre, sans toucher au vide
    ctxAplati.globalCompositeOperation = 'source-in';
    ctxAplati.fillStyle = '#1c1c1e';
    ctxAplati.fillRect(0, 0, canvasAplati.width, canvasAplati.height);

    // 3. On glisse un fond blanc DERRIÈRE le tracé
    ctxAplati.globalCompositeOperation = 'destination-over';
    ctxAplati.fillStyle = '#FFFFFF';
    ctxAplati.fillRect(0, 0, canvasAplati.width, canvasAplati.height);

    item.signature = canvasAplati.toDataURL('image/jpeg', 0.7);

    // 👑 Génération de la ligne historique pour Excel
    mediaLogs.push({
        idLog: Date.now(),
        type_action: "EMPRUNT",
        equipement: item.name,
        jeune: nom,
        professionnel: pro,
        date: now.toLocaleDateString('fr-FR'),
        heure: now.toLocaleTimeString('fr-FR', {hour:'2-digit', minute:'2-digit'}),
        synced: false
    });

    sauvegarderToutesLesDonnees();
    if (typeof synchroniserDonnees === "function") synchroniserDonnees();

    fermerModals();
    renderMediaItems();

    if (navigator.vibrate) navigator.vibrate([50, 50]);
    if (typeof jouerSon === "function") jouerSon("success");
}

function validerRetourMedia(key) {
    let item = mediaData[key];
    const now = new Date();
    const formatTime = now.toLocaleDateString('fr-FR') + " à " + now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

    // Mutation des logs historiques sur la carte
    item.lastJeune = item.jeune;
    item.lastTime = formatTime;
    
    // 👑 RECOUVREMENT DE SÉCURITÉ : On stocke temporairement le nom avant de nettoyer l'objet
    const nomEmprunteur = item.jeune;

    // Libération de l'objet
    item.status = "available";
    item.jeune = "";
    item.pro = "";
    item.time = null;
    item.signature = "";

    // 👑 Génération de la ligne historique pour Excel (CORRIGÉ)
    mediaLogs.push({
        idLog: Date.now(),
        type_action: "RETOUR",
        equipement: item.name,
        jeune: nomEmprunteur, // 🎯 Utilise la variable temporaire pour ne pas envoyer du vide !
        professionnel: localStorage.getItem('coallia_pro_prenom') || 'Inconnu',
        date: now.toLocaleDateString('fr-FR'),
        heure: now.toLocaleTimeString('fr-FR', {hour:'2-digit', minute:'2-digit'}),
        synced: false
    });

    sauvegarderToutesLesDonnees();
    if (typeof synchroniserDonnees === "function") synchroniserDonnees();

    renderMediaItems();

    if (navigator.vibrate) navigator.vibrate([50, 50]);
    if (typeof jouerSon === "function") jouerSon("success");
}

// ==========================================
// 🔍 ÉCRAN 404 — page ou vue introuvable
// ==========================================
function afficherPage404() {
    document.querySelectorAll('.view').forEach(v => v.classList.add('hidden'));
    document.getElementById('notfound-app').classList.remove('hidden');
}

function retourAccueilDepuis404() {
    document.getElementById('notfound-app').classList.add('hidden');
    if (getCleMaitresse()) {
        openMenu();
    } else {
        document.getElementById('login-screen').classList.remove('hidden');
    }
}

// ==========================================
// ⚠️ CONFIRMATION IN-APP
//    confirm() natif est bloqué par iOS hors geste utilisateur direct
//    (ex. appel depuis un setTimeout) : on passe par une modale maison.
// ==========================================
let actionAConfirmer = null;

function demanderConfirmation(titre, texte, callback) {
    actionAConfirmer = callback;
    document.getElementById('confirm-titre').innerText = titre;
    document.getElementById('confirm-texte').innerText = texte;
    document.getElementById('confirm-modal').classList.remove('hidden');
    if (navigator.vibrate) navigator.vibrate([60, 40, 60]);
}

function annulerConfirmation() {
    actionAConfirmer = null;
    document.getElementById('confirm-modal').classList.add('hidden');
    console.log("🛡️ Action annulée par le professionnel.");
}

function validerConfirmation() {
    document.getElementById('confirm-modal').classList.add('hidden');
    const action = actionAConfirmer;
    actionAConfirmer = null;
    if (typeof action === "function") action();
}

// ==========================================
// 📤 COMPTEUR D'ÉLÉMENTS EN ATTENTE
//    Rend visible ce qui n'a pas encore atteint les registres institutionnels.
// ==========================================
function compterEnAttente() {
    const journaux = [medLogs, transLogs, frigoLogs, painLogs, mediaLogs, mecsComptageLogs];
    let total = 0;
    journaux.forEach(j => {
        if (Array.isArray(j)) total += j.filter(l => l && l.synced === false).length;
    });
    return total;
}

function rafraichirBadgeAttente() {
    const badge = document.getElementById('pending-badge');
    const texte = document.getElementById('pending-texte');
    if (!badge || !texte) return;

    // Masqué si personne n'est connecté
    if (!getCleMaitresse()) { badge.classList.add('hidden'); return; }

    const n = compterEnAttente();
    if (n === 0) { badge.classList.add('hidden'); return; }

    texte.innerText = n === 1 ? "1 saisie en attente d'envoi" : n + " saisies en attente d'envoi";
    badge.classList.toggle('alerte', n >= 20);
    badge.classList.remove('hidden');
}