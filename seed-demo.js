const crypto = require('crypto');
const { genererSynthese } = require('./synthese');

// Jeu de donnees fictif, uniquement pour montrer le fonctionnement de l'outil.
// Ne seme que si la base est vide, donc n'ecrase jamais de vraies donnees.
function seedDemoData(db) {
  const { count } = db.prepare('SELECT COUNT(*) as count FROM patients').get();
  if (count > 0) return;

  const patientsDemo = [
    {
      label: 'Exemple — Sophie Lambert (démo)',
      rdvDate: null,
      formData: {
        identite: { prenom: 'Sophie', nom: 'Lambert', dateNaissance: '1984-02-10', telephone: '06 00 00 00 00', email: '' },
        categorieMotif: 'epaule',
        motif: "Douleur à l'épaule droite qui gêne pour lever le bras",
        medecinPrescripteur: 'Dr Petit',
        antecedents: 'Aucun antécédent particulier',
        traitementsEnCours: 'Paracétamol si besoin',
        operationsAnterieures: '',
        zoneDouloureuse: 'épaule droite',
        ancienneteDouleur: '3 mois',
        intensiteDouleur: 6,
        douleurNocturne: true,
        limitationsQuotidien: "Difficile de s'habiller et de lever le bras au-dessus de la tête",
        objectifs: 'Reprendre le sport (tennis)',
        questionnaireSpecifique: [
          { question: 'La douleur augmente-t-elle quand vous levez le bras au-dessus de la tête ?', reponse: 'oui' },
          { question: 'Douleur la nuit quand vous êtes allongé sur ce côté ?', reponse: 'oui' },
          { question: "Sensation de blocage ou d'accrochage dans l'épaule ?", reponse: 'non' },
          { question: 'Difficulté à attraper un objet placé dans le dos ?', reponse: 'oui' },
        ],
      },
      documents: [],
    },
    {
      label: 'Exemple — Karim Haddad (démo)',
      rdvDate: null,
      formData: {
        identite: { prenom: 'Karim', nom: 'Haddad', dateNaissance: '1990-07-22', telephone: '', email: '' },
        categorieMotif: 'genou',
        motif: 'Suites de ligamentoplastie du genou gauche',
        medecinPrescripteur: 'Dr Rousseau',
        antecedents: 'Entorse du genou gauche il y a 5 ans',
        traitementsEnCours: 'Aucun',
        operationsAnterieures: 'Ligamentoplastie LCA, il y a 6 semaines',
        zoneDouloureuse: 'genou gauche',
        ancienneteDouleur: '6 semaines (post-opératoire)',
        intensiteDouleur: 4,
        douleurNocturne: false,
        limitationsQuotidien: 'Marche avec une légère boiterie, ne peut pas encore courir',
        objectifs: 'Retrouver un genou stable pour reprendre le foot',
        questionnaireSpecifique: [
          { question: "Date de l'opération", reponse: 'il y a 6 semaines' },
          { question: 'Type d\'intervention (si vous le savez)', reponse: 'Ligamentoplastie du LCA' },
          { question: 'Chirurgien / clinique', reponse: 'Dr Rousseau — Clinique du Parc' },
          { question: 'Consignes particulières données par le chirurgien', reponse: 'Pas de course avant le feu vert du kiné' },
        ],
      },
      documents: [],
    },
  ];

  const insertPatient = db.prepare(
    "INSERT INTO patients (token, label, rdv_date, status, form_data, synthese, submitted_at) VALUES (?, ?, ?, 'rempli', ?, ?, datetime('now'))"
  );

  for (const p of patientsDemo) {
    const token = crypto.randomBytes(12).toString('hex');
    const fiche = genererSynthese(p.formData, p.documents.map((d) => ({ id: d.id, original_name: d.original_name })));
    insertPatient.run(token, p.label, p.rdvDate, JSON.stringify(p.formData), JSON.stringify(fiche));
  }

  // Un dossier "en attente" pour montrer aussi cet etat dans le tableau de bord
  const tokenAttente = crypto.randomBytes(12).toString('hex');
  db.prepare(
    "INSERT INTO patients (token, label, rdv_date, status) VALUES (?, ?, ?, 'en_attente')"
  ).run(tokenAttente, 'Exemple — Nouveau patient (démo, formulaire pas encore rempli)', null);

  console.log('Donnees de demo inserees (base vide au demarrage).');
}

module.exports = { seedDemoData };
