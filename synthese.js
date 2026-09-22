function calculerAge(dateNaissance) {
  if (!dateNaissance) return null;
  const naissance = new Date(dateNaissance);
  if (Number.isNaN(naissance.getTime())) return null;
  const aujourdhui = new Date();
  let age = aujourdhui.getFullYear() - naissance.getFullYear();
  const m = aujourdhui.getMonth() - naissance.getMonth();
  if (m < 0 || (m === 0 && aujourdhui.getDate() < naissance.getDate())) age--;
  return age;
}

function genererSynthese(data, documents) {
  const age = calculerAge(data.identite?.dateNaissance);
  const parts = [];

  const identite = data.identite?.prenom || data.identite?.nom
    ? `Patient${age ? ` de ${age} ans` : ''} (${[data.identite?.prenom, data.identite?.nom].filter(Boolean).join(' ')})`
    : `Patient${age ? ` de ${age} ans` : ''}`;
  parts.push(identite);

  if (data.zoneDouloureuse) {
    let ligne = `douleur ${data.zoneDouloureuse}`;
    if (data.ancienneteDouleur) ligne += ` depuis ${data.ancienneteDouleur}`;
    parts.push(ligne);
  }

  if (data.intensiteDouleur !== undefined && data.intensiteDouleur !== '') {
    parts.push(`intensite ${data.intensiteDouleur}/10`);
  }

  if (data.douleurNocturne) parts.push('douleur nocturne');

  if (data.limitationsQuotidien) {
    parts.push(`gene au quotidien : ${data.limitationsQuotidien}`);
  }

  if (documents && documents.length > 0) {
    parts.push(`${documents.length} document(s) joint(s)`);
  }

  if (data.objectifs) {
    parts.push(`objectif : ${data.objectifs}`);
  }

  const ligneResume = parts.join(', ') + '.';

  const fiche = {
    resume: ligneResume,
    identite: {
      nom: data.identite?.nom || '',
      prenom: data.identite?.prenom || '',
      age,
      telephone: data.identite?.telephone || '',
      email: data.identite?.email || '',
    },
    medecinPrescripteur: data.medecinPrescripteur || '',
    motif: data.motif || '',
    categorieMotif: data.categorieMotif || '',
    antecedents: data.antecedents || '',
    traitementsEnCours: data.traitementsEnCours || '',
    zoneDouloureuse: data.zoneDouloureuse || '',
    ancienneteDouleur: data.ancienneteDouleur || '',
    intensiteDouleur: data.intensiteDouleur ?? '',
    douleurNocturne: !!data.douleurNocturne,
    limitationsQuotidien: data.limitationsQuotidien || '',
    operationsAnterieures: data.operationsAnterieures || '',
    objectifs: data.objectifs || '',
    questionnaireSpecifique: Array.isArray(data.questionnaireSpecifique) ? data.questionnaireSpecifique : [],
    documents: (documents || []).map((d) => ({ id: d.id, nom: d.original_name })),
  };

  return fiche;
}

module.exports = { genererSynthese, calculerAge };
