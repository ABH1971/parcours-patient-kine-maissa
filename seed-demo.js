const crypto = require('crypto');
const { genererSynthese } = require('./synthese');

// Jeu de donnees fictif, uniquement pour montrer le fonctionnement de l'outil.
// Ne seme que si la base est vide, donc n'ecrase jamais de vraies donnees.
function seedDemoData(db) {
  const { count } = db.prepare('SELECT COUNT(*) as count FROM patients').get();
  if (count > 0) return;

  const patientsDemo = [
    {
      label: 'Exemple — M. Karim Haddad, genou (démo)',
      formData: {
        identite: { civilite: 'M.', prenom: 'Karim', nom: 'Haddad' },
        categorieMotif: 'genou',
        motif: 'Douleur au genou droit, face interne',
        zoneDouloureuse: 'genou droit, face interne',
        medecinPrescripteur: 'Dr Rousseau',
        ancienneteDouleur: '6 semaines',
        circonstancesApparition: 'operation',
        circonstancesDetail: 'suites de ligamentoplastie du LCA',
        douleurRepos: 2,
        douleurMouvement: 5,
        douleurNocturne: false,
        limitationsQuotidien: 'Marche avec une légère boiterie, ne peut pas encore courir ni monter les escaliers normalement',
        activiteProfessionnelle: 'Travail debout toute la journée (vendeur)',
        sportPratique: 'Football en club, 2 entraînements + 1 match par semaine, actuellement à l\'arrêt',
        antecedents: 'Entorse du genou droit il y a 5 ans',
        traitementsEnCours: 'Anti-inflammatoires en fin de traitement',
        operationsAnterieures: 'Ligamentoplastie du LCA, il y a 6 semaines',
        objectifs: 'Retrouver un genou stable pour reprendre le foot en club',
        questionnaireSpecifique: [
          { question: 'Le genou est-il gonflé actuellement ?', reponse: 'oui' },
          { question: "Avez-vous une sensation d'instabilité, comme si le genou allait lâcher ?", reponse: 'oui' },
          { question: 'Douleur en montant ou descendant les escaliers ?', reponse: 'oui' },
          { question: 'Douleur en position accroupie ?', reponse: 'oui' },
        ],
      },
      documents: [],
    },
    {
      label: 'Exemple — Mme Dupont, épaule (démo)',
      formData: {
        identite: { civilite: 'Mme', prenom: 'Claire', nom: 'Dupont' },
        categorieMotif: 'epaule',
        motif: 'Douleur épaule droite',
        zoneDouloureuse: 'épaule droite',
        medecinPrescripteur: 'Dr Petit',
        ancienneteDouleur: '4 mois',
        circonstancesApparition: 'progressive',
        circonstancesDetail: '',
        douleurRepos: 3,
        douleurMouvement: 7,
        douleurNocturne: true,
        limitationsQuotidien: "Difficulté à s'habiller et à lever le bras au-dessus de la tête",
        activiteProfessionnelle: 'Travail sur ordinateur',
        sportPratique: 'Tennis 2 fois par semaine, actuellement interrompu',
        antecedents: 'Aucun antécédent particulier',
        traitementsEnCours: 'Paracétamol si besoin',
        operationsAnterieures: '',
        objectifs: 'Reprendre le tennis',
        questionnaireSpecifique: [
          { question: 'La douleur augmente-t-elle quand vous levez le bras au-dessus de la tête ?', reponse: 'oui' },
          { question: 'Douleur la nuit quand vous êtes allongé sur ce côté ?', reponse: 'oui' },
          { question: "Sensation de blocage ou d'accrochage dans l'épaule ?", reponse: 'non' },
          { question: 'Difficulté à attraper un objet placé dans le dos ?', reponse: 'oui' },
        ],
      },
      documents: [],
    },
  ];

  const insertPatient = db.prepare(
    "INSERT INTO patients (token, label, rdv_date, status, form_data, synthese, submitted_at) VALUES (?, ?, NULL, 'rempli', ?, ?, datetime('now'))"
  );

  for (const p of patientsDemo) {
    const token = crypto.randomBytes(12).toString('hex');
    const fiche = genererSynthese(p.formData, p.documents);
    insertPatient.run(token, p.label, JSON.stringify(p.formData), JSON.stringify(fiche));
  }

  // Un dossier "en attente" pour montrer aussi cet etat dans le tableau de bord
  const tokenAttente = crypto.randomBytes(12).toString('hex');
  db.prepare(
    "INSERT INTO patients (token, label, rdv_date, status) VALUES (?, ?, NULL, 'en_attente')"
  ).run(tokenAttente, 'Exemple — Nouveau patient (démo, formulaire pas encore rempli)');

  console.log('Donnees de demo inserees (base vide au demarrage).');
}

module.exports = { seedDemoData };
