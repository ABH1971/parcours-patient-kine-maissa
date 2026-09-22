# Parcours patient — cabinet de Maïssa

Version 1 du parcours décrit dans l'idée d'Ali : SMS → formulaire → documents → synthèse → fiche prête avant le rendez-vous.

Le SMS est envoyé à la main depuis le téléphone de Maïssa (pas d'API SMS branchée dans cette v1). L'appli génère juste le lien et un texte prêt à copier-coller.

## Installation

```bash
npm install
copy .env.example .env
```

Ouvrir `.env` et changer `ADMIN_PASSWORD` (c'est le mot de passe de l'espace cabinet).

## Lancer

```bash
npm start
```

- Espace cabinet (Maïssa) : http://localhost:3000/admin.html
- Le lien à envoyer au patient ressemble à : http://localhost:3000/patient/xxxxx

## Ce que ça fait

1. Maïssa crée un patient dans l'espace cabinet → un lien unique est généré + un texte prêt à coller dans un SMS.
2. Elle envoie ce SMS elle-même depuis son téléphone.
3. Le patient ouvre le lien sur son mobile, remplit le formulaire (identité, motif, antécédents, douleur, questions spécifiques selon la zone, objectifs) et peut prendre en photo ses documents (ordonnance, imagerie, comptes rendus).
4. Une fiche synthétique est générée automatiquement et apparaît dans l'espace cabinet dès que le patient a validé.
5. Maïssa consulte la fiche + les documents avant le rendez-vous.

## Important — données de santé (RGPD)

Les informations saisies (motif, antécédents, douleur, documents médicaux) sont des données de santé, une catégorie particulièrement protégée par le RGPD.

Cette v1 tourne en local avec une base SQLite sur le poste où elle est installée. **Avant tout usage avec de vrais patients au-delà d'un test interne**, il faut :

- héberger l'application sur un hébergeur certifié **HDS** (Hébergeur de Données de Santé) si elle est mise en ligne — ex. OVHcloud HDS, Scaleway HDS, ou un hébergeur cloud avec un accord de sous-traitance HDS ;
- ajouter une information / un consentement du patient sur l'usage de ses données (mention en bas du formulaire) ;
- changer le mot de passe par défaut de l'espace cabinet ;
- prévoir une politique de conservation et de suppression des dossiers.

Tant que ce point n'est pas réglé, n'utiliser l'outil qu'avec des cas fictifs ou en test interne.

## Limites connues de cette v1

- Pas d'envoi de SMS automatique (fait à la main par Maïssa).
- Un seul mot de passe pour tout le cabinet (pas de comptes multi-utilisateurs).
- La synthèse est générée par des règles simples à partir du formulaire, pas par une IA (peut être ajouté ensuite si utile).
- Pas encore de version anglaise / autre langue.
