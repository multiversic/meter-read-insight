# SOCADEL Vision Hub

Prompt à envoyer à Lovable — Frontend "SOCADEL Vision" (Contrôle des compteurs & Facturation IA)
Copie-colle tout le bloc ci-dessous dans Lovable.
CONTEXTE DU PROJET
Je veux que tu génères uniquement le FRONTEND (React + TypeScript + Tailwind, avec shadcn/ui) d'une application web professionnelle destinée à la SOCADEL (Société Camerounaise d'Électricité, ex-ENEO Cameroun). L'application permet à un Expert SOCADEL de contrôler automatiquement des photos de compteurs électriques prises par des agents releveurs, de valider manuellement les cas incertains, d'extraire les index de consommation par IA, d'évaluer la performance des agents, et de déclencher la facturation des abonnés.
IMPORTANT — Ne code PAS de backend. N'implémente aucune logique métier côté serveur, aucune base de données, aucun modèle IA. Construis uniquement l'interface, avec une couche de services (fichiers services/*.ts utilisant fetch/axios) qui appelle des endpoints REST que je te fournis ci-dessous (base URL dans une variable d'environnement VITE_API_BASE_URL). Utilise des données mockées réalistes en attendant la connexion réelle, mais structure le code pour qu'il suffise de brancher l'API plus tard (pas de données codées en dur dans les composants UI, tout doit transiter par les services/hooks).
IDENTITÉ VISUELLE
Le rendu doit être sobre, professionnel, "soft" et responsive (desktop + tablette + mobile), digne d'un outil métier livré à une entreprise nationale d'électricité. Inspire-toi de la charte SOCADEL/ENEO :
Couleur primaire — Vert énergie : #00A651 (nature, durabilité, énergie) — pour les actions principales, statuts "OK/validé", éléments actifs.
Couleur secondaire — Bleu confiance : #0072BC (transparence, sérénité, fiabilité) — pour la navigation, les liens, les graphiques secondaires.
Accent — Orange/ambre : #F5A623 (à utiliser avec parcimonie) — statuts "en attente de validation", alertes non bloquantes.
Rouge doux : #E5484D — statuts "KO"/erreurs, désactivé/faible saturation pour rester "soft" (pas de rouge criard).
Fond : blancs cassés / gris très clairs (#F7F9FA, #FFFFFF), cartes avec ombres légères et coins arrondis (rounded-2xl), beaucoup d'espace blanc.
Typographie : sans-serif moderne et lisible (type Inter/Poppins), hiérarchie claire des titres.
Utilise des dégradés doux, des icônes fines (lucide-react), des tableaux et cartes avec bonne lisibilité des données chiffrées (probabilités, scores, montants).
Le logo SOCADEL n'est pas encore fourni : prévois un emplacement logo en haut de la sidebar/topbar (texte "SOCADEL" stylisé en attendant).
STRUCTURE DE L'APPLICATION
1. Authentification
Écran de connexion (/login) : email/identifiant + mot de passe, logo SOCADEL, design centré et épuré.
Gestion d'état "connecté / non connecté" avec redirection vers /dashboard après connexion.
2. Layout général
Sidebar de navigation fixe (icônes + libellés) avec les sections : Tableau de bord, Contrôle des images, Vérification manuelle, Évaluation des agents, Extraction & résultats, Facturation, Prédictions.
Topbar avec nom de l'expert connecté, notifications (images en attente de validation), bouton déconnexion.
Sidebar collapsible en version mobile (menu burger).
3. Tableau de bord (/dashboard)
Cartes de synthèse : nb images traitées aujourd'hui, taux d'images OK/KO, nb images en attente de validation, montant total facturé sur la période.
Graphique de répartition des statuts d'images (OK / KO / En attente) — camembert ou barres.
Graphique d'évolution du taux d'exploitabilité par agent (courbe/barres).
4. Contrôle des images (/images) — correspond à CU01
Zone de dépôt/chargement des images (drag & drop, multi-fichiers).
Tableau/grille des images avec : miniature, agent, date/heure, numéro de compteur, statut (badge coloré OK/KO/En attente), score de confiance (%).
Filtres par statut, agent, période.
Clic sur une image → panneau de détail (grande image + métadonnées + score).
5. Vérification manuelle (/verification) — correspond à CU02
Liste des images dont le score de confiance est dans l'intervalle d'incertitude (42–96%, cf. logique métier).
Vue de validation : image en grand + score IA affiché + deux boutons clairs "Valider (exploitable)" / "Invalider (non exploitable)".
Compteur du nombre d'images restantes à traiter.
6. Évaluation des agents (/agents) — correspond à CU03
Liste des agents avec leur taux d'exploitabilité (barre de progression colorée).
Sélecteur de période (date début/fin).
Fiche détaillée par agent : historique des taux, nombre d'images soumises, courbe de tendance.
7. Extraction & résultats (/extraction) — correspond à CU04
Tableau des images validées (statut OK) avec : numéro de compteur extrait, index de consommation extrait, score d'extraction (%), statut ("Enregistré" si score > 75, "À vérifier" sinon).
Bouton "Lancer l'extraction" sur une image ou en lot.
Export CSV (bouton, appelle un endpoint dédié).
8. Facturation (/facturation) — correspond à CU05
Recherche d'un abonné par numéro de compteur.
Fiche abonné : dernier index facturé, nouvel index extrait, consommation calculée, montant à payer.
Distinction visuelle entre "facturation abonné normale" et "facturation spéciale" (estimative, si pas d'index exploitable).
Historique des factures (tableau paginé).
9. Visualiser les prédictions (/predictions) — correspond à CU06
Interface de suivi : sélection de période, tableau des prédictions (image, statut prédit, valeurs extraites, score de confiance) en regard des images.
État vide clair ("Aucune prédiction disponible pour cette période").
MODÈLES DE DONNÉES (à respecter dans les types TypeScript)
type StatutImage = "OK" | "KO" | "EnAttenteValidation";

interface Image {
  id_image: number;
  cheminFichier: string;
  numeroCompteur: string;
  premise: string;
  dateCreation: string;
  heureCreation: string;
  codeAnomalie?: string;
  codeAnomaliePhoto?: string;
  codeActivite?: string;
  statut: StatutImage;
  probabiliteClassification: number; // 0-100
  scoreExtraction?: number; // 0-100
  agentId: number;
}

interface Agent {
  id_agent: number;
  nom: string;
}

interface RapportAgent {
  agentId: number;
  periode: string;
  tauxExploitabilite: number; // 0-100
}

interface Compteur {
  numeroCompteur: string;
  index: number;
}

interface Releve {
  id_releve: number;
  numeroCompteur: string;
  index: string;
  dateReleve: string;
}

interface Facture {
  id_facture: number;
  numeroCompteur: string;
  montant: number;
  type: "abonne" | "speciale";
  dateEmission: string;
}

ENDPOINTS BACKEND À PRÉVOIR (Python/FastAPI + PostgreSQL — pas à coder, juste à câbler)
Structure tous les appels dans src/services/ (un fichier par domaine), avec gestion des états loading / error / success via hooks (useImages, useAgents, etc.). Base URL : import.meta.env.VITE_API_BASE_URL.
Auth
POST /api/auth/login — body { email, password } → { token, expert: {id, nom} }
POST /api/auth/logout
Images / Contrôle
GET /api/images?statut=&agentId=&dateDebut=&dateFin=&page= — liste paginée
POST /api/images/upload — multipart, upload d'une ou plusieurs images
GET /api/images/{id} — détail d'une image
GET /api/images/en-attente-validation — images CU02
PATCH /api/images/{id}/valider — body { decision: "valide" | "invalide" }
Agents
GET /api/agents
GET /api/agents/{id}/rapport?periode=
GET /api/rapports-agents?periode= — pour le dashboard
Extraction
POST /api/images/{id}/extraction — lance l'extraction OCR
POST /api/extraction/batch — lance en lot
GET /api/extraction/resultats?statut=&page=
GET /api/extraction/export-csv
Prédictions
GET /api/predictions?periode=
Compteurs / Facturation
GET /api/compteurs/{numero}
GET /api/compteurs/{numero}/releves
POST /api/facturation/{numeroCompteur} — calcule et enregistre la facture
GET /api/factures?page=&numeroCompteur=
GET /api/factures/{id}
Dashboard
GET /api/dashboard/stats?periode=
Chaque appel doit gérer proprement les erreurs réseau (toast/notification discrète) et les états de chargement (skeletons, pas de spinners bruts).
EXIGENCES TECHNIQUES FINALES
Stack : React + TypeScript + Tailwind CSS + shadcn/ui + lucide-react pour les icônes + recharts pour les graphiques.
100% responsive (mobile, tablette, desktop) — tester particulièrement les tableaux (scroll horizontal propre sur mobile, ou vue carte alternative).
Composants réutilisables : StatusBadge, ConfidenceScore, DataTable, PageHeader, EmptyState, LoadingSkeleton.
Prévoir les états vides et les états d'erreur pour chaque page (pas seulement le "happy path").
Accessibilité de base (contrastes suffisants malgré la palette "soft", labels sur les formulaires).
Structure de dossiers claire : src/pages, src/components, src/services, src/types, src/hooks.
N'implémente aucune logique de calcul métier (extraction OCR, classification IA, calcul de facture) : ce sont des appels API à afficher, pas des simulations locales complexes.
Livre une application cohérente, prête à être branchée sur le backend Python/PostgreSQL décrit ci-dessus.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://meter-read-insight.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/50094ec4-500b-40be-98a1-7ea32c0abdaa).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
