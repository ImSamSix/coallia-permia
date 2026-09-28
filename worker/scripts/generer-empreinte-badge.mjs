#!/usr/bin/env node
/**
 * Génère l'empreinte du badge attendu par le Worker, à partir du code de
 * service tapé au clavier (masqué, jamais affiché ni écrit sur le disque),
 * puis l'enregistre comme secret Cloudflare EMPREINTE_BADGE.
 *
 *   node scripts/generer-empreinte-badge.mjs            (depuis le dossier worker)
 *   node scripts/generer-empreinte-badge.mjs --afficher (affiche seulement l'empreinte)
 *
 * wrangler est lancé par le script lui-même APRÈS la saisie : lancés en
 * parallèle via un "|", les deux programmes se disputaient le terminal.
 *
 * À relancer à chaque changement de code de service. Le calcul DOIT rester
 * identique à src/services/crypto.ts (derriverCleVault + deriverCleAuth) :
 *   cleVault  = PBKDF2-SHA256(code, "Permia_Vault_2026_Coallia", 120 000 it., 32 octets)
 *   badge     = SHA-256("Permia_Badge_v2|" + cleVault)
 *   empreinte = SHA-256(badge)   ← seule valeur confiée à Cloudflare
 */
import { spawn } from "node:child_process";
import { createHash, pbkdf2Sync } from "node:crypto";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const sha256 = (texte) => createHash("sha256").update(texte, "utf8").digest("hex");

function lireCodeMasque(question) {
  return new Promise((resolve, reject) => {
    const entree = process.stdin;
    if (!entree.isTTY) {
      reject(new Error("Lancez ce script dans un terminal interactif (le code est saisi au clavier)."));
      return;
    }
    process.stderr.write(question);
    entree.setRawMode(true);
    entree.resume();
    entree.setEncoding("utf8");
    let code = "";
    const surTouche = (touches) => {
      for (const c of touches) {
        if (c === "\r" || c === "\n") {
          entree.setRawMode(false);
          entree.pause();
          entree.off("data", surTouche);
          process.stderr.write("\n");
          resolve(code);
          return;
        }
        if (c === "\u0003") {
          process.stderr.write("\n");
          process.exit(130);
        }
        if (c === "\u007f" || c === "\b") code = code.slice(0, -1);
        else code += c;
      }
    };
    entree.on("data", surTouche);
  });
}

const code = await lireCodeMasque("Code de service Permia : ");
if (!code) {
  process.stderr.write("Code vide, rien n'a été généré.\n");
  process.exit(1);
}
const confirmation = await lireCodeMasque("Confirmez le code : ");
if (confirmation !== code) {
  process.stderr.write("Les deux saisies diffèrent, rien n'a été généré.\n");
  process.exit(1);
}
if (code.length < 12) {
  process.stderr.write("⚠️  Code de moins de 12 caractères : pensez à un code plus long pour résister aux attaques.\n");
}

const cleVault = pbkdf2Sync(code, "Permia_Vault_2026_Coallia", 120000, 32, "sha256").toString("hex");
const badge = sha256("Permia_Badge_v2|" + cleVault);
const empreinte = sha256(badge);

if (process.argv.includes("--afficher")) {
  process.stdout.write(empreinte + "\n");
  process.exit(0);
}

process.stderr.write("Envoi de l'empreinte à Cloudflare (secret EMPREINTE_BADGE)...\n");
const dossierWorker = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const wrangler = spawn("npx", ["wrangler", "secret", "put", "EMPREINTE_BADGE"], {
  cwd: dossierWorker,
  stdio: ["pipe", "inherit", "inherit"]
});
wrangler.stdin.end(empreinte);
wrangler.on("close", (codeSortie) => {
  process.stderr.write(codeSortie === 0 ? "✅ Empreinte enregistrée.\n" : "❌ Échec de l'envoi (code " + codeSortie + ").\n");
  process.exit(codeSortie ?? 1);
});
