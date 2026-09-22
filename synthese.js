const LABELS_CIRCONSTANCES = {
  progressive: 'apparition progressive, sans événement particulier',
  effort: "apparition suite à un effort inhabituel",
  traumatisme: 'apparition suite à un choc ou une chute',
  operation: 'apparition suite à une opération',
  autre: '',
};

function ligneCirconstances(data) {
  const base = LABELS_CIRCONSTANCES[data.circonstancesApparition] || '';
  const detail = data.circonstancesDetail ? ` (${data.circonstancesDetail})` : '';
  if (!base && !detail) return '';
  return `${base}${detail}`.trim();
}

// Construit la fiche affichee au kine : un objet structure (utilise par l'espace
// cabinet) + un texte en prose "resume" utilisable tel quel comme note de preparation.
function genererSynthese(data, documents) {
  const identite = data.identite || {};
  const nomComplet = [identite.civilite, identite.nom].filter(Boolean).join(' ') || 'Patient';

  const lignes = [];

  // Ligne 1 : motif + localisation + anciennete + circonstances
  let ligne1 = data.motif || data.zoneDouloureuse
    ? `${data.motif || `Douleur ${data.zoneDouloureuse}`}`
    : 'Motif non précisé';
  if (data.zoneDouloureuse && data.motif && !data.motif.toLowerCase().includes(data.zoneDouloureuse.toLowerCase())) {
    ligne1 += ` (${data.zoneDouloureuse})`;
  }
  if (data.ancienneteDouleur) ligne1 += ` depuis ${data.ancienneteDouleur}`;
  const circonstances = ligneCirconstances(data);
  if (circonstances) ligne1 += `, ${circonstances}`;
  lignes.push(ligne1 + '.');

  // Ligne 2 : EVA repos / mouvement / nuit
  const eva = [];
  if (data.douleurMouvement !== undefined && data.douleurMouvement !== '') {
    eva.push(`${data.douleurMouvement}/10 en mouvement`);
  }
  if (data.douleurRepos !== undefined && data.douleurRepos !== '') {
    eva.push(`${data.douleurRepos}/10 au repos`);
  }
  if (eva.length > 0) {
    lignes.push(`EVA : ${eva.join(', ')}.`);
  }
  if (data.douleurNocturne) lignes.push('Douleur nocturne présente.');

  // Ligne : limitations
  if (data.limitationsQuotidien) {
    lignes.push(`${data.limitationsQuotidien}.`);
  }

  // Ligne : contexte pro / sportif
  if (data.activiteProfessionnelle) lignes.push(`${data.activiteProfessionnelle}.`);
  if (data.sportPratique) lignes.push(`${data.sportPratique}.`);

  // Antecedents / traitements / operations
  if (data.antecedents) lignes.push(`Antécédents : ${data.antecedents}.`);
  if (data.traitementsEnCours) lignes.push(`Traitements en cours : ${data.traitementsEnCours}.`);
  if (data.operationsAnterieures) lignes.push(`Opérations antérieures : ${data.operationsAnterieures}.`);

  // Points issus du questionnaire specifique, seulement les reponses "oui" ou renseignees
  const pointsSpecifiques = (data.questionnaireSpecifique || [])
    .filter((q) => q.reponse === 'oui' || (q.reponse && q.reponse !== 'non'))
    .map((q) => q.question.replace(/\s*\?\s*$/, ''));
  if (pointsSpecifiques.length > 0) {
    lignes.push(`Points signalés : ${pointsSpecifiques.join(' ; ')}.`);
  }

  // Objectif
  if (data.objectifs) lignes.push(`Objectif patient : ${data.objectifs}.`);

  // Documents
  const nomsDocuments = (documents || []).map((d) => d.original_name || d.nom).filter(Boolean);
  lignes.push(
    nomsDocuments.length > 0
      ? `Documents disponibles : ${nomsDocuments.join(', ')}.`
      : 'Documents disponibles : aucun (à vérifier dans Doctolib).'
  );

  lignes.push('Points à approfondir lors du bilan : …');

  const resumeProse = [`Préparation séance – ${nomComplet}`, ...lignes].join('\n');
  const resumeCourt = lignes.slice(0, 3).join(' ');

  return {
    resume: resumeCourt,
    resumeProse,
    identite: {
      civilite: identite.civilite || '',
      nom: identite.nom || '',
      prenom: identite.prenom || '',
      nomAffiche: nomComplet,
    },
    medecinPrescripteur: data.medecinPrescripteur || '',
    motif: data.motif || '',
    categorieMotif: data.categorieMotif || '',
    zoneDouloureuse: data.zoneDouloureuse || '',
    ancienneteDouleur: data.ancienneteDouleur || '',
    circonstancesApparition: data.circonstancesApparition || '',
    circonstancesDetail: data.circonstancesDetail || '',
    douleurRepos: data.douleurRepos ?? '',
    douleurMouvement: data.douleurMouvement ?? '',
    douleurNocturne: !!data.douleurNocturne,
    limitationsQuotidien: data.limitationsQuotidien || '',
    activiteProfessionnelle: data.activiteProfessionnelle || '',
    sportPratique: data.sportPratique || '',
    antecedents: data.antecedents || '',
    traitementsEnCours: data.traitementsEnCours || '',
    operationsAnterieures: data.operationsAnterieures || '',
    objectifs: data.objectifs || '',
    questionnaireSpecifique: Array.isArray(data.questionnaireSpecifique) ? data.questionnaireSpecifique : [],
    documents: (documents || []).map((d) => ({ id: d.id, nom: d.original_name || d.nom })),
  };
}

module.exports = { genererSynthese };
