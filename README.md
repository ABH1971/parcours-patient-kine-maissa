# Assistant de préparation de consultation — cabinet de Maïssa

Ce n'est **pas** un concurrent de Doctolib. Doctolib reste le seul endroit qui gère le rendez-vous, l'identité complète du patient, ses documents officiels et son dossier médical.

Cet outil ajoute une seule chose que Doctolib Kiné ne fait pas encore : un **questionnaire d'anamnèse adapté à la pathologie**, envoyé après la prise de rendez-vous, dont la réponse est transformée automatiquement en une **note de préparation clinique** pour Maïssa, exportable en PDF pour être déposée dans le dossier Doctolib du patient (via le dossier synchronisé « Doctolib Documents »).

```
Doctolib (RDV pris) → lien questionnaire kiné → questionnaire selon la pathologie
→ synthèse automatique → PDF de bilan → dossier Doctolib du patient
```

## Installation

```bash
npm install
copy .env.example .env
```

Ouvrir `.env` et changer `ADMIN_PASSWORD` (mot de passe de l'espace cabinet). Le champ `DOCTOLIB_SYNC_DIR` est optionnel : si vous pointez vers le dossier local synchronisé par le client de bureau Doctolib Documents, chaque bilan y sera aussi déposé automatiquement.

## Lancer

```bash
npm start
```

- Espace cabinet (Maïssa) : http://localhost:3000/admin.html
- Lien à envoyer au patient (par SMS ou message Doctolib) : http://localhost:3000/patient/xxxxx

## Ce que ça fait

1. Le patient a déjà pris rendez-vous sur Doctolib. Maïssa crée un dossier dans l'espace cabinet → lien unique généré, avec un texte prêt à coller dans un SMS ou dans la messagerie patient Doctolib.
2. Le patient ouvre le lien sur son mobile : civilité/nom (juste de quoi personnaliser le bilan, pas une nouvelle fiche d'identité), motif et localisation, depuis quand et comment c'est apparu, douleur au repos/en mouvement/la nuit, contexte professionnel et sportif, antécédents, un **questionnaire spécifique qui change selon la zone** (genou, épaule, lombalgie, cervicales, cheville, post-opératoire, sport, neurologique), objectifs, et éventuellement des documents s'ils n'ont pas déjà été transmis via Doctolib.
3. Une synthèse en prose est générée automatiquement, sur le modèle :
   ```
   Préparation séance – Mme Dupont
   Douleur épaule droite depuis 4 mois, apparition progressive.
   EVA : 7/10 en mouvement, 3/10 au repos.
   Douleur nocturne présente.
   ...
   Objectif patient : reprendre le tennis.
   ```
4. Maïssa consulte cette fiche dans l'espace cabinet avant le rendez-vous, et peut télécharger un **PDF de bilan pré-consultation** (`Bilan-preconsultation-NOM-date.pdf`) à déposer dans le dossier du patient sur Doctolib.

## Limite technique assumée

Il n'existe pas, à notre connaissance, d'API publique Doctolib permettant à une application tierce d'écrire directement dans le dossier médical d'un patient. Le seul mécanisme documenté est l'import de documents (dossier synchronisé « Doctolib Documents », ou dépôt manuel). C'est donc ce chemin qui est utilisé ici : on produit un PDF propre, pas une écriture directe dans Doctolib.

## Important — données de santé (RGPD)

Les informations saisies (motif, antécédents, douleur, documents médicaux) sont des données de santé, une catégorie particulièrement protégée par le RGPD.

Cette version tourne avec une base SQLite locale au serveur. **Avant tout usage avec de vrais patients au-delà d'un test interne**, il faut :

- héberger l'application sur un hébergeur certifié **HDS** (Hébergeur de Données de Santé) — ex. OVHcloud HDS, Scaleway HDS, ou un hébergeur cloud avec accord de sous-traitance HDS ;
- ajouter une information / un consentement du patient sur l'usage de ses données ;
- changer le mot de passe par défaut de l'espace cabinet ;
- prévoir une politique de conservation et de suppression des dossiers.

Tant que ce point n'est pas réglé, n'utiliser l'outil qu'avec des cas fictifs ou en test interne. La version de démonstration hébergée se réinitialise automatiquement avec des exemples fictifs (aucune vraie donnée patient).

## Limites connues de cette version

- Pas d'envoi automatique du lien (fait à la main par Maïssa, via SMS ou messagerie Doctolib).
- Un seul mot de passe pour tout le cabinet (pas de comptes multi-utilisateurs).
- La synthèse est générée par des règles à partir du formulaire, pas par un modèle d'IA générative — c'est volontaire pour l'instant : zéro risque d'invention d'un fait clinique.
- Les questionnaires spécifiques par pathologie sont des points cliniques utiles, pas des échelles validées (type KOOS, Oswestry...) — à faire évoluer avec Maïssa si besoin.
- Pas de dépôt automatique réel dans Doctolib testé (le dossier synchronisé `DOCTOLIB_SYNC_DIR` est prêt côté code mais suppose que le client de bureau Doctolib Documents est installé et configuré sur le poste du cabinet).

## V2 envisagée (après la séance)

Suivi post-séance : exercices prescrits, vidéos, rappels, questionnaire à J+3/J+7 sur la douleur et la mobilité, synthèse automatique avant la séance suivante.
