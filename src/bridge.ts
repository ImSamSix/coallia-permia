/**
 * Pont vers le scope global : index.html conserve ses centaines d'attributs
 * `onclick="fonction()"` existants (ainsi que le HTML généré dynamiquement
 * par certains modules — cartes frigos/multimédia/panier). Plutôt que de
 * réécrire chaque attribut pour importer explicitement son module (risque
 * élevé d'en oublier un sur une base aussi large), chaque fonction encore
 * appelée depuis une chaîne HTML est exposée ici une seule fois, au
 * démarrage. Toute la LOGIQUE reste dans des modules ES normaux ; ce fichier
 * ne fait qu'assigner les références sur `window`.
 */
import { validerConnexionSecurisee, togglePasswordVisibility } from "@/features/auth/login";
import { ouvrirCGU, fermerCGU } from "@/features/cgu/cgu";
import { openMenu, ouvrirMenuPro, retourAccueilDepuis404 } from "@/features/navigation/navigation";
import { ouvrirLogout, confirmerDeconnexion } from "@/features/session/session";
import { toggleThemeAnimated } from "@/features/theme/theme";
import {
  openMateriel,
  switchTab,
  toggleModePanier,
  toggleModePanierRetour,
  ouvrirModalPanier,
  changeModalQty,
  validerAction,
  renderItems,
  updatePanierGeneric
} from "@/features/materiel/materiel";
import { ouvrirScanner, basculerTorche } from "@/features/materiel/scanner";
import { genererRecap } from "@/features/materiel/recap";
import { openMedicaments, checkMedAutre, checkMotifAutre, effacerMedAutre, effacerMotifAutre, validerMedicament, startResetTimer, stopResetTimer } from "@/features/medicaments/medicaments";
import {
  voirJeunesFrigo,
  ouvrirEvalFrigo,
  selectEval,
  validerEvalFrigo,
  effacerObsFrigo,
  renderAdminList,
  ajouterResidentAdmin,
  startResetFrigoEvalTimer,
  stopResetFrigoEvalTimer
} from "@/features/frigos/frigos";
import { declencherCamera, reprendrePhotoSig, effacerPhotoSig, effacerDescSig, envoyerSignalement } from "@/features/frigos/signalement";
import { ouvrirPainModal, validerPain, startPainInterval, stopPainInterval, effacerObsPain } from "@/features/pain/pain";
import {
  openComptageMenu,
  lancerComptageMecs,
  animerEtValiderBouton,
  cloreComptageMecs,
  voirDernierComptage,
  verifierAnnulationComptage,
  confirmerAbandonTournee,
  ouvrirAbsenceAutreSaisie,
  fermerAbsenceAutreSaisie,
  validerAbsenceAutreMecs,
  annulerAbsenceMecs,
  validerMotifAbsenceMecs
} from "@/features/comptage-mecs/comptage-mecs";
import { openMediaApp, ouvrirModalPretMedia, validerRetourMedia, clearSignatureCanvas, validerPretMedia } from "@/features/media/media";
import { ouvrirAnnuaire, retourMenuPro, startContactTimer, cancelContactTimer, appelerContact, validerEditContact } from "@/features/annuaire/annuaire";
import { telechargerPDF } from "@/features/pdf/pdf";
import { autoResize } from "@/ui/dom-utils";
import { annulerConfirmation, validerConfirmation } from "@/ui/confirm-modal";
import { fermerModals } from "@/ui/modals";
import { clicEasterEggAccueil } from "@/ui/easter-egg";

export function installGlobalBridge(): void {
  Object.assign(window, {
    // auth
    validerConnexionSecurisee,
    togglePasswordVisibility,
    // cgu
    ouvrirCGU,
    fermerCGU,
    // navigation
    openMenu,
    ouvrirMenuPro,
    retourAccueilDepuis404,
    // session
    ouvrirLogout,
    confirmerDeconnexion,
    // theme
    toggleThemeAnimated,
    // materiel
    openMateriel,
    switchTab,
    toggleModePanier,
    toggleModePanierRetour,
    ouvrirModalPanier,
    changeModalQty,
    validerAction,
    renderItems,
    updatePanierGeneric,
    ouvrirScanner,
    basculerTorche,
    genererRecap,
    // medicaments
    openMedicaments,
    checkMedAutre,
    checkMotifAutre,
    effacerMedAutre,
    effacerMotifAutre,
    validerMedicament,
    startResetTimer,
    stopResetTimer,
    // frigos
    voirJeunesFrigo,
    ouvrirEvalFrigo,
    selectEval,
    validerEvalFrigo,
    effacerObsFrigo,
    renderAdminList,
    ajouterResidentAdmin,
    startResetFrigoEvalTimer,
    stopResetFrigoEvalTimer,
    declencherCamera,
    reprendrePhotoSig,
    effacerPhotoSig,
    effacerDescSig,
    envoyerSignalement,
    // pain
    ouvrirPainModal,
    validerPain,
    startPainInterval,
    stopPainInterval,
    effacerObsPain,
    // comptage MECS
    openComptageMenu,
    lancerComptageMecs,
    animerEtValiderBouton,
    cloreComptageMecs,
    voirDernierComptage,
    verifierAnnulationComptage,
    confirmerAbandonTournee,
    ouvrirAbsenceAutreSaisie,
    fermerAbsenceAutreSaisie,
    validerAbsenceAutreMecs,
    annulerAbsenceMecs,
    validerMotifAbsenceMecs,
    // media
    openMediaApp,
    ouvrirModalPretMedia,
    validerRetourMedia,
    clearSignatureCanvas,
    validerPretMedia,
    // annuaire
    ouvrirAnnuaire,
    retourMenuPro,
    startContactTimer,
    cancelContactTimer,
    appelerContact,
    validerEditContact,
    // pdf
    telechargerPDF,
    // ui partagé
    autoResize,
    annulerConfirmation,
    validerConfirmation,
    fermerModals,
    clicEasterEggAccueil
  });
}
