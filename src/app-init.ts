/**
 * Câblage DOM de l'application, exécuté une seule fois au démarrage.
 *
 * Ce fichier est volontairement le seul point du projet à importer depuis
 * (quasiment) tous les modules de fonctionnalités : chaque module expose ses
 * propres `initXxxListeners()` pour ses écrans (appuis longs, effets
 * tactiles, formulaires), et les quelques bindings simples qui ne peuvent
 * pas vivre dans un module sans créer un import circulaire (ex. les 4
 * boutons du menu d'accueil, qui ouvrent des écrans dont certains importent
 * déjà `navigation.ts`) sont câblés ici directement.
 *
 * Remplace l'ancien pont `window.*` : plus aucune fonction n'est exposée
 * globalement, tout passe par de vrais `addEventListener`.
 */
import { initCguListeners } from "@/features/cgu/cgu";
import { initLoginListeners } from "@/features/auth/login";
import { initNavigationListeners } from "@/features/navigation/navigation";
import { initSessionListeners } from "@/features/session/session";
import { initMaterielListeners } from "@/features/materiel/materiel";
import { initMedicamentsListeners } from "@/features/medicaments/medicaments";
import { initFrigoModalListeners } from "@/features/frigos/frigos";
import { initSignalementCamera, initSignalementListeners } from "@/features/frigos/signalement";
import { initPainListeners } from "@/features/pain/pain";
import { initComptageListeners } from "@/features/comptage-mecs/comptage-mecs";
import { initMediaListeners } from "@/features/media/media";
import { initAnnuaireListeners } from "@/features/annuaire/annuaire";
import { initPlanFoyerListeners } from "@/features/plan-foyer/plan-foyer";
import { initFermetureModals } from "@/ui/modals";
import { initAutoResizeListeners } from "@/ui/dom-utils";
import { initConfirmModalListeners } from "@/ui/confirm-modal";

import { openMateriel } from "@/features/materiel/materiel";
import { openMedicaments } from "@/features/medicaments/medicaments";
import { openComptageMenu } from "@/features/comptage-mecs/comptage-mecs";
import { openMediaApp } from "@/features/media/media";

/** Menu d'accueil : câblé ici, pas dans navigation.ts, pour éviter un import circulaire
 *  (medicaments.ts et comptage-mecs.ts importent déjà navigation.ts). */
function initHomeMenuListeners(): void {
  document.getElementById("hub-materiel")?.addEventListener("click", openMateriel);
  document.getElementById("hub-medicaments")?.addEventListener("click", openMedicaments);
  document.getElementById("hub-comptage")?.addEventListener("click", openComptageMenu);
  document.getElementById("hub-media")?.addEventListener("click", openMediaApp);
}

export function initApp(): void {
  initFermetureModals();
  initAutoResizeListeners();
  initConfirmModalListeners();

  initCguListeners();
  initLoginListeners();
  initNavigationListeners();
  initSessionListeners();
  initHomeMenuListeners();

  initMaterielListeners();
  initMedicamentsListeners();
  initFrigoModalListeners();
  initSignalementCamera();
  initSignalementListeners();
  initPainListeners();
  initComptageListeners();
  initMediaListeners();
  initAnnuaireListeners();
  initPlanFoyerListeners();
}
